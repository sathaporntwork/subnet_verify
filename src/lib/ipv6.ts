import type { Parsed } from './types';
import { parseIpv4Address } from './ipv4';

export const IPV6_MAX_PREFIX = 128;

const GROUP_RE = /^[0-9A-Fa-f]{1,4}$/;
/** Decimal integer without leading zeros, up to 3 digits. */
const DECIMAL_RE = /^(?:0|[1-9]\d{0,2})$/;

export interface Ipv6Prefix {
  value: bigint;
  prefix: number;
}

export function parseIpv6Prefix(input: string): Parsed<Ipv6Prefix> {
  const text = input.trim();
  const slash = text.indexOf('/');
  if (slash < 0) {
    return {
      ok: false,
      error: `"${text}" is not a valid prefix — expected address/length (e.g. 2001:db8::/32)`,
    };
  }
  const addrText = text.slice(0, slash).trim();
  const maskText = text.slice(slash + 1).trim();
  if (maskText.includes('/')) {
    return { ok: false, error: `Too many "/" separators in "${text}"` };
  }
  if (!DECIMAL_RE.test(maskText)) {
    return { ok: false, error: `Invalid prefix length "/${maskText}"` };
  }
  const prefix = Number(maskText);
  if (prefix > IPV6_MAX_PREFIX) {
    return { ok: false, error: `Prefix length /${prefix} is out of range 0–${IPV6_MAX_PREFIX}` };
  }
  if (addrText.includes('%')) {
    return { ok: false, error: 'Zone ID ("%") is not allowed in a subnet prefix' };
  }

  const addr = parseIpv6Address(addrText);
  if (!addr.ok) return addr;
  return { ok: true, value: { value: addr.value, prefix } };
}

export function parseIpv6Address(text: string): Parsed<bigint> {
  let rest = text;
  // An embedded dotted-quad tail (e.g. "::ffff:10.0.0.1") contributes the last two groups.
  let tailGroups: bigint[] = [];
  if (text.includes('.')) {
    const colon = text.lastIndexOf(':');
    if (colon < 0) {
      return { ok: false, error: `"${text}" is not a valid IPv6 address` };
    }
    const tail = text.slice(colon + 1);
    const v4 = parseIpv4Address(tail);
    if (!v4.ok) {
      return { ok: false, error: `Invalid embedded IPv4 "${tail}" in "${text}"` };
    }
    tailGroups = [BigInt((v4.value.value >>> 16) & 0xffff), BigInt(v4.value.value & 0xffff)];
    rest = text.slice(0, colon);
  }

  const pieces = rest.split('::');
  if (pieces.length > 2) {
    return { ok: false, error: `"${text}" contains more than one "::"` };
  }

  const parsePiece = (piece: string): Parsed<bigint[]> => {
    if (piece === '') return { ok: true, value: [] };
    const out: bigint[] = [];
    for (const group of piece.split(':')) {
      if (!GROUP_RE.test(group)) {
        return { ok: false, error: `"${group}" is not a valid hex group in "${text}"` };
      }
      out.push(BigInt(parseInt(group, 16)));
    }
    return { ok: true, value: out };
  };

  if (pieces.length === 1) {
    const head = parsePiece(pieces[0] ?? '');
    if (!head.ok) return head;
    const groups = [...head.value, ...tailGroups];
    if (groups.length !== 8) {
      return {
        ok: false,
        error: `"${text}" has ${groups.length} of 8 groups — use "::" to compress zero groups`,
      };
    }
    let value = 0n;
    for (const g of groups) value = (value << 16n) | g;
    return { ok: true, value };
  }

  const head = parsePiece(pieces[0] ?? '');
  if (!head.ok) return head;
  const tail = parsePiece(pieces[1] ?? '');
  if (!tail.ok) return tail;
  const compressed = 8 - head.value.length - tail.value.length - tailGroups.length;
  if (compressed < 1) {
    return { ok: false, error: `"${text}" — "::" must replace at least one zero group` };
  }
  let value = 0n;
  for (const g of head.value) value = (value << 16n) | g;
  value <<= BigInt(16 * compressed);
  for (const g of [...tail.value, ...tailGroups]) value = (value << 16n) | g;
  return { ok: true, value };
}

/** Network address with the host bits masked off. */
export function ipv6Network(value: bigint, prefix: number): bigint {
  if (prefix === 0) return 0n;
  const mask = ((1n << BigInt(prefix)) - 1n) << BigInt(128 - prefix);
  return value & mask;
}

/** Canonical text form per RFC 5952: lowercase hex, longest zero run compressed. */
export function ipv6Canonical(value: bigint): string {
  const groups: number[] = [];
  for (let shift = 112; shift >= 0; shift -= 16) {
    groups.push(Number((value >> BigInt(shift)) & 0xffffn));
  }
  let bestStart = -1;
  let bestLen = 0;
  let runStart = -1;
  for (let i = 0; i < 8; i++) {
    if (groups[i] === 0) {
      if (runStart < 0) runStart = i;
      const runLen = i - runStart + 1;
      if (runLen > bestLen) {
        bestLen = runLen;
        bestStart = runStart;
      }
    } else {
      runStart = -1;
    }
  }
  if (bestLen < 2) {
    return groups.map((g) => g.toString(16)).join(':');
  }
  const head = groups
    .slice(0, bestStart)
    .map((g) => g.toString(16))
    .join(':');
  const tail = groups
    .slice(bestStart + bestLen)
    .map((g) => g.toString(16))
    .join(':');
  return `${head}::${tail}`;
}
