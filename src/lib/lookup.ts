import { ipv4ToDotted, parseIpv4Address, parseIpv4Prefix, prefixToMask } from './ipv4';
import { ipv6Canonical, ipv6Network, parseIpv6Address, parseIpv6Prefix } from './ipv6';
import type { IpFamily } from './types';

/** A reference subnet parsed and normalized to its network address. */
export interface SubnetEntry {
  /** 1-based line number in the subnets input. */
  line: number;
  raw: string;
  family: IpFamily;
  network: bigint;
  broadcast: bigint;
  prefix: number;
  canonical: string;
  /** Host bits were set in the input; the network address was masked off automatically. */
  normalized: boolean;
}

/** An IP address from the lookup input. */
export interface AddressEntry {
  line: number;
  raw: string;
  status: 'valid' | 'invalid' | 'empty';
  family?: IpFamily;
  value?: bigint;
  canonical?: string;
  reason?: string;
}

export interface LookupRow {
  address: AddressEntry;
  /** Containing subnets, in subnets-input order. Empty when the address matches none. */
  matches: SubnetEntry[];
}

export type SubnetLine =
  { kind: 'empty' } | { kind: 'entry'; entry: SubnetEntry } | { kind: 'error'; error: string };

/** Hard cap on IP × subnet pair comparisons per lookup run. */
export const MAX_PAIRS = 5_000_000;

/** Parses one reference-subnet line. Accepts the same notations as the verify page. */
export function parseSubnetLine(rawLine: string, line: number): SubnetLine {
  const raw = rawLine.trim();
  if (raw === '') return { kind: 'empty' };

  if (raw.includes(':')) {
    const parsed = parseIpv6Prefix(raw);
    if (!parsed.ok) return { kind: 'error', error: parsed.error };
    const { value, prefix } = parsed.value;
    const network = ipv6Network(value, prefix);
    const broadcast = network | ((1n << BigInt(128 - prefix)) - 1n);
    return {
      kind: 'entry',
      entry: {
        line,
        raw,
        family: 'ipv6',
        network,
        broadcast,
        prefix,
        canonical: `${ipv6Canonical(network)}/${prefix}`,
        normalized: value !== network,
      },
    };
  }

  const parsed = parseIpv4Prefix(raw);
  if (!parsed.ok) return { kind: 'error', error: parsed.error };
  const { addr, prefix } = parsed.value;
  const mask = prefixToMask(prefix);
  const network = (addr & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  return {
    kind: 'entry',
    entry: {
      line,
      raw,
      family: 'ipv4',
      network: BigInt(network),
      broadcast: BigInt(broadcast),
      prefix,
      canonical: `${ipv4ToDotted(network)}/${prefix}`,
      normalized: addr !== network,
    },
  };
}

/** Parses one lookup line: a bare IP address, nothing else. */
export function parseAddressLine(rawLine: string, line: number): AddressEntry {
  const raw = rawLine.trim();
  if (raw === '') return { line, raw, status: 'empty' };
  if (/[/\s]/.test(raw)) {
    return {
      line,
      raw,
      status: 'invalid',
      reason: 'Expected a bare IP address — this column takes addresses, not prefixes',
    };
  }
  if (raw.includes(':')) {
    const parsed = parseIpv6Address(raw);
    if (!parsed.ok) return { line, raw, status: 'invalid', reason: parsed.error };
    return {
      line,
      raw,
      status: 'valid',
      family: 'ipv6',
      value: parsed.value,
      canonical: ipv6Canonical(parsed.value),
    };
  }
  const parsed = parseIpv4Address(raw);
  if (!parsed.ok) return { line, raw, status: 'invalid', reason: parsed.error };
  const value = parsed.value.value >>> 0;
  return {
    line,
    raw,
    status: 'valid',
    family: 'ipv4',
    value: BigInt(value),
    canonical: ipv4ToDotted(value),
  };
}

export interface SubnetParseResult {
  entries: SubnetEntry[];
  errors: { line: number; error: string }[];
  normalizedCount: number;
}

export function parseSubnets(input: string): SubnetParseResult {
  const entries: SubnetEntry[] = [];
  const errors: { line: number; error: string }[] = [];
  let normalizedCount = 0;
  input.split('\n').forEach((rawLine, i) => {
    const result = parseSubnetLine(rawLine, i + 1);
    if (result.kind === 'entry') {
      entries.push(result.entry);
      if (result.entry.normalized) normalizedCount++;
    } else if (result.kind === 'error') {
      errors.push({ line: i + 1, error: result.error });
    }
  });
  return { entries, errors, normalizedCount };
}

export function parseAddresses(input: string): AddressEntry[] {
  return input.split('\n').map((rawLine, i) => parseAddressLine(rawLine, i + 1));
}

/** Number of IP × subnet comparisons a full lookup would perform. */
export function estimatePairs(addresses: AddressEntry[], subnets: SubnetEntry[]): number {
  const valid = addresses.reduce((n, a) => (a.status === 'valid' ? n + 1 : n), 0);
  return valid * subnets.length;
}

export function lookupAll(addresses: AddressEntry[], subnets: SubnetEntry[]): LookupRow[] {
  const pools: Record<IpFamily, SubnetEntry[]> = { ipv4: [], ipv6: [] };
  for (const subnet of subnets) pools[subnet.family].push(subnet);
  return addresses.map((address) => {
    const { family, value } = address;
    const matches =
      address.status === 'valid' && family !== undefined && value !== undefined
        ? pools[family].filter((s) => s.network <= value && value <= s.broadcast)
        : [];
    return { address, matches };
  });
}
