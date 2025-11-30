from typing import Annotated, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..deps import get_db

router = APIRouter(prefix="/tasks", tags=["tasks"])


StatusFilter = Literal["all", "done", "undone"]
SortOption = Literal["priority_asc", "priority_desc"]


@router.get(
    "/",
    response_model=List[schemas.Task],
    summary="List tasks with search, filter, and sort",
)
def list_tasks(
    search: Annotated[Optional[str], Query(min_length=1, max_length=255)] = None,
    status: Annotated[Optional[StatusFilter], Query()] = None,
    sort: Annotated[Optional[SortOption], Query()] = None,
    db: Session = Depends(get_db),
) -> List[schemas.Task]:
    normalized_status = None if status in (None, "all") else status
    return crud.list_tasks(db, search=search, status=normalized_status, sort=sort)


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
