import yaml
from pydantic_settings import BaseSettings

from navrim.util import get_resources_path


class NavrimServerConfig(BaseSettings):
    server_port: int = 8000


class AppTokens(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str

    @staticmethod
    def from_yaml():
        tokens_path = get_resources_path() / "tokens.yaml"
        with open(tokens_path, "r") as f:
            tokens = yaml.safe_load(f)
        return AppTokens(**tokens)


config = NavrimServerConfig()
app_tokens = AppTokens.from_yaml()
