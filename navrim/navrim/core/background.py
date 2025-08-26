"""
Background task queue system with category-based queues and process execution.
"""

import atexit
import contextlib
import json
import queue
import threading
import traceback
import uuid
from concurrent.futures import Future, ProcessPoolExecutor
from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from typing import Any, Callable, Dict, List, Optional, Tuple

from loguru import logger

from navrim.util import get_app_cache_path


class BackgroundTaskStatus(StrEnum):

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class BackgroundTaskCategory(StrEnum):
    """Category of a background task."""

    DEFAULT = "default"
    FETCH_DATASET = "fetch_dataset"


@dataclass
class BackgroundTaskRecord:
    """Record of a background task."""

    task_id: str
    name: str
    description: str
    category: str
    status: BackgroundTaskStatus
    callable_name: str
    args: Tuple[Any, ...]
    kwargs: Dict[str, Any]
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Any = None
    error: Optional[str] = None
    traceback: Optional[str] = None


class BackgroundTaskRegistry:
    """Shared registry for all task records across queues."""

    def __init__(self):
        self._records: Dict[str, BackgroundTaskRecord] = {}
        self._lock = threading.Lock()

    def add_record(self, record: BackgroundTaskRecord) -> None:
        """Add a new task record."""
        with self._lock:
            self._records[record.task_id] = record

    def update_record(self, task_id: str, **updates) -> None:
        """Update an existing task record."""
        with self._lock:
            if task_id in self._records:
                for key, value in updates.items():
                    setattr(self._records[task_id], key, value)

    def get_record(self, task_id: str) -> Optional[BackgroundTaskRecord]:
        """Get a task record by ID."""
        with self._lock:
            return self._records.get(task_id)

    def get_all_records(self) -> List[BackgroundTaskRecord]:
        """Get all task records."""
        with self._lock:
            return list(self._records.values())

    def get_records_by_category(self, category: str) -> List[BackgroundTaskRecord]:
        """Get all task records for a specific category."""
        with self._lock:
            return [r for r in self._records.values() if r.category == category]

    def get_records_by_status(self, status: BackgroundTaskStatus) -> List[BackgroundTaskRecord]:
        """Get all task records with a specific status."""
        with self._lock:
            return [r for r in self._records.values() if r.status == status]

    def clear_completed(self, older_than: Optional[datetime] = None) -> int:
        """Clear completed task records optionally older than a specific time."""
        with self._lock:
            to_remove = []
            for task_id, record in self._records.items():
                if record.status == BackgroundTaskStatus.COMPLETED:
                    if older_than is None or (record.completed_at and record.completed_at < older_than):
                        to_remove.append(task_id)

            for task_id in to_remove:
                del self._records[task_id]

            return len(to_remove)


def _execute_task(task_id: str, func: Callable, args: Tuple[Any, ...], kwargs: Dict[str, Any]) -> Tuple[bool, Any]:
    """Execute a task in a separate process."""
    task_cache_dir = get_app_cache_path() / "tasks" / task_id
    task_cache_dir.mkdir(parents=True, exist_ok=True)

    stdout_file = task_cache_dir / "stdout.log"
    stderr_file = task_cache_dir / "stderr.log"
    exception_file = task_cache_dir / "exception.log"

    try:
        with (
            open(stdout_file, "w", encoding="utf-8") as stdout_file,
            open(stderr_file, "w", encoding="utf-8") as stderr_file,
        ):
            with contextlib.redirect_stdout(stdout_file), contextlib.redirect_stderr(stderr_file):
                result = func(*args, **kwargs)
                return (True, result)
    except Exception as e:
        with open(exception_file, "w", encoding="utf-8") as exception_file:
            json.dump({"error": str(e), "traceback": traceback.format_exc()}, exception_file)
        return (False, {"error": str(e), "traceback": traceback.format_exc()})


class BackgroundTaskQueue:
    """A queue that processes background tasks with concurrency control."""

    def __init__(self, category: str, max_concurrent: int, registry: BackgroundTaskRegistry):
        """
        Initialize a task queue.

        Args:
            category: Category name for this queue
            max_concurrent: Maximum number of tasks that can run simultaneously
            registry: Shared task registry
        """
        self.category = category
        self.max_concurrent = max_concurrent
        self.registry = registry
        self._queue = queue.Queue()
        self._executor = ProcessPoolExecutor(max_workers=max_concurrent)
        self._futures: Dict[str, Future] = {}
        self._running = False
        self._worker_thread = None
        self._shutdown_event = threading.Event()

    def start(self) -> None:
        """Start the queue worker thread."""
        if not self._running:
            self._running = True
            self._shutdown_event.clear()
            self._worker_thread = threading.Thread(target=self._worker, daemon=True)
            self._worker_thread.start()
            logger.info(f"Started queue worker for category '{self.category}'")

    def stop(self, wait: bool = True) -> None:
        """Stop the queue worker thread."""
        if self._running:
            self._running = False
            self._shutdown_event.set()
            self._queue.put(None)  # Sentinel to unblock the worker

            if wait and self._worker_thread:
                self._worker_thread.join(timeout=5)

            self._executor.shutdown(wait=wait)
            logger.info(f"Stopped queue worker for category '{self.category}'")

    def add_task(
        self,
        func: Callable,
        *args,
        name_: Optional[str] = None,
        description_: Optional[str] = None,
        **kwargs,
    ) -> str:
        """
        Add a task to the queue.

        Args:
            func: The callable to execute
            *args: Positional arguments for the callable
            name_: Optional human-readable name for the task
            description_: Optional description of what the task does
            **kwargs: Keyword arguments for the callable

        Returns:
            Task ID
        """
        task_id = str(uuid.uuid4())
        callable_name = func.__name__ if hasattr(func, "__name__") else str(func)

        # Create task record
        record = BackgroundTaskRecord(
            task_id=task_id,
            name=name_ or callable_name,  # Use callable name as default
            description=description_ or f"Task {callable_name} in {self.category}",
            category=self.category,
            status=BackgroundTaskStatus.PENDING,
            callable_name=callable_name,
            args=args,
            kwargs=kwargs,
            created_at=datetime.now(),
        )

        # Add to registry
        self.registry.add_record(record)

        # Add to queue
        self._queue.put((task_id, func, args, kwargs))

        logger.info(f"Added task '{record.name}' ({task_id}) to queue '{self.category}'")
        return task_id

    def _worker(self) -> None:
        """Worker thread that processes tasks from the queue."""
        logger.info(f"Worker thread started for queue '{self.category}'")

        while self._running:
            try:
                # Get task from queue with timeout
                item = self._queue.get(timeout=1)

                if item is None:  # Sentinel value for shutdown
                    break

                task_id, func, args, kwargs = item

                # Update task status to running
                self.registry.update_record(task_id, status=BackgroundTaskStatus.RUNNING, started_at=datetime.now())

                # Submit task to process pool
                future = self._executor.submit(_execute_task, func, args, kwargs)
                self._futures[task_id] = future

                # Set up callback for when task completes
                future.add_done_callback(lambda f: self._handle_task_completion(task_id, f))

            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Error in worker thread for queue '{self.category}': {e}")

    def _handle_task_completion(self, task_id: str, future: Future) -> None:
        """Handle task completion callback."""
        try:
            success, result = future.result()

            if success:
                self.registry.update_record(
                    task_id, status=BackgroundTaskStatus.COMPLETED, completed_at=datetime.now(), result=result
                )
                logger.info(f"Task {task_id} completed successfully")
            else:
                self.registry.update_record(
                    task_id,
                    status=BackgroundTaskStatus.FAILED,
                    completed_at=datetime.now(),
                    error=result.get("error"),
                    traceback=result.get("traceback"),
                )
                logger.error(f"Task {task_id} failed: {result.get('error')}")

        except Exception as e:
            self.registry.update_record(
                task_id,
                status=BackgroundTaskStatus.FAILED,
                completed_at=datetime.now(),
                error=str(e),
                traceback=traceback.format_exc(),
            )
            logger.error(f"Error handling task {task_id} completion: {e}")

        finally:
            # Remove future from tracking
            self._futures.pop(task_id, None)

    def cancel_task(self, task_id: str) -> bool:
        """
        Cancel a pending or running task.

        Args:
            task_id: Task ID to cancel

        Returns:
            True if task was cancelled, False otherwise
        """
        if task_id in self._futures:
            future = self._futures[task_id]
            if future.cancel():
                self.registry.update_record(
                    task_id, status=BackgroundTaskStatus.CANCELLED, completed_at=datetime.now()
                )
                logger.info(f"Task {task_id} cancelled")
                return True
        return False


class BackgroundTaskQueueFactory:
    """Factory for creating and managing task queues."""

    def __init__(self):
        """Initialize the queue factory."""
        self.registry = BackgroundTaskRegistry()
        self._queues: Dict[str, BackgroundTaskQueue] = {}
        self._lock = threading.Lock()

    def create_queue(self, category: str, max_concurrent: int = 1) -> BackgroundTaskQueue:
        """
        Create a new task queue.

        Args:
            category: Category name for the queue
            max_concurrent: Maximum number of tasks that can run simultaneously

        Returns:
            The created TaskQueue instance

        Raises:
            ValueError: If a queue with the same category already exists
        """
        with self._lock:
            if category in self._queues:
                raise ValueError(f"Queue with category '{category}' already exists")

            queue = BackgroundTaskQueue(category, max_concurrent, self.registry)
            queue.start()
            self._queues[category] = queue

            logger.info(f"Created queue '{category}' with max_concurrent={max_concurrent}")
            return queue

    def get_queue(self, category: str) -> Optional[BackgroundTaskQueue]:
        """Get a queue by category."""
        with self._lock:
            return self._queues.get(category)

    def get_or_create_queue(self, category: str, default_max_concurrent: int = 1) -> BackgroundTaskQueue:
        """Get an existing queue or create a new one if it doesn't exist."""
        with self._lock:
            if category in self._queues:
                return self._queues[category]
            return self.create_queue(category, default_max_concurrent)

    def list_queues(self) -> List[str]:
        """List all queue categories."""
        with self._lock:
            return list(self._queues.keys())

    def remove_queue(self, category: str, wait: bool = True) -> bool:
        """
        Remove a queue.

        Args:
            category: Category of the queue to remove
            wait: Whether to wait for running tasks to complete

        Returns:
            True if queue was removed, False if it didn't exist
        """
        with self._lock:
            if category in self._queues:
                queue = self._queues[category]
                queue.stop(wait=wait)
                del self._queues[category]
                logger.info(f"Removed queue '{category}'")
                return True
            return False

    def shutdown(self, wait: bool = True) -> None:
        """
        Shutdown all queues.

        Args:
            wait: Whether to wait for running tasks to complete
        """
        with self._lock:
            for queue in self._queues.values():
                queue.stop(wait=wait)
            self._queues.clear()
            logger.info("All queues shut down")


_global_factory = BackgroundTaskQueueFactory()
atexit.register(_global_factory.shutdown)


def get_task_queue_factory() -> BackgroundTaskQueueFactory:
    """Get the global queue factory instance."""
    global _global_factory
    return _global_factory


def get_task_queue(category: BackgroundTaskCategory, default_max_concurrent: int = 1) -> BackgroundTaskQueue:
    """Get a task queue by category."""
    return get_task_queue_factory().get_or_create_queue(category.value, default_max_concurrent)
