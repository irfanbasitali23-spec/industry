from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import FormField, FormSubmission, FormTemplate, SubmissionAnswer, User
from app.schemas import FormFieldResponse, SubmissionCreate, SubmissionResponse

router = APIRouter(prefix="/api/forms", tags=["forms"])


@router.get("/template")
def get_active_template(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    template = db.query(FormTemplate).filter(FormTemplate.is_active == True).first()
    if not template:
        raise HTTPException(status_code=404, detail="No active form template")
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


@router.post("/submit", response_model=SubmissionResponse)
def submit_form(
    data: SubmissionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    template = db.query(FormTemplate).filter(FormTemplate.is_active == True).first()
    if not template:
        raise HTTPException(status_code=404, detail="No active form template")

    submission = FormSubmission(
        template_id=template.id,
        user_id=user.id,
        customer=data.customer,
        contact_person=data.contact_person,
        inspection_date=data.inspection_date,
        machine_type=data.machine_type,
        serial_no=data.serial_no,
        machine_status=data.machine_status,
        action_taken=data.action_taken,
        remarks=data.remarks,
        engineer_signature=data.engineer_signature,
        engineer_name=data.engineer_name,
        customer_signature=data.customer_signature,
        customer_name=data.customer_name,
        time_in=data.time_in,
        time_out=data.time_out,
        footer_options=data.footer_options or {},
    )
    db.add(submission)
    db.flush()

    for field_id_str, value in data.answers.items():
        if value:
            db.add(SubmissionAnswer(
                submission_id=submission.id,
                field_id=int(field_id_str),
                value=value,
            ))

    db.commit()
    db.refresh(submission)
    result = SubmissionResponse.model_validate(submission)
    result.username = user.username
    result.full_name = user.full_name
    return result


@router.get("/my-submissions", response_model=List[SubmissionResponse])
def my_submissions(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    submissions = (
        db.query(FormSubmission)
        .filter(FormSubmission.user_id == user.id)
        .order_by(FormSubmission.submitted_at.desc())
        .all()
    )
    results = []
    for s in submissions:
        r = SubmissionResponse.model_validate(s)
        r.username = user.username
        r.full_name = user.full_name
        results.append(r)
    return results


@router.get("/submission/{submission_id}")
def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    submission = db.query(FormSubmission).filter(FormSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if user.role != "admin" and submission.user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    fields = (
        db.query(FormField)
        .filter(FormField.template_id == submission.template_id)
        .order_by(FormField.sort_order)
        .all()
    )
    answers = {a.field_id: a.value for a in submission.answers}
    submitter = db.query(User).filter(User.id == submission.user_id).first()
    template = db.query(FormTemplate).filter(FormTemplate.id == submission.template_id).first()

    return {
        "submission": SubmissionResponse.model_validate(submission),
        "username": submitter.username if submitter else None,
        "full_name": submitter.full_name if submitter else None,
        "fields": [FormFieldResponse.model_validate(f) for f in fields],
        "answers": answers,
        "style_config": template.style_config if template else {},
    }
