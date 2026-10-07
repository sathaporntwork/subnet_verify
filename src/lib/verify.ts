import { ipv4ToDotted, parseIpv4Prefix, prefixToMask } from './ipv4';
import { ipv6Canonical, ipv6Network, parseIpv6Prefix } from './ipv6';
import type { LineResult } from './types';

export function verifyLine(rawLine: string, line: number): LineResult {
  const raw = rawLine.trim();
  if (raw === '') return { line, raw, status: 'empty' };

  if (raw.includes(':')) {
    const parsed = parseIpv6Prefix(raw);
    if (!parsed.ok) {
      return { line, raw, status: 'invalid', family: 'ipv6', reason: parsed.error };
    }
    const { value, prefix } = parsed.value;
    const network = ipv6Network(value, prefix);
    const canonical = `${ipv6Canonical(network)}/${prefix}`;
    if (network === value) {
      return { line, raw, status: 'valid', family: 'ipv6', canonical };
    }
    return {
      line,
      raw,
      status: 'fixable',
      family: 'ipv6',
      canonical,
      fix: {
        suggested: canonical,
        reasons: ['Host bits are set — mask off to the network address'],
      },
    };
  }

  const parsed = parseIpv4Prefix(raw);
  if (!parsed.ok) {
    return { line, raw, status: 'invalid', family: 'ipv4', reason: parsed.error };
  }
  const { addr, prefix, usedNetmaskNotation, usedLeadingZeros } = parsed.value;
  const network = (addr & prefixToMask(prefix)) >>> 0;
  const canonical = `${ipv4ToDotted(network)}/${prefix}`;
  const reasons: string[] = [];
  if (network !== addr) {
    reasons.push(`Host bits are set — mask off to ${canonical}`);
  }
  if (usedNetmaskNotation) {
    reasons.push('Dotted netmask — normalized to CIDR notation');
  }
  if (usedLeadingZeros) {
    reasons.push('Leading zeros — normalized to decimal');
  }
  if (reasons.length === 0) {
    return { line, raw, status: 'valid', family: 'ipv4', canonical };
  }
  return {
    line,
    raw,
    status: 'fixable',
    family: 'ipv4',
    canonical,
    fix: { suggested: canonical, reasons },
  };
}

export function verifyAll(input: string): LineResult[] {
  return input.split('\n').map((line, idx) => verifyLine(line, idx + 1));
}
