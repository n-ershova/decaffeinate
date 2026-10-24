# S3 · ElevenLabs morning brief

**Could · D · 1.5h · Files:** `routes/brief.py` · §4
- Build a script from `GET /state` (call it over HTTP, don't import the engine): "Morning. Your last coffee today is 14:10…". Convert it to speech with ElevenLabs and return the MP3, cached per day.
- **Done when:** `curl /brief > a.mp3` plays.

## Track note

Every Jetson module except H3 must also run on a laptop (with a webcam, and GPIO mocked when `Jetson.GPIO` won't import).

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.
