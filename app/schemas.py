from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str
    full_name: Optional[str] = None


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: str = "user"


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class FormFieldCreate(BaseModel):
    section: Optional[str] = None
    field_number: Optional[int] = None
    label: str
    field_type: str = "radio"
    options: List[str] = Field(default_factory=list)
    sort_order: int = 0
    is_required: bool = False


class FormFieldUpdate(BaseModel):
    section: Optional[str] = None
    field_number: Optional[int] = None
    label: Optional[str] = None
    field_type: Optional[str] = None
    options: Optional[List[str]] = None
    sort_order: Optional[int] = None
    is_required: Optional[bool] = None


class FormFieldResponse(BaseModel):
    id: int
    template_id: int
    section: Optional[str]
    field_number: Optional[int]
    label: str
    field_type: str
    options: List[str]
    sort_order: int
    is_required: bool

    class Config:
        from_attributes = True


class StyleConfigUpdate(BaseModel):
    style_config: Dict[str, Any]


class SubmissionCreate(BaseModel):
    customer: Optional[str] = None
    contact_person: Optional[str] = None
    inspection_date: Optional[str] = None
    machine_type: Optional[str] = None
    serial_no: Optional[str] = None
    machine_status: Optional[str] = None
    action_taken: Optional[str] = None
    remarks: Optional[str] = None
    engineer_signature: Optional[str] = None
    engineer_name: Optional[str] = None
    customer_signature: Optional[str] = None
    customer_name: Optional[str] = None
    time_in: Optional[str] = None
    time_out: Optional[str] = None
    footer_options: Dict[str, bool] = Field(default_factory=dict)
    answers: Dict[str, str] = Field(default_factory=dict)


class SubmissionResponse(BaseModel):
    id: int
    template_id: int
    user_id: int
    customer: Optional[str]
    contact_person: Optional[str]
    inspection_date: Optional[str]
    machine_type: Optional[str]
    serial_no: Optional[str]
    machine_status: Optional[str]
    action_taken: Optional[str]
    remarks: Optional[str]
    engineer_signature: Optional[str]
    engineer_name: Optional[str]
    customer_signature: Optional[str]
    customer_name: Optional[str]
    time_in: Optional[str]
    time_out: Optional[str]
    footer_options: Optional[Dict[str, bool]] = None
    submitted_at: datetime
    username: Optional[str] = None
    full_name: Optional[str] = None

    class Config:
        from_attributes = True
