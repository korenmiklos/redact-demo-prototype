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
cards, IBANs and national IDs across 24 EU languages.

Type or paste text (or pick a sample) and see detected entities highlighted, or
switch to the redacted view. **The text never leaves your browser** - the model
runs in-page via [transformers.js](https://github.com/huggingface/transformers.js).
The browser build is int8 (~23 MB) for onnxruntime-web compatibility; the
on-device SDK / native builds use the smaller int4 model (~13.7 MB).

## How it runs

- Loads the published SDK, [`@desert-ant-labs/redact`](https://www.npmjs.com/package/@desert-ant-labs/redact),
  from npm via a CDN (see the import map in `index.html`). The SDK bundles the
  tiny token classifier + the checksum-validated deterministic recognizer layer
  (national IDs for all 24 EU countries, all 27 EU VAT numbers, IMEI, driving
  licences, cards, IBAN/BIC and more) and the full post-model pipeline.
- The model (int8 ONNX, ~23 MB) is fetched once from the Hugging Face Hub
  (`desert-ant-labs/redact`) and cached in the browser, then works offline.
- `main.js` is just UI glue: it calls `redact.detect(text)` and renders the spans.

To use Redact in your own app: `npm i @desert-ant-labs/redact`.
