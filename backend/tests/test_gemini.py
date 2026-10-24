import hashlib
import json
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from app.drinks import gemini
from app.types import DRINK_KEYS


@pytest.fixture
def client(monkeypatch, tmp_path):
    # Keep local service settings and credentials out of unit tests.
    monkeypatch.setattr(gemini, "dotenv_values", lambda path: {})
    monkeypatch.delenv("GEMINI_MODEL", raising=False)
    monkeypatch.delenv("GEMINI_TIMEOUT_SECONDS", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_CACHE_DIR", str(tmp_path))
    constructor = MagicMock()
    mock = constructor.return_value.__enter__.return_value
    mock.models.generate_content.return_value = SimpleNamespace(
        parsed=None, text=json.dumps({"drink": "red_bull", "confidence": .95, "label_mg": 80}))
    monkeypatch.setattr(gemini.genai, "Client", constructor)
    return constructor, mock


def test_parse_schema_and_timeout_config(client):
    constructor, mock = client
    result = gemini.identify_text("a can of Red Bull")
    assert result.drink == "red_bull" and result.label_mg == 80
    http = constructor.call_args.kwargs["http_options"]
    assert http.timeout == 6000 and http.retry_options.attempts == 1
    assert http.headers["X-Server-Timeout"] == "10"
    call = mock.models.generate_content.call_args.kwargs
    assert "flash" in call["model"]
    assert call["model"] == "gemini-3.5-flash-lite"
    assert call["config"].thinking_config.thinking_level == "MINIMAL"
    schema = call["config"].response_schema.model_json_schema()
    assert set(schema["properties"]["drink"]["enum"]) == set(DRINK_KEYS)
    assert "Never guess" in call["config"].system_instruction


@pytest.mark.parametrize("response", [
    SimpleNamespace(parsed=None, text="not json"),
    SimpleNamespace(parsed={"drink": "invented", "confidence": .9}, text=None),
    SimpleNamespace(parsed={"drink": "cola", "confidence": 2}, text=None),
    SimpleNamespace(parsed={"drink": "cola", "confidence": .9, "label_mg": -1}, text=None),
])
def test_invalid_output_falls_back(client, response):
    _, mock = client
    mock.models.generate_content.return_value = response
    assert gemini.identify_text("test").model_dump() == gemini._unknown().model_dump()


def test_timeout_is_not_cached(client, tmp_path):
    _, mock = client
    mock.models.generate_content.side_effect = TimeoutError()
    assert gemini.identify_image(b"jpeg").confidence == 0
    assert list(tmp_path.iterdir()) == []
    mock.models.generate_content.side_effect = None
    assert gemini.identify_image(b"jpeg").drink == "red_bull"
    assert mock.models.generate_content.call_count == 2


def test_photo_cache_survives_missing_key_and_corrupt_entry(client, tmp_path, monkeypatch):
    constructor, mock = client
    jpeg = b"photo bytes"
    path = tmp_path / (hashlib.sha256(jpeg).hexdigest() + ".json")
    path.write_text("broken", encoding="utf-8")
    result = gemini.identify_image(jpeg)
    assert json.loads(path.read_text())["drink"] == result.drink
    contents = mock.models.generate_content.call_args.kwargs["contents"]
    assert contents[0].inline_data.data == jpeg
    monkeypatch.delenv("GEMINI_API_KEY")
    constructor.side_effect = RuntimeError("offline")
    assert gemini.identify_image(jpeg) == result
    assert constructor.call_count == 1


def test_blank_inputs_do_not_call_api(client):
    constructor, _ = client
    assert gemini.identify_image(b"").drink == "unknown"
    assert gemini.identify_text(" ").confidence == 0
    constructor.assert_not_called()


def test_local_env_key_is_used_when_process_key_is_absent(client, monkeypatch):
    constructor, _ = client
    monkeypatch.delenv("GEMINI_API_KEY")
    monkeypatch.setattr(gemini, "dotenv_values", lambda path: {"GEMINI_API_KEY": "local-test-key"})
    assert gemini.identify_text("Red Bull").drink == "red_bull"
    assert constructor.call_args.kwargs["api_key"] == "local-test-key"


def test_local_model_and_timeout_can_be_overridden(client, monkeypatch):
    constructor, mock = client
    monkeypatch.setattr(gemini, "dotenv_values", lambda path: {
        "GEMINI_MODEL": "gemini-3.8-flash", "GEMINI_TIMEOUT_SECONDS": "15"})
    gemini.identify_text("Coffee")
    assert constructor.call_args.kwargs["http_options"].timeout == 15000
    assert constructor.call_args.kwargs["http_options"].headers["X-Server-Timeout"] == "15"
    assert mock.models.generate_content.call_args.kwargs["model"] == "gemini-3.8-flash"
    monkeypatch.setenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
    monkeypatch.setenv("GEMINI_TIMEOUT_SECONDS", "6")
    gemini.identify_text("Coffee")
    assert constructor.call_args.kwargs["http_options"].timeout == 6000
    assert mock.models.generate_content.call_args.kwargs["model"] == "gemini-3.5-flash-lite"


@pytest.mark.parametrize("timeout", ["-1", "0", "nan", "inf", "bad value"])
def test_invalid_timeout_falls_back_without_api_request(client, monkeypatch, timeout):
    constructor, _ = client
    monkeypatch.setenv("GEMINI_TIMEOUT_SECONDS", timeout)
    assert gemini.identify_text("Coffee").confidence == 0
    constructor.assert_not_called()


def test_error_log_is_useful_without_leaking_secrets(client, caplog):
    _, mock = client
    error = RuntimeError("secret-api-key; private drink description")
    error.code = 503
    mock.models.generate_content.side_effect = error
    assert gemini.identify_text("private drink description").confidence == 0
    assert "RuntimeError" in caplog.text and "status=503" in caplog.text
    assert "secret-api-key" not in caplog.text and "private drink description" not in caplog.text
