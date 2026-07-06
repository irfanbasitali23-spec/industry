from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_admin, get_password_hash
from app.database import get_db
from app.models import FormField, FormSubmission, FormTemplate, User
from app.schemas import (
    FormFieldCreate,
    FormFieldResponse,
    FormFieldUpdate,
    StyleConfigUpdate,
    SubmissionResponse,
    UserCreate,
    UserResponse,
    UserUpdate,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/submissions", response_model=List[SubmissionResponse])
def list_submissions(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    submissions = db.query(FormSubmission).order_by(FormSubmission.submitted_at.desc()).all()
    results = []
    for s in submissions:
        r = SubmissionResponse.model_validate(s)
        user = db.query(User).filter(User.id == s.user_id).first()
        if user:
            r.username = user.username
            r.full_name = user.full_name
        results.append(r)
    return results


@router.get("/template")
def get_template(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    template = db.query(FormTemplate).filter(FormTemplate.is_active == True).first()
    if not template:
        raise HTTPException(status_code=404, detail="No active template")
    fields = (
        db.query(FormField)
        .filter(FormField.template_id == template.id)
        .order_by(FormField.sort_order)
        .all()
    )
    return {
        "id": template.id,
        "name": template.name,
        "version": template.version,
        "style_config": template.style_config or {},
        "fields": [FormFieldResponse.model_validate(f) for f in fields],
    }


@router.put("/template/style")
def update_style(
    data: StyleConfigUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    template = db.query(FormTemplate).filter(FormTemplate.is_active == True).first()
    if not template:
        raise HTTPException(status_code=404, detail="No active template")
    template.style_config = data.style_config
    db.commit()
    return {"message": "Style updated", "style_config": template.style_config}


@router.post("/fields", response_model=FormFieldResponse)
def add_field(
    data: FormFieldCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    template = db.query(FormTemplate).filter(FormTemplate.is_active == True).first()
    if not template:
        raise HTTPException(status_code=404, detail="No active template")

    field = FormField(
        template_id=template.id,
        section=data.section,
        field_number=data.field_number,
        label=data.label,
        field_type=data.field_type,
        options=data.options,
        sort_order=data.sort_order,
        is_required=data.is_required,
    )
    db.add(field)
    db.commit()
    db.refresh(field)
    return field


@router.put("/fields/{field_id}", response_model=FormFieldResponse)
def update_field(
    field_id: int,
    data: FormFieldUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    field = db.query(FormField).filter(FormField.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(field, key, value)
    db.commit()
    db.refresh(field)
    return field


@router.delete("/fields/{field_id}")
def delete_field(
    field_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    field = db.query(FormField).filter(FormField.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    db.delete(field)
    db.commit()
    return {"message": "Field deleted"}


@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("/users", response_model=UserResponse)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        username=data.username,
        email=data.email,
        password_hash=get_password_hash(data.password),
        full_name=data.full_name,
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = data.model_dump(exclude_unset=True)
    if "password" in update_data:
        user.password_hash = get_password_hash(update_data.pop("password"))
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    user.is_active = False
    db.commit()
    return {"message": "User deactivated"}
