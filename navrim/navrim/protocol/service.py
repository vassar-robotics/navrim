from pydantic import BaseModel


class SetTokenRequest(BaseModel):
    token: str


class GetTokenResponse(BaseModel):
    token: str


class GetThirdPartyTokensResponse(BaseModel):
    huggingface: str
    openai: str
    wandb: str
