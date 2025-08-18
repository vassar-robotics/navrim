from asyncio import gather, to_thread

from fastapi import APIRouter

from navrim.core.dataset import list_local_datasets, list_remote_datasets
from navrim.protocol import NavrimServiceResponse
from navrim.protocol.response import DatasetItemResponse, ListDatasetsResponse

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
