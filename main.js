// Redact demo glue: load the model, run the deterministic-owner hybrid pipeline
// on the current text, and render detected spans as highlights or as a redacted
// version. Everything runs in the browser - the text never leaves the page.
//
// This demo uses the published SDK, @desert-ant-labs/redact (from npm via a CDN).
// Install it in your own app with `npm i @desert-ant-labs/redact`; the model is
// fetched from the Hugging Face Hub on first load and cached in the browser.

import { load } from '@desert-ant-labs/redact';
import { SAMPLES } from './lib/samples.mjs';

// Desert Ant usage key — attributes this app's on-device usage to our account.
const USAGE_KEY = 'dal_8ZC7e5sQULDhcj2xVcxpfXxFJPRU_SIS';

const $ = (id) => document.getElementById(id);
const input = $('input');
const result = $('result');
const status = $('status');
const samplesEl = $('samples');

// label → category (drives the color palette in redact.css)
const CATEGORY = {
  GIVEN_NAME: 'name', SURNAME: 'name',
  EMAIL: 'contact', PHONE: 'contact', URL: 'contact', IP_ADDRESS: 'contact',
  CREDIT_CARD: 'finance', BANK_ACCOUNT: 'finance', ROUTING_NUMBER: 'finance',
  TAX_ID: 'finance', SSN: 'finance',
  GOVERNMENT_ID: 'id', PASSPORT: 'id', DRIVERS_LICENSE: 'id',
  STREET_NAME: 'address', BUILDING_NUMBER: 'address', SECONDARY_ADDRESS: 'address',
  CITY: 'address', STATE: 'address', ZIP_CODE: 'address',
};

const setStatus = (msg, err) => { status.textContent = msg; status.classList.toggle('err', !!err); };
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const view = () => document.querySelector('input[name=view]:checked').value;

let redact = null;
let lastSpans = [];
let seq = 0;

// ── Rendering ─────────────────────────────────────────────────────────────
function render(text, spans) {
  if (!text) { result.innerHTML = ''; return; }
  const redacted = view() === 'redacted';
  let html = '', cursor = 0;
  for (const s of spans) {
    html += esc(text.slice(cursor, s.start));
    const cat = CATEGORY[s.label] || 'name';
    if (redacted) {
      html += `<span class="mask cat-${cat}">[${s.label}]</span>`;
    } else {
      html += `<span class="ent cat-${cat}">${esc(text.slice(s.start, s.end))}<span class="tag">${s.label}</span></span>`;
    }
    cursor = s.end;
  }
  html += esc(text.slice(cursor));
  result.innerHTML = html;
}

// ── Inference (debounced) ──────────────────────────────────────────────────
let timer = null;
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(run, 180);
}

async function run() {
  if (!redact) return;
  const text = input.value;
  const my = ++seq;
  if (!text.trim()) { lastSpans = []; render(text, []); setStatus('Ready.'); return; }
  setStatus('Scanning…');
  const t0 = performance.now();
  try {
    const spans = await redact.detect(text);
    if (my !== seq) return; // superseded
    lastSpans = spans;
    render(text, spans);
    const ms = Math.round(performance.now() - t0);
    setStatus(`${spans.length} ${spans.length === 1 ? 'entity' : 'entities'} · ${ms} ms · on device`);
  } catch (e) {
    console.error(e);
    setStatus('Inference failed - see console.', true);
  }
}

// ── Samples ────────────────────────────────────────────────────────────────
Object.keys(SAMPLES).forEach((name, i) => {
  const b = document.createElement('button');
  b.textContent = name;
  b.onclick = () => {
    samplesEl.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    input.value = SAMPLES[name];
    schedule();
  };
  samplesEl.appendChild(b);
  if (i === 0) b.classList.add('active');
});

input.addEventListener('input', () => {
  samplesEl.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
  schedule();
});
$('viewToggle').addEventListener('change', () => render(input.value, lastSpans));

// ── Boot ───────────────────────────────────────────────────────────────────
(async function boot() {
  input.value = SAMPLES[Object.keys(SAMPLES)[0]];
  try {
    redact = await load({ usageKey: USAGE_KEY });
    setStatus('Ready.');
    run();
  } catch (e) {
    console.error(e);
    setStatus('Model failed to load - see console.', true);
  }
})();
