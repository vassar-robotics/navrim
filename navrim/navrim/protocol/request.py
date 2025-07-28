from pydantic import BaseModel


class TokenRequest(BaseModel):
    token: str


class EmailRequest(BaseModel):
    email: str


class EmailPasswordRequest(EmailRequest):
    password: str


class SignUpCredentialsRequest(EmailPasswordRequest):
    display_name: str


class SignInCredentialsRequest(EmailPasswordRequest):
    pass


class ResetPasswordRequest(EmailRequest):
    pass
