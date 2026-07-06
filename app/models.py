from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=True)
    role = Column(String(20), default="user", nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    submissions = relationship("FormSubmission", back_populates="user")


class FormTemplate(Base):
    __tablename__ = "form_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    style_config = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    fields = relationship("FormField", back_populates="template", cascade="all, delete-orphan")
    submissions = relationship("FormSubmission", back_populates="template")


class FormField(Base):
    __tablename__ = "form_fields"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("form_templates.id"), nullable=False)
    section = Column(String(100), nullable=True)
    field_number = Column(Integer, nullable=True)
    label = Column(String(500), nullable=False)
    field_type = Column(String(50), default="checkbox")
    options = Column(JSON, default=list)
    sort_order = Column(Integer, default=0)
    is_required = Column(Boolean, default=False)

    template = relationship("FormTemplate", back_populates="fields")
    answers = relationship("SubmissionAnswer", back_populates="field")


class FormSubmission(Base):
    __tablename__ = "form_submissions"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("form_templates.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    customer = Column(String(200), nullable=True)
    contact_person = Column(String(200), nullable=True)
    inspection_date = Column(String(50), nullable=True)
    machine_type = Column(String(200), nullable=True)
    serial_no = Column(String(200), nullable=True)
    machine_status = Column(Text, nullable=True)
    action_taken = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)
    engineer_signature = Column(Text, nullable=True)
    engineer_name = Column(String(200), nullable=True)
    customer_signature = Column(Text, nullable=True)
    customer_name = Column(String(200), nullable=True)
    time_in = Column(String(20), nullable=True)
    time_out = Column(String(20), nullable=True)
    footer_options = Column(JSON, default=dict)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    template = relationship("FormTemplate", back_populates="submissions")
    user = relationship("User", back_populates="submissions")
    answers = relationship("SubmissionAnswer", back_populates="submission", cascade="all, delete-orphan")


class SubmissionAnswer(Base):
    __tablename__ = "submission_answers"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("form_submissions.id"), nullable=False)
    field_id = Column(Integer, ForeignKey("form_fields.id"), nullable=False)
    value = Column(String(500), nullable=True)

    submission = relationship("FormSubmission", back_populates="answers")
    field = relationship("FormField", back_populates="answers")
