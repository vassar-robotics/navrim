import json
from asyncio import gather, to_thread

from fastapi import APIRouter, HTTPException
from natsort import natsorted

from navrim.core.dataset import list_local_datasets, list_remote_datasets
from navrim.protocol import NavrimServiceResponse
from navrim.protocol.request import BrowseDatasetRequest, GetDatasetInfoRequest
from navrim.protocol.response import (
    BrowseDatasetResponse,
    DatasetInfoResponse,
    DatasetItemResponse,
    ListDatasetsResponse,
)
from navrim.util import get_app_datasets_path

router = APIRouter(tags=["dataset"])


@router.post("/datasets/list")
async def list_datasets() -> NavrimServiceResponse[ListDatasetsResponse]:
    local_datasets, remote_datasets = await gather(
        to_thread(list_local_datasets),
        to_thread(list_remote_datasets),
    )
    return NavrimServiceResponse.success(
        ListDatasetsResponse(
            datasets=[
                *[DatasetItemResponse(name=dataset, is_remote=False) for dataset in local_datasets],
                *[DatasetItemResponse(name=dataset, is_remote=True) for dataset in remote_datasets],
            ]
        )
    )


@router.post("/dataset/info")
async def get_dataset_info(request: GetDatasetInfoRequest) -> NavrimServiceResponse[DatasetInfoResponse]:
    dataset_path = get_app_datasets_path() / request.dataset_name
    if not dataset_path.is_dir():
        raise HTTPException(status_code=404, detail="Dataset not found")
    meta_info_path = dataset_path / "meta" / "info.json"
    meta_info_content = meta_info_path.read_text(encoding="utf-8")
    meta_info = json.loads(meta_info_content)
    image_count = len([key for key in meta_info["features"] if key.startswith("observation.images.")])
    return NavrimServiceResponse.success(
        DatasetInfoResponse(
            name=request.dataset_name,
            is_remote=request.is_remote,
            version=meta_info["codebase_version"],
            robot_type=meta_info["robot_type"],
            dof=meta_info["features"]["action"]["shape"][0],
            episode_count=meta_info["total_episodes"],
            image_count=image_count,
        )
    )


@router.post("/dataset/browse")
async def browse_dataset(request: BrowseDatasetRequest) -> NavrimServiceResponse[BrowseDatasetResponse]:
    browse_path = get_app_datasets_path() / request.dataset_name / request.path
    if not browse_path.is_dir():
        raise HTTPException(status_code=404, detail="Browse path not found")
    files = natsorted([file.name for file in browse_path.glob("*") if file.is_file()])
    directories = natsorted([directory.name for directory in browse_path.glob("*/") if directory.is_dir()])
    return NavrimServiceResponse.success(
        BrowseDatasetResponse(
            name=request.dataset_name,
            is_remote=request.is_remote,
            path=request.path,
            files=files,
            directories=directories,
        )
    )
