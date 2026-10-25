from datetime import time
from typing import Literal
from fastapi import APIRouter, Depends, Path
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.db.repo import Repo
from app.deps import get_repo, require_user
from app.types import User

router = APIRouter()

class NewUser(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str = Field(min_length=1, max_length=100)
    bedtime: time
    smoker: bool = False
    hormonal_bc: bool = False

    @model_validator(mode="after")
    def local_bedtime(self):
        if self.bedtime.tzinfo is not None:
            raise ValueError("bedtime must be local HH:MM without an offset")
        return self

class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    bedtime: time | None = None
    tolerance_min: Literal[5, 10, 20] | None = None
    smoker: bool | None = None
    hormonal_bc: bool | None = None

    @model_validator(mode="after")
    def nonnull_fields(self):
        if any(getattr(self, key) is None for key in self.model_fields_set):
            raise ValueError("Supplied settings cannot be null")
        if self.bedtime is not None and self.bedtime.tzinfo is not None:
            raise ValueError("bedtime must be local HH:MM without an offset")
        return self

@router.post("/users", response_model=User)
def create_user(body: NewUser, repo: Repo = Depends(get_repo)):
    # Reserve IDs 2/3 for the frozen demo contract.
    for _ in range(100):
        id = max([3] + [u.id for u in repo.list_users()]) + 1
        try:
            return repo.create_user(User(id=id, **body.model_dump()))
        except ValueError:
            continue
    from fastapi import HTTPException
    raise HTTPException(409, "Could not allocate a user ID; retry")

@router.get("/users/{id}", response_model=User)
def user(id: int = Path(ge=1), repo: Repo = Depends(get_repo)):
    return require_user(repo, id)

@router.patch("/users/{id}", response_model=User)
def update_user(body: UserUpdate, id: int = Path(ge=1), repo: Repo = Depends(get_repo)):
    require_user(repo, id)
    return repo.update_user(id, **body.model_dump(exclude_unset=True))
