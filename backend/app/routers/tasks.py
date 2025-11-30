from typing import Annotated, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..deps import get_db

router = APIRouter(prefix="/tasks", tags=["tasks"])


StatusFilter = Literal["all", "done", "undone"]
SortOption = Literal[
    "priority_asc",
    "priority_desc",
    "due_date_asc",
    "due_date_desc",
    "created_asc",
    "created_desc",
]


@router.get(
    "/",
    response_model=List[schemas.Task],
    summary="List tasks with search, filter, and sort",
)
def list_tasks(
    search: Annotated[Optional[str], Query(min_length=1, max_length=255)] = None,
    status: Annotated[Optional[StatusFilter], Query()] = None,
    sort: Annotated[Optional[SortOption], Query()] = None,
    category: Annotated[Optional[str], Query(min_length=1, max_length=100)] = None,
    db: Session = Depends(get_db),
) -> List[schemas.Task]:
    normalized_status = None if status in (None, "all") else status
    return crud.list_tasks(
        db, search=search, status=normalized_status, sort=sort, category=category
    )


@router.post(
    "/",
    response_model=schemas.Task,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
)
def create_task(task_in: schemas.TaskCreate, db: Session = Depends(get_db)) -> schemas.Task:
    return crud.create_task(db, task_in)


@router.patch(
    "/{task_id}",
    response_model=schemas.Task,
    summary="Update a task by ID",
)
def update_task(
    task_id: int, task_in: schemas.TaskUpdate, db: Session = Depends(get_db)
) -> schemas.Task:
    db_task = crud.get_task(db, task_id)
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return crud.update_task(db, db_task, task_in)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task by ID",
)
def delete_task(task_id: int, db: Session = Depends(get_db)) -> None:
    db_task = crud.get_task(db, task_id)
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    crud.delete_task(db, db_task)

# Allow routes without trailing slash to avoid 307 redirects
router.add_api_route(
    "",
    list_tasks,
    methods=["GET"],
    response_model=List[schemas.Task],
    summary="List tasks with search, filter, and sort",
    include_in_schema=False,
)
router.add_api_route(
    "",
    create_task,
    methods=["POST"],
    response_model=schemas.Task,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    include_in_schema=False,
)


@router.post(
    "/reorder",
    response_model=List[schemas.Task],
    summary="Reorder tasks by IDs (drag-and-drop)",
)
def reorder_tasks(order: List[int], db: Session = Depends(get_db)) -> List[schemas.Task]:
    return crud.reorder_tasks(db, order)
