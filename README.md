---
title: "Redact: on-device PII redaction"
emoji: 🖊️
colorFrom: indigo
colorTo: gray
sdk: static
pinned: false
license: other
short_description: On-device multilingual PII redaction, in the browser.
---

# Redact - on-device PII redaction demo

A static, fully client-side demo of [`desert-ant-labs/redact`](https://huggingface.co/desert-ant-labs/redact):
a tiny multilingual PII detector that masks names, addresses, emails, phones,
cards, IBANs and national IDs across 27 languages.

Type or paste text (or pick a sample) and see detected entities highlighted, or
switch to the redacted view. **The text never leaves your browser** - the model
runs in-page through a local WebAssembly pipeline with
[LiteRT.js](https://www.npmjs.com/package/@litertjs/core) inference. The browser
model is int8 LiteRT (`.tflite`, ~24.5 MB); the Apple Core ML build is a smaller
4-bit model (~12 MB).

## Run locally

```sh
python3 -u -m http.server 4173
```

Open <http://127.0.0.1:4173>. The first load fetches the model from the Hugging Face Hub; later loads use the browser cache.

## How it runs

- Uses the published SDK, [`@desert-ant-labs/redact`](https://www.npmjs.com/package/@desert-ant-labs/redact)
  `0.6.0`, self-hosted under `lib/` so the WebAssembly core and LiteRT.js load
  same-origin (see the import map in `index.html`). The SDK includes the
  checksum-validated deterministic recognizer layer (national IDs for all 24 EU
  countries, all 27 EU VAT numbers, IMEI, driving licences, cards, IBAN/BIC and
  more) and the full post-model pipeline.
- The model (int8 LiteRT `.tflite`, ~24.5 MB) is fetched once from the Hugging
  Face Hub (`desert-ant-labs/redact`) and cached in the browser, then works
  offline. Inference runs on the XNNPACK CPU backend via LiteRT.js.
- `main.js` is just UI glue: it calls `redact.redaction(text)` and renders the
  detected spans.

To use Redact in your own app: `npm i @desert-ant-labs/redact @litertjs/core`.
