from fastapi import APIRouter

from navrim.core.background import get_task_queue_factory
from navrim.protocol import NavrimServiceResponse
from navrim.protocol.response import BackgroundTask, ListBackgroundTasksResponse

router = APIRouter(tags=["background"])


@router.post("/background/list")
async def list_background_tasks() -> NavrimServiceResponse[ListBackgroundTasksResponse]:
    records = get_task_queue_factory().registry.get_all_records()
    tasks = [
        BackgroundTask(
            id=record.task_id,
            name=record.name,
            status=record.status,
            description=record.description,
            progress=None,
        )
        for record in records
    ]
    return NavrimServiceResponse.success(ListBackgroundTasksResponse(tasks=tasks))
