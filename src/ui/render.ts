import type { LineResult, PrefixStatus } from '../lib/types';

export interface SummaryCounts {
  total: number;
  valid: number;
  fixable: number;
  invalid: number;
  kept: number;
}

export interface RenderCallbacks {
  onCorrect: (line: number) => void;
  onCancel: (line: number) => void;
  onApplyAll: () => void;
  onCopyValid: () => void;
  onGoToLine: (line: number) => void;
}

const STATUS_LABEL: Record<PrefixStatus, string> = {
  valid: 'Valid',
  fixable: 'Fixable',
  kept: 'Kept',
  invalid: 'Invalid',
  empty: '',
};

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

export function summarize(results: LineResult[]): SummaryCounts {
  const counts: SummaryCounts = { total: 0, valid: 0, fixable: 0, invalid: 0, kept: 0 };
  for (const r of results) {
    if (r.status === 'empty') continue;
    counts.total++;
    counts[r.status]++;
  }
  return counts;
}

export function renderResults(
  container: HTMLElement,
  results: LineResult[],
  cb: RenderCallbacks,
): void {
  container.replaceChildren();
  let shown = 0;
  for (const r of results) {
    if (r.status === 'empty') continue;
    container.append(buildRow(r, shown, cb));
    shown++;
  }
}

function buildRow(r: LineResult, index: number, cb: RenderCallbacks): HTMLElement {
  const row = el('li', `row row--${r.status}`);
  row.style.animationDelay = `${Math.min(index * 35, 400)}ms`;

  const lineBtn = el('button', 'row__line', String(r.line));
  lineBtn.type = 'button';
  lineBtn.title = `Go to line ${r.line}`;
  lineBtn.addEventListener('click', () => cb.onGoToLine(r.line));

  const body = el('div', 'row__body');
  switch (r.status) {
    case 'valid': {
      body.append(el('code', 'row__prefix row__prefix--ok', r.canonical ?? r.raw));
      if (r.raw !== r.canonical) {
        body.append(el('p', 'row__reason', `entered as ${r.raw}`));
      }
      break;
    }
    case 'fixable':
    case 'kept': {
      body.append(el('code', 'row__prefix row__prefix--dim', r.raw));
      if (r.fix) {
        const fixLine = el('p', 'row__fix');
        fixLine.append(
          el('span', 'row__arrow', '→'),
          el('code', 'row__prefix row__prefix--fix', r.fix.suggested),
        );
        body.append(fixLine);
        body.append(el('p', 'row__reason', r.fix.reasons.join(' · ')));
      }
      break;
    }
    case 'invalid': {
      body.append(el('code', 'row__prefix row__prefix--dim', r.raw));
      body.append(el('p', 'row__reason row__reason--error', r.reason));
      break;
    }
  }

  const side = el('div', 'row__side');
  side.append(el('span', `pill pill--${r.status}`, STATUS_LABEL[r.status]));
  if (r.status === 'fixable' && r.fix) {
    const actions = el('div', 'row__actions');
    const correct = el('button', 'btn btn--sm btn--primary', 'Correct');
    correct.type = 'button';
    correct.addEventListener('click', () => cb.onCorrect(r.line));
    const cancel = el('button', 'btn btn--sm', 'Cancel');
    cancel.type = 'button';
    cancel.addEventListener('click', () => cb.onCancel(r.line));
    actions.append(correct, cancel);
    side.append(actions);
  }

  row.append(lineBtn, body, side);
  return row;
}

export function renderChips(container: HTMLElement, counts: SummaryCounts): void {
  container.replaceChildren();
  if (counts.total === 0) {
    container.append(el('span', 'chips__empty', 'Nothing to verify'));
    return;
  }
  const chip = (cls: string, n: number, label: string) => {
    const c = el('span', `chip chip--${cls}`);
    c.append(el('strong', undefined, String(n)), el('span', undefined, label));
    return c;
  };
  if (counts.valid > 0) container.append(chip('ok', counts.valid, 'valid'));
  if (counts.fixable > 0) container.append(chip('warn', counts.fixable, 'fixable'));
  if (counts.invalid > 0) container.append(chip('err', counts.invalid, 'invalid'));
  if (counts.kept > 0) container.append(chip('muted', counts.kept, 'kept'));
}

export function renderActions(
  container: HTMLElement,
  counts: SummaryCounts,
  cb: RenderCallbacks,
): void {
  container.replaceChildren();
  if (counts.fixable > 0) {
    const applyAll = el(
      'button',
      'btn btn--sm btn--primary',
      `Apply all fixes (${counts.fixable})`,
    );
    applyAll.type = 'button';
    applyAll.addEventListener('click', () => cb.onApplyAll());
    container.append(applyAll);
  }
  if (counts.valid > 0) {
    const copy = el('button', 'btn btn--sm', `Copy valid (${counts.valid})`);
    copy.type = 'button';
    copy.addEventListener('click', () => cb.onCopyValid());
    container.append(copy);
  }
}
