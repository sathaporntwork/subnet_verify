import type { Parsed } from './types';

export const IPV4_MAX_PREFIX = 32;

export interface Ipv4Address {
  value: number;
  /** At least one octet was written with leading zeros (e.g. "01"); read as decimal. */
  usedLeadingZeros: boolean;
}

export interface Ipv4Prefix {
  addr: number;
  prefix: number;
  /** The mask was written as a dotted netmask instead of "/len". */
  usedNetmaskNotation: boolean;
  usedLeadingZeros: boolean;
}

const OCTET_RE = /^\d{1,3}$/;
/** Decimal integer without leading zeros. */
const DECIMAL_RE = /^(?:0|[1-9]\d*)$/;

export function parseIpv4Address(text: string): Parsed<Ipv4Address> {
  const octets = text.split('.');
  if (octets.length !== 4) {
    return { ok: false, error: `"${text}" is not a valid IPv4 address (expected a.b.c.d)` };
  }
  let value = 0;
  let usedLeadingZeros = false;
  for (const octet of octets) {
    if (!OCTET_RE.test(octet)) {
      return { ok: false, error: `"${octet}" is not a valid octet in "${text}"` };
    }
    if (octet.length > 1 && octet.startsWith('0')) {
      usedLeadingZeros = true;
    }
    const n = Number(octet);
    if (n > 255) {
      return { ok: false, error: `Octet "${octet}" in "${text}" is out of range 0–255` };
    }
    value = ((value << 8) | n) >>> 0;
  }
  return { ok: true, value: { value, usedLeadingZeros } };
}

export function parseIpv4Prefix(input: string): Parsed<Ipv4Prefix> {
  const text = input.trim();
  let addrText: string;
  let maskText: string;
  let usedNetmaskNotation = false;

  const slash = text.indexOf('/');
  if (slash >= 0) {
    addrText = text.slice(0, slash).trim();
    maskText = text.slice(slash + 1).trim();
    if (maskText.includes('/')) {
      return { ok: false, error: `Too many "/" separators in "${text}"` };
    }
  } else {
    const fields = text.split(/\s+/);
    if (fields.length === 1) {
      return {
        ok: false,
        error: `"${text}" is not a valid prefix — expected address/length (e.g. ${text}/24)`,
      };
    }
    if (fields.length > 2) {
      return {
        ok: false,
        error: `"${text}" has too many fields — expected address + prefix length`,
      };
    }
    addrText = fields[0]!;
    maskText = fields[1]!;
    if (maskText.startsWith('/')) {
      maskText = maskText.slice(1);
    } else {
      usedNetmaskNotation = true;
    }
  }

  const addr = parseIpv4Address(addrText);
  if (!addr.ok) return addr;

  let prefix: number;
  if (/^\d+$/.test(maskText)) {
    if (!DECIMAL_RE.test(maskText)) {
      return { ok: false, error: `Invalid prefix length "/${maskText}"` };
    }
    prefix = Number(maskText);
    if (prefix > IPV4_MAX_PREFIX) {
      return { ok: false, error: `Prefix length /${prefix} is out of range 0–${IPV4_MAX_PREFIX}` };
    }
  } else {
    const mask = parseIpv4Address(maskText);
    if (!mask.ok) {
      return { ok: false, error: `"${maskText}" is neither a prefix length nor a netmask` };
    }
    const p = netmaskToPrefix(mask.value.value);
    if (p === null) {
      return {
        ok: false,
        error: `Netmask ${maskText} is not contiguous (e.g. 255.0.255.0 is invalid)`,
      };
    }
    prefix = p;
    usedNetmaskNotation = true;
  }

  return {
    ok: true,
    value: {
      addr: addr.value.value,
      prefix,
      usedNetmaskNotation,
      usedLeadingZeros: addr.value.usedLeadingZeros,
    },
  };
}

/** Mask with the top `prefix` bits set. */
export function prefixToMask(prefix: number): number {
  return prefix === 0 ? 0 : (-1 << (32 - prefix)) >>> 0;
}

/** Number of leading one-bits, or null when the mask is not contiguous. */
export function netmaskToPrefix(mask: number): number | null {
  let prefix = 0;
  let rest = mask >>> 0;
  while (rest & 0x80000000) {
    prefix++;
    rest = (rest << 1) >>> 0;
  }
  return rest === 0 ? prefix : null;
}

export function ipv4ToDotted(value: number): string {
  const v = value >>> 0;
  return [`${(v >>> 24) & 255}`, `${(v >>> 16) & 255}`, `${(v >>> 8) & 255}`, `${v & 255}`].join(
    '.',
  );
}
