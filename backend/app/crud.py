from typing import List, Optional

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from . import models, schemas


def get_task(db: Session, task_id: int) -> Optional[models.Task]:
    return db.get(models.Task, task_id)


def list_tasks(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None,
    sort: Optional[str] = None,
    category: Optional[str] = None,
) -> List[models.Task]:
    stmt = select(models.Task)

    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                models.Task.title.ilike(pattern),
                models.Task.description.ilike(pattern),
            )
        )

    if category:
        stmt = stmt.where(models.Task.category.ilike(category))

    if status == "done":
        stmt = stmt.where(models.Task.completed.is_(True))
    elif status == "undone":
        stmt = stmt.where(models.Task.completed.is_(False))

    if sort == "priority_desc":
        stmt = stmt.order_by(models.Task.priority.desc(), models.Task.id.desc())
    elif sort == "priority_asc":
        stmt = stmt.order_by(models.Task.priority.asc(), models.Task.id.desc())
    elif sort == "due_date_asc":
        stmt = stmt.order_by(models.Task.due_date.is_(None), models.Task.due_date.asc(), models.Task.id.desc())
    elif sort == "due_date_desc":
        stmt = stmt.order_by(models.Task.due_date.is_(None), models.Task.due_date.desc(), models.Task.id.desc())
    elif sort == "created_asc":
        stmt = stmt.order_by(models.Task.created_at.asc(), models.Task.id.asc())
    else:
        stmt = stmt.order_by(
            models.Task.order_index.asc().nulls_last(), models.Task.created_at.desc(), models.Task.id.desc()
        )

    return db.scalars(stmt).all()


def _next_order_index(db: Session) -> int:
    current = db.scalar(select(func.max(models.Task.order_index)))
    return (current or 0) + 1


def create_task(db: Session, task_in: schemas.TaskCreate) -> models.Task:
    payload = task_in.model_dump()
    if payload.get("order_index") is None:
        payload["order_index"] = _next_order_index(db)
    db_task = models.Task(**payload)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, db_task: models.Task, task_in: schemas.TaskUpdate) -> models.Task:
    for field, value in task_in.model_dump(exclude_unset=True).items():
        setattr(db_task, field, value)

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, db_task: models.Task) -> None:
    db.delete(db_task)
    db.commit()


def reorder_tasks(db: Session, task_ids: List[int]) -> List[models.Task]:
    if not task_ids:
        return []
    # Fetch existing tasks in given order
    tasks_map = {
        task.id: task
        for task in db.execute(select(models.Task).where(models.Task.id.in_(task_ids))).scalars().all()
    }
    # Assign sequential order_index based on provided list
    for position, task_id in enumerate(task_ids, start=1):
        task = tasks_map.get(task_id)
        if task:
            task.order_index = position
            db.add(task)
    db.commit()
    db.flush()
    # Return tasks sorted by new order
    ordered = [tasks_map[tid] for tid in task_ids if tid in tasks_map]
    return ordered
