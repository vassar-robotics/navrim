from pydantic import BaseModel, EmailStr, Field


class TokenRequest(BaseModel):
    token: str


class EmailRequest(BaseModel):
    email: EmailStr


class EmailPasswordRequest(EmailRequest):
    password: str = Field(..., min_length=6, max_length=32)


class SignUpCredentialsRequest(EmailPasswordRequest):
    display_name: str = Field(..., min_length=1, max_length=32)


class SignInCredentialsRequest(EmailPasswordRequest):
    pass


class ResetPasswordRequest(EmailRequest):
    pass
