from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.auth import COOKIE, SESSION_DAYS, check_origin, get_auth_store
from app.deps import setting
from app.routes.users import NewUser

router = APIRouter(prefix="/auth")

class Credentials(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=12, max_length=128)

    @field_validator("email")
    @classmethod
    def email_address(cls, value):
        value = value.strip().lower()
        if value.count("@") != 1 or any(c.isspace() for c in value) or not all(value.split("@")):
            raise ValueError("Enter a valid email address")
        return value

class Registration(Credentials, NewUser):
    # Names and emails are normalized; passwords must retain all characters.
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=False)

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, value):
        if not value.strip():
            raise ValueError("Enter your name")
        return value.strip()

def signed_in(response, store, user, request):
    old = request.cookies.get(COOKIE)
    if old:
        store.revoke(old)
    response.set_cookie(COOKIE, store.session(user.id), max_age=SESSION_DAYS * 86400,
                        httponly=True, samesite="strict", secure=setting("COOKIE_SECURE", "0") == "1", path="/")
    response.headers["Cache-Control"] = "no-store"
    return user

@router.post("/register")
def register(body: Registration, request: Request, response: Response, store=Depends(get_auth_store)):
    check_origin(request)
    store.throttle(request.client.host)
    user = store.register(body.email, body.password, body.model_dump(exclude={"email", "password"}))
    return signed_in(response, store, user, request)

@router.post("/login")
def login(body: Credentials, request: Request, response: Response, store=Depends(get_auth_store)):
    check_origin(request)
    store.throttle(request.client.host)
    return signed_in(response, store, store.login(body.email, body.password), request)

@router.get("/me")
def me(request: Request, response: Response, store=Depends(get_auth_store)):
    user_id = store.resolve(request.cookies.get(COOKIE, ""))
    if user_id is None:
        raise HTTPException(401, "Sign in to continue")
    response.headers["Cache-Control"] = "no-store"
    return store.repo.get_user(user_id)

@router.post("/logout")
def logout(request: Request, response: Response, store=Depends(get_auth_store)):
    check_origin(request)
    store.revoke(request.cookies.get(COOKIE, ""))
    response.delete_cookie(COOKIE, path="/")
    response.headers["Cache-Control"] = "no-store"
    return {"ok": True}
