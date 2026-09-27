# Mission

Run the Redact demo locally as a static site and verify browser-side PII detection.

## Working

- Sample text runs through the bundled Redact SDK in the browser.
- Detected entities render as highlights.
- The Redacted toggle replaces detected text with entity labels.
- The LiteRT WebAssembly core is served from `lib/` on the same origin.

## Faked

Nothing. The model downloads from the Hugging Face Hub on its first browser load, then the browser cache serves subsequent loads.

## Run

```sh
python3 -u -m http.server 4173
```

Open <http://127.0.0.1:4173>. The first load needs network access to fetch the model.
