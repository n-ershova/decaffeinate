# D6 · `/drinks/identify` route

> API endpoint that takes a photo or description, identifies the drink and logs it automatically when confident.

**Must · B · 1.5h · Files:** `routes/identify.py`, `tests/test_routes_identify.py` · §6.2, §8.3
- Accept a multipart `image` (resize to a maximum of 768 px) or `text`. Run Gemini, then `estimate()`. If `auto_accept`, save the drink through `Depends(get_repo)` and return it in `logged`.
- **Develop in isolation:** monkeypatch `identify_image`, `identify_text` and `estimate`, and use a fake repo.
- **Done when:** the tests cover the image, text, auto-accept and unknown paths.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.
