from contextlib import suppress

from huggingface_hub import HfApi

from navrim.core.token import TokenType, get_token
from navrim.util import get_app_datasets_path


def list_local_datasets():
    datasets_path = get_app_datasets_path()
    datasets_path.mkdir(parents=True, exist_ok=True)
    return [dirname.name for dirname in datasets_path.iterdir() if dirname.is_dir()]


def list_remote_datasets():
    with suppress(Exception):
        huggingface_token = get_token(TokenType.HUGGINGFACE)
        hf_api = HfApi(token=huggingface_token)
        whoami = hf_api.whoami()
        hf_name = whoami["name"]
        hf_datasets = hf_api.list_datasets(author=hf_name)
        return [dataset.id.split("/")[-1] for dataset in hf_datasets]
    return []
