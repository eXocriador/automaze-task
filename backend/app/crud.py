from typing import List, Optional

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from . import models, schemas


def get_task(db: Session, task_id: int) -> Optional[models.Task]:
    return db.get(models.Task, task_id)


def list_tasks(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None,
    sort: Optional[str] = None,
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

    if status == "done":
        stmt = stmt.where(models.Task.completed.is_(True))
    elif status == "undone":
        stmt = stmt.where(models.Task.completed.is_(False))

    if sort == "priority_desc":
        stmt = stmt.order_by(models.Task.priority.desc(), models.Task.id.desc())
    elif sort == "priority_asc":
        stmt = stmt.order_by(models.Task.priority.asc(), models.Task.id.desc())
    else:
        stmt = stmt.order_by(models.Task.created_at.desc(), models.Task.id.desc())

    return db.scalars(stmt).all()


def create_task(db: Session, task_in: schemas.TaskCreate) -> models.Task:
    db_task = models.Task(**task_in.model_dump())
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
