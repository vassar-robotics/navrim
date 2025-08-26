import json
from contextlib import suppress
from pathlib import Path

from fastapi import HTTPException
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
        return [dataset.id for dataset in hf_datasets]
    return []


def fetch_dataset_from_hub(dataset_name: str) -> Path:
    huggingface_token = get_token(TokenType.HUGGINGFACE)
    hf_api = HfApi(token=huggingface_token)
    meta_info_path = hf_api.hf_hub_download(
        repo_id=dataset_name,
        filename="meta/info.json",
        repo_type="dataset",
        force_download=True,
    )
    with open(meta_info_path, "r", encoding="utf-8") as f:
        meta_info = json.load(f)
    if "codebase_version" not in meta_info or meta_info["codebase_version"] != "v2.1":
        raise HTTPException(status_code=400, detail=f"Dataset {dataset_name} is not compatible")
    target_path = get_app_datasets_path() / dataset_name.replace("/", "--")
    hf_api.snapshot_download(
        repo_id=dataset_name,
        repo_type="dataset",
        local_dir=target_path,
        ignore_patterns=[".git", ".gitignore"],
        force_download=True,
    )
    return target_path
