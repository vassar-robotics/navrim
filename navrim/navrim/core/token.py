from contextlib import suppress
from enum import StrEnum
from pathlib import Path

from navrim.util import get_home_app_path


class TokenType(StrEnum):
    HUGGINGFACE = "huggingface"
    OPENAI = "openai"
    WANDB = "wandb"


def get_token_path(token_type: TokenType) -> Path:
    return get_home_app_path() / "tokens" / f"{token_type.value}.token"


def get_token(token_type: TokenType) -> str:
    token_file = get_token_path(token_type)
    with suppress(Exception):
        token_file.parent.mkdir(parents=True, exist_ok=True)
        token = token_file.read_text().strip()
        return token
    return ""


def set_token(token_type: TokenType, token: str) -> None:
    token_file = get_token_path(token_type)
    token_file.parent.mkdir(parents=True, exist_ok=True)
    token_file.write_text(token)
    token_file.chmod(0o600)


def delete_token(token_type: TokenType) -> None:
    token_file = get_token_path(token_type)
    token_file.unlink(missing_ok=True)