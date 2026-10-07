import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/space-grotesk';
import './style.css';
import type { LineResult } from './lib/types';
import { verifyAll } from './lib/verify';
import { renderActions, renderChips, renderResults, summarize } from './ui/render';
import type { RenderCallbacks } from './ui/render';

function $<E extends Element>(selector: string): E {
  const node = document.querySelector<E>(selector);
  if (!node) throw new Error(`Missing element: ${selector}`);
  return node;
}

const input = $<HTMLTextAreaElement>('#prefix-input');
const countEl = $<HTMLElement>('#entry-count');
const verifyBtn = $<HTMLButtonElement>('#btn-verify');
const sampleBtn = $<HTMLButtonElement>('#btn-sample');
const importBtn = $<HTMLButtonElement>('#btn-import');
const clearBtn = $<HTMLButtonElement>('#btn-clear');
const fileInput = $<HTMLInputElement>('#file-import');
const resultsCard = $<HTMLElement>('#results-card');
const chipsEl = $<HTMLElement>('#summary-chips');
const listEl = $<HTMLOListElement>('#results-list');
const actionsEl = $<HTMLElement>('#results-actions');
const toastEl = $<HTMLElement>('#toast');

const SAMPLE = [
  '192.168.1.0/24',
  '192.168.1.77/24',
  '10.0.14.9 255.255.0.0',
  '172.16.100.0 255.255.255.0',
  '203.0.113.128/25',
  '2001:db8::/32',
  '2001:db8:0:f101::1/64',
  'fe80::/10',
  '8.8.8.8/33',
  'not-a-prefix',
].join('\n');

let results: LineResult[] = [];

const callbacks: RenderCallbacks = {
  onCorrect,
  onCancel,
  onApplyAll,
  onCopyValid,
  onGoToLine,
};

function refresh(): void {
  const counts = summarize(results);
  renderChips(chipsEl, counts);
  renderResults(listEl, results, callbacks);
  renderActions(actionsEl, counts, callbacks);
  resultsCard.hidden = false;
}

function runVerify(): void {
  results = verifyAll(input.value);
  refresh();
}

function setLine(lineNo: number, content: string): void {
  const lines = input.value.split('\n');
  if (lineNo >= 1 && lineNo <= lines.length) {
    lines[lineNo - 1] = content;
    input.value = lines.join('\n');
  }
}

function applyFixes(fixes: Map<number, string>): void {
  if (fixes.size === 0) return;
  for (const [lineNo, content] of fixes) setLine(lineNo, content);
  runVerify();
}

function onCorrect(lineNo: number): void {
  const r = results.find((x) => x.line === lineNo);
  if (!r?.fix) return;
  applyFixes(new Map([[lineNo, r.fix.suggested]]));
  toast(`Line ${lineNo} corrected`);
}

function onApplyAll(): void {
  const fixes = new Map(
    results.flatMap((r) =>
      r.status === 'fixable' && r.fix ? [[r.line, r.fix.suggested] as const] : [],
    ),
  );
  if (fixes.size === 0) return;
  applyFixes(fixes);
  toast(`Applied ${fixes.size} ${fixes.size === 1 ? 'fix' : 'fixes'}`);
}

function onCancel(lineNo: number): void {
  const r = results.find((x) => x.line === lineNo);
  if (!r || r.status !== 'fixable') return;
  r.status = 'kept';
  refresh();
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

async function onCopyValid(): Promise<void> {
  const valid = results.flatMap((r) => (r.status === 'valid' && r.canonical ? [r.canonical] : []));
  if (valid.length === 0) return;
  const ok = await copyText(valid.join('\n'));
  toast(
    ok
      ? `Copied ${valid.length} valid ${valid.length === 1 ? 'prefix' : 'prefixes'}`
      : 'Copy failed',
  );
}

function onGoToLine(lineNo: number): void {
  const lines = input.value.split('\n');
  let start = 0;
  for (let i = 0; i < lineNo - 1; i++) start += (lines[i]?.length ?? 0) + 1;
  const len = lines[lineNo - 1]?.length ?? 0;
  input.focus();
  input.setSelectionRange(start, start + len);
  const lineHeight = parseFloat(getComputedStyle(input).lineHeight) || 22;
  input.scrollTop = Math.max(0, (lineNo - 1) * lineHeight - input.clientHeight / 2);
}

function updateCount(): void {
  const n = input.value.split('\n').filter((l) => l.trim() !== '').length;
  countEl.textContent = `${n} ${n === 1 ? 'entry' : 'entries'}`;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
function toast(message: string): void {
  toastEl.textContent = message;
  toastEl.classList.add('toast--show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('toast--show'), 2400);
}

verifyBtn.addEventListener('click', runVerify);

input.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    runVerify();
  }
});
input.addEventListener('input', updateCount);

sampleBtn.addEventListener('click', () => {
  input.value = SAMPLE;
  updateCount();
  runVerify();
});

clearBtn.addEventListener('click', () => {
  input.value = '';
  results = [];
  resultsCard.hidden = true;
  updateCount();
  input.focus();
});

importBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const text = await file.text();
  input.value = text;
  updateCount();
  runVerify();
  toast(`Imported ${file.name}`);
  fileInput.value = '';
});

updateCount();
