from datetime import datetime, timedelta
from io import BytesIO
from typing import Annotated, Literal
import warnings
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError
from app.db.repo import Repo
from app.deps import get_now, get_repo, require_user, setting
from app.drinks.gemini import identify_image, identify_text
from app.drinks.lookup import estimate
from app.types import Drink

router = APIRouter()
MAX_IMAGE_BYTES = 10 * 1024 * 1024

def repeat_window() -> timedelta:
    # Someone sipping a coffee keeps bringing the same cup back to the desk machine.
    return timedelta(minutes=float(setting("JETSON_REPEAT_MINUTES", "10")))

def resize_image(raw: bytes) -> bytes:
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(BytesIO(raw)) as image:
                image = ImageOps.exif_transpose(image)
                image.thumbnail((768, 768))
                output = BytesIO()
                image.convert("RGB").save(output, format="JPEG", quality=85)
                return output.getvalue()
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError,
            Image.DecompressionBombWarning):
        raise HTTPException(422, "Invalid or oversized image") from None

@router.post("/drinks/identify")
def identify(image: Annotated[UploadFile | None, File()] = None,
             text: Annotated[str | None, Form(max_length=4000)] = None,
             source: Annotated[Literal["photo", "text", "jetson"], Form()] = "photo",
             user_id: Annotated[int, Form(ge=1)] = 1,
             repo: Repo = Depends(get_repo), now: datetime = Depends(get_now)):
    require_user(repo, user_id)
    if (image is None) == (text is None):
        raise HTTPException(422, "Supply exactly one image or text")
    if image is not None:
        raw = image.file.read(MAX_IMAGE_BYTES + 1)
        if len(raw) > MAX_IMAGE_BYTES:
            raise HTTPException(413, "Image exceeds 10 MB")
        if source == "text":
            raise HTTPException(422, "Image source must be photo or jetson")
        result = identify_image(resize_image(raw))
    else:
        if not text or not text.strip():
            raise HTTPException(422, "Text must not be blank")
        result = identify_text(text.strip())
        source = "text"
    prediction = estimate(result)
    logged = None
    if source == "jetson" and prediction.auto_accept:
        # The machine can't tell a returning cup from a new one; the same drink logged
        # recently (from anywhere) is taken to be this one, so it isn't counted twice.
        recent = [d for d in repo.list_drinks(user_id, now - repeat_window(), now)
                  if d.drink_key == prediction.drink_key]
        if recent:
            return {"gemini": result, "estimate": prediction, "logged": None,
                    "repeat": max(recent, key=lambda d: d.time)}
    if prediction.auto_accept:
        logged = repo.add_drink(Drink(time=now, user_id=user_id, drink_key=prediction.drink_key,
                                      mg=prediction.mg, mg_low=prediction.mg_low,
                                      mg_high=prediction.mg_high, source=source))
    return {"gemini": result, "estimate": prediction, "logged": logged}
