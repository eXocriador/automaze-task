from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: int = Field(default=1, ge=1, le=10)


class TaskCreate(TaskBase):
    completed: bool = False


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    priority: Optional[int] = Field(default=None, ge=1, le=10)
    completed: Optional[bool] = None


class Task(TaskBase):
    id: int
    completed: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
