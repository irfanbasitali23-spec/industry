from sqlalchemy.orm import Session

from app.auth import get_password_hash
from app.config import settings
from app.models import FormField, FormSubmission, FormTemplate, User

TEMPLATE_VERSION = 2

DEFAULT_STYLE = {
    "primary_color": "#1a5fb4",
    "accent_color": "#3584e4",
    "header_bg": "#ffffff",
    "font_family": "Arial, sans-serif",
    "form_title": "Preventive Care Visit",
    "company_name": "DG TECH MACHINERY",
    "column_split": [6, 14, 20],
}

# DG TECH Preventive Care Visit — 20 checklist items (matches paper form)
DEFAULT_FIELDS = [
    # Column 1 — Items 1-6
    {"field_number": 1, "section": "Machine PLC", "label": "Control buttons", "field_type": "checkbox", "options": ["Check"]},
    {"field_number": 1, "section": "Machine PLC", "label": "Check the wiring", "field_type": "checkbox", "options": ["Check"]},
    {"field_number": 2, "section": "Electric Voltage Status", "label": "3 Phase (380V-440V)", "field_type": "checkbox", "options": ["Check"]},
    {"field_number": 2, "section": "Electric Voltage Status", "label": "Single Phase (200V-220V)", "field_type": "checkbox", "options": ["Check"]},
    {"field_number": 2, "section": "Electric Voltage Status", "label": "Transformer voltage", "field_type": "checkbox", "options": ["Check"]},
    {"field_number": 2, "section": "Electric Voltage Status", "label": "DC Voltage (24V)", "field_type": "checkbox", "options": ["Check"]},
    {"field_number": 3, "section": "UPS Status", "label": "UPS Status", "field_type": "radio", "options": ["Working", "Not Working"]},
    {"field_number": 4, "section": "Machine Level", "label": "Machine Level", "field_type": "radio", "options": ["Ok", "Not ok"]},
    {"field_number": 5, "section": "Barrel Temperature", "label": "Nozzle heater", "field_type": "checkbox", "options": ["Check"]},
    {"field_number": 5, "section": "Barrel Temperature", "label": "Zone 1", "field_type": "checkbox", "options": ["Check"]},
    {"field_number": 5, "section": "Barrel Temperature", "label": "Zone 2", "field_type": "checkbox", "options": ["Check"]},
    {"field_number": 5, "section": "Barrel Temperature", "label": "Zone 3", "field_type": "checkbox", "options": ["Check"]},
    {"field_number": 5, "section": "Barrel Temperature", "label": "Zone 4", "field_type": "checkbox", "options": ["Check"]},
    {"field_number": 6, "section": "Chiller Condition", "label": "Chiller Condition", "field_type": "radio", "options": ["Good", "Average", "Bad"]},
    # Column 2 — Items 7-14
    {"field_number": 7, "section": "Hydraulic Oil", "label": "Hydraulic Oil", "field_type": "radio", "options": ["Level Ok", "Level Not ok", "Temp Ok", "Temp Not ok"]},
    {"field_number": 8, "section": "Hydraulic Oil Condition", "label": "Hydraulic Oil Condition", "field_type": "radio", "options": ["Good", "Bad"]},
    {"field_number": 9, "section": "Water of Head Working", "label": "Water of Head Working", "field_type": "radio", "options": ["Yes", "No"]},
    {"field_number": 10, "section": "Lubrication Level", "label": "Lubrication Level", "field_type": "radio", "options": ["Yes", "No"]},
    {"field_number": 11, "section": "Lubrication Circulation", "label": "Lubrication Circulation", "field_type": "radio", "options": ["Yes", "No"]},
    {"field_number": 12, "section": "Grease Guns Working", "label": "Grease Guns Working", "field_type": "radio", "options": ["Yes", "No"]},
    {"field_number": 13, "section": "Grease Level", "label": "Grease Level", "field_type": "radio", "options": ["Yes", "No"]},
    {"field_number": 14, "section": "Chemical Uses in Chiller", "label": "Chemical Uses in Chiller", "field_type": "radio", "options": ["Yes", "No"]},
    # Column 3 — Items 15-20
    {"field_number": 15, "section": "Parts Condition", "label": "Parts Condition", "field_type": "radio", "options": ["Servo Drive Working", "Servo Drive Not Working", "Servo Motor Working", "Servo Motor Not Working"]},
    {"field_number": 16, "section": "Servo Drive Condition", "label": "Servo Drive Condition", "field_type": "radio", "options": ["Good", "Bad"]},
    {"field_number": 17, "section": "Servo Motor Condition", "label": "Servo Motor Condition", "field_type": "radio", "options": ["Good", "Bad"]},
    {"field_number": 18, "section": "Machine Noise", "label": "Machine Noise", "field_type": "radio", "options": ["Unnecessary", "Necessary"]},
    {"field_number": 19, "section": "Air Compressor Maintenance", "label": "Air Compressor Maintenance", "field_type": "radio", "options": ["Yes", "No"]},
    {"field_number": 20, "section": "Operator Follows SOP", "label": "Operator Follows SOP", "field_type": "radio", "options": ["50%", "70%", "90%"]},
]


def _add_fields(db: Session, template_id: int):
    for idx, field_data in enumerate(DEFAULT_FIELDS):
        db.add(FormField(
            template_id=template_id,
            section=field_data["section"],
            field_number=field_data["field_number"],
            label=field_data["label"],
            field_type=field_data.get("field_type", "radio"),
            options=field_data["options"],
            sort_order=idx,
        ))


def _template_has_submissions(db: Session, template_id: int) -> bool:
    return (
        db.query(FormSubmission)
        .filter(FormSubmission.template_id == template_id)
        .count()
        > 0
    )


def _create_template(db: Session) -> FormTemplate:
    template = FormTemplate(
        name="Preventive Care Visit",
        version=TEMPLATE_VERSION,
        is_active=True,
        style_config=DEFAULT_STYLE,
    )
    db.add(template)
    db.flush()
    _add_fields(db, template.id)
    return template


def _seed_template(db: Session):
    template = db.query(FormTemplate).filter(FormTemplate.is_active == True).first()

    if not template:
        _create_template(db)
        return

    if template.version >= TEMPLATE_VERSION:
        return

    # Upgrade needed — never delete fields that existing submissions reference
    if _template_has_submissions(db, template.id):
        template.is_active = False
        _create_template(db)
    else:
        template.name = "Preventive Care Visit"
        template.version = TEMPLATE_VERSION
        template.style_config = DEFAULT_STYLE
        db.query(FormField).filter(FormField.template_id == template.id).delete(
            synchronize_session=False
        )
        db.flush()
        _add_fields(db, template.id)


def seed_database(db: Session):
    if not db.query(User).filter(User.role == "admin").first():
        admin = User(
            username="admin",
            email=settings.admin_email,
            password_hash=get_password_hash(settings.admin_password),
            full_name="System Administrator",
            role="admin",
        )
        db.add(admin)

    if not db.query(User).filter(User.username == "user").first():
        demo_user = User(
            username="user",
            email="user@example.com",
            password_hash=get_password_hash("user123"),
            full_name="Field Engineer",
            role="user",
        )
        db.add(demo_user)

    _seed_template(db)
    db.commit()
