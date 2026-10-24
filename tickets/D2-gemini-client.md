# D2 · Gemini client

> Send a photo or text to Gemini and get back which drink it is, never a guessed caffeine number.

**Must · B · 2.5h · Files:** `drinks/gemini.py`, `tests/test_gemini.py`, `data/gemini_cache/` · §6.2, §6.3
- Use a Flash-tier model with `response_schema` matching `GeminiResult`, where `drink` is an enum of `DRINK_KEYS`. The prompt asks it to read printed caffeine and never to guess mg.
- 6-second timeout. On error, return `drink="unknown", confidence=0`.
- Cache responses on disk by image SHA-256, for demo props (§16).
- **Done when:** the unit tests (with a mocked client) cover parsing, timeout and caching. A manual script `python -m app.drinks.gemini photo.jpg` works with a real key.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.
