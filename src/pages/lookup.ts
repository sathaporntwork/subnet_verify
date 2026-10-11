import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/space-grotesk';
import '../style.css';
import { MAX_PAIRS, estimatePairs, lookupAll, parseAddresses, parseSubnets } from '../lib/lookup';
import type { LookupRow } from '../lib/lookup';
import { copyText } from '../ui/clipboard';
import { $ } from '../ui/dom';
import { initThemePicker } from '../ui/theme';
import { attachToast } from '../ui/toast';
import { APP_VERSION } from '../version';

initThemePicker();

const versionEl = document.getElementById('app-version');
if (versionEl) {
  versionEl.textContent = `v${APP_VERSION}`;
}

const subnetsInput = $<HTMLTextAreaElement>('#subnets-input');
const ipsInput = $<HTMLTextAreaElement>('#ips-input');
const subnetCount = $<HTMLElement>('#subnet-count');
const ipCount = $<HTMLElement>('#ip-count');
const subnetNotes = $<HTMLElement>('#subnet-notes');
const lookupBtn = $<HTMLButtonElement>('#btn-lookup');
const resultsCard = $<HTMLElement>('#results-card');
const chipsEl = $<HTMLElement>('#results-chips');
const alertEl = $<HTMLElement>('#results-alert');
const tableEl = $<HTMLTableElement>('#results-table');
const bodyEl = $<HTMLTableSectionElement>('#results-body');
const actionsEl = $<HTMLElement>('#results-actions');
const toastEl = $<HTMLElement>('#toast');

const SAMPLE_SUBNETS = [
  '192.168.1.0/24',
  '10.0.0.0/8',
  '10.42.0.0/16',
  '172.16.5.128/25',
  '203.0.113.0/24',
  '2001:db8:1000::/48',
  'fe80::/10',
].join('\n');

const SAMPLE_IPS = [
  '192.168.1.55',
  '10.42.7.9',
  '172.16.5.200',
  '203.0.113.200',
  '8.8.8.8',
  '2001:db8:1000::abc',
  'fe80::1',
  '192.168.2.1',
  '300.1.1.1',
].join('\n');

const toast = attachToast(toastEl);

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function countEntries(text: string): number {
  return text.split('\n').filter((l) => l.trim() !== '').length;
}

function updateCounts(): void {
  const s = countEntries(subnetsInput.value);
  subnetCount.textContent = `${s} ${s === 1 ? 'entry' : 'entries'}`;
  const n = countEntries(ipsInput.value);
  ipCount.textContent = `${n} ${n === 1 ? 'entry' : 'entries'}`;
}

function renderNotes(
  errors: { line: number; error: string }[],
  normalized: number,
  total: number,
): void {
  subnetNotes.replaceChildren();
  if (errors.length > 0) {
    const shown = errors.slice(0, 3);
    const details = shown.map((e) => `line ${e.line}: ${e.error}`).join(' · ');
    const more = errors.length > shown.length ? ` · +${errors.length - shown.length} more` : '';
    subnetNotes.append(
      el(
        'p',
        'notes__error',
        `${errors.length} invalid ${errors.length === 1 ? 'line' : 'lines'} ignored (${details}${more})`,
      ),
    );
  }
  if (normalized > 0) {
    subnetNotes.append(
      el(
        'p',
        undefined,
        `${normalized} of ${total} ${total === 1 ? 'subnet' : 'subnets'} had host bits set — normalized to the network address`,
      ),
    );
  }
}

function renderChips(
  ips: number,
  matched: number,
  unmatched: number,
  invalid: number,
  subnets: number,
  normalized: number,
): void {
  chipsEl.replaceChildren();
  if (ips === 0) {
    chipsEl.append(el('span', 'chips__empty', 'Nothing to look up'));
    return;
  }
  const chip = (cls: string, n: number, label: string) => {
    const c = el('span', `chip chip--${cls}`);
    c.append(el('strong', undefined, String(n)), el('span', undefined, label));
    return c;
  };
  chipsEl.append(chip('neutral', subnets, 'subnets'));
  if (normalized > 0) chipsEl.append(chip('warn', normalized, 'normalized'));
  if (matched > 0) chipsEl.append(chip('ok', matched, 'matched'));
  if (unmatched > 0) chipsEl.append(chip('muted', unmatched, 'no match'));
  if (invalid > 0) chipsEl.append(chip('err', invalid, 'invalid'));
}

function renderRows(rows: LookupRow[]): void {
  bodyEl.replaceChildren();
  for (const { address, matches } of rows) {
    if (address.status === 'empty') continue;
    const tr = document.createElement('tr');
    if (address.status === 'invalid') tr.className = 'tr--invalid';

    const numTd = el('td', 'table__num', String(address.line));
    const ipTd = el('td');
    ipTd.append(el('code', 'table__ip', address.canonical ?? address.raw));
    if (address.status === 'invalid' && address.reason) {
      ipTd.append(el('p', 'table__reason', address.reason));
    }
    // Intentionally blank when no subnet contains the address.
    const matchTd = el('td');
    for (const m of matches) matchTd.append(el('span', 'table__match', m.canonical));

    tr.append(numTd, ipTd, matchTd);
    bodyEl.append(tr);
  }
  tableEl.hidden = bodyEl.children.length === 0;
}

function renderActions(rows: LookupRow[]): void {
  actionsEl.replaceChildren();
  const copyable = rows.filter((r) => r.address.status === 'valid');
  if (copyable.length === 0) return;
  const btn = el('button', 'btn btn--sm', `Copy table (${copyable.length})`);
  btn.type = 'button';
  btn.addEventListener('click', async () => {
    const tsv = copyable
      .map((r) => `${r.address.canonical}\t${r.matches.map((m) => m.canonical).join('; ')}`)
      .join('\n');
    const ok = await copyText(tsv);
    toast(
      ok ? `Copied ${copyable.length} ${copyable.length === 1 ? 'row' : 'rows'}` : 'Copy failed',
    );
  });
  actionsEl.append(btn);
}

function runLookup(): void {
  const { entries, errors, normalizedCount } = parseSubnets(subnetsInput.value);
  const addresses = parseAddresses(ipsInput.value);
  renderNotes(errors, normalizedCount, entries.length);

  resultsCard.hidden = false;
  alertEl.hidden = true;

  const pairs = estimatePairs(addresses, entries);
  if (pairs > MAX_PAIRS) {
    renderChips(0, 0, 0, 0, entries.length, normalizedCount);
    renderRows([]);
    renderActions([]);
    alertEl.textContent = `Too many combinations (${pairs.toLocaleString()} IP × subnet pairs) — split the input into smaller batches (limit ${MAX_PAIRS.toLocaleString()}).`;
    alertEl.hidden = false;
    return;
  }

  const rows = lookupAll(addresses, entries);
  const counted = rows.filter((r) => r.address.status !== 'empty');
  const matched = counted.filter(
    (r) => r.address.status === 'valid' && r.matches.length > 0,
  ).length;
  const unmatched = counted.filter(
    (r) => r.address.status === 'valid' && r.matches.length === 0,
  ).length;
  const invalid = counted.filter((r) => r.address.status === 'invalid').length;

  renderChips(counted.length, matched, unmatched, invalid, entries.length, normalizedCount);
  renderRows(rows);
  renderActions(rows);

  if (counted.some((r) => r.address.status === 'valid') && entries.length === 0) {
    alertEl.textContent = 'No valid reference subnets — add subnets on the left to match against.';
    alertEl.hidden = false;
  }
}

lookupBtn.addEventListener('click', runLookup);

for (const ta of [subnetsInput, ipsInput]) {
  ta.addEventListener('input', updateCounts);
  ta.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runLookup();
    }
  });
}

$<HTMLButtonElement>('#btn-subnets-sample').addEventListener('click', () => {
  subnetsInput.value = SAMPLE_SUBNETS;
  updateCounts();
});

$<HTMLButtonElement>('#btn-subnets-clear').addEventListener('click', () => {
  subnetsInput.value = '';
  subnetNotes.replaceChildren();
  updateCounts();
  subnetsInput.focus();
});

$<HTMLButtonElement>('#btn-ips-sample').addEventListener('click', () => {
  ipsInput.value = SAMPLE_IPS;
  updateCounts();
});

$<HTMLButtonElement>('#btn-ips-clear').addEventListener('click', () => {
  ipsInput.value = '';
  updateCounts();
  ipsInput.focus();
});

updateCounts();
