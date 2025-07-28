import json
from pathlib import Path

from pydantic import BaseModel

from navrim.util import get_home_app_path


class GetTokenResponse(BaseModel):
    token: str


class GetThirdPartyTokensResponse(BaseModel):
    huggingface: str
    openai: str
    wandb: str


class VerifyTokenResponse(BaseModel):
    valid: bool
    reason: str


class GetServerStatusResponse(BaseModel):
    status: str
    ip_address: str
    port: int
    hostname: str

class Session(BaseModel):
    user_id: str
    user_email: str
    email_confirmed: bool
    access_token: str
    refresh_token: str
    expires_at: int

    @staticmethod
    def get_session_path() -> Path:
        return get_home_app_path() / "supabase.session.json"

    @staticmethod
    def load_session():
        try:
            with open(Session.get_session_path(), "r") as f:
                session = json.load(f)
                session = Session.model_validate(session)
            return session
        except Exception:
            return None

    @staticmethod
    def delete_session():
        session_path = Session.get_session_path()
        session_path.unlink(missing_ok=True)

    def save_session(self):
        session_path = Session.get_session_path()
        session_path.write_text(json.dumps(self.model_dump()))


class SessionResponse(BaseModel):
    session: Session
