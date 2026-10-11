import { describe, expect, it } from 'vitest';
import {
  estimatePairs,
  lookupAll,
  parseAddressLine,
  parseAddresses,
  parseSubnetLine,
  parseSubnets,
} from '../lookup';

function sub(raw: string, line = 1) {
  const r = parseSubnetLine(raw, line);
  if (r.kind !== 'entry') throw new Error(`expected an entry for "${raw}"`);
  return r.entry;
}

const addr = (raw: string, line = 1) => parseAddressLine(raw, line);

describe('parseSubnetLine', () => {
  it('parses a CIDR v4 subnet with its broadcast address', () => {
    const e = sub('192.168.1.0/24');
    expect(e).toMatchObject({
      family: 'ipv4',
      prefix: 24,
      canonical: '192.168.1.0/24',
      normalized: false,
    });
    expect(e.network).toBe(0xc0a80100n);
    expect(e.broadcast).toBe(0xc0a801ffn);
  });

  it('normalizes host bits and netmask notation', () => {
    expect(sub('10.0.14.9 255.255.0.0')).toMatchObject({
      canonical: '10.0.0.0/16',
      normalized: true,
    });
    expect(sub('192.168.1.77/24')).toMatchObject({ canonical: '192.168.1.0/24', normalized: true });
    expect(sub('172.16.5.128/25')).toMatchObject({
      canonical: '172.16.5.128/25',
      normalized: false,
    });
  });

  it('covers the whole address space for /0', () => {
    expect(sub('0.0.0.0/0').broadcast).toBe(0xffffffffn);
    expect(sub('::/0').broadcast).toBe((1n << 128n) - 1n);
  });

  it('parses IPv6 subnets', () => {
    const e = sub('2001:db8:1000::/48', 3);
    expect(e.canonical).toBe('2001:db8:1000::/48');
    expect(e.broadcast).toBe((0x20010db81000n << 80n) | ((1n << 80n) - 1n));
  });

  it('reports errors and skips empty lines', () => {
    expect(parseSubnetLine('   ', 1).kind).toBe('empty');
    expect(parseSubnetLine('8.8.8.8/33', 2).kind).toBe('error');
    expect(parseSubnetLine('nope', 3).kind).toBe('error');
  });
});

describe('parseSubnets', () => {
  it('collects entries, errors and the normalized count', () => {
    const r = parseSubnets('10.0.0.0/8\n\n192.168.1.77/24\nbad-line');
    expect(r.entries).toHaveLength(2);
    expect(r.errors).toEqual([{ line: 4, error: expect.stringContaining('not a valid') }]);
    expect(r.normalizedCount).toBe(1);
  });
});

describe('parseAddressLine', () => {
  it('parses bare IPv4 and IPv6 addresses', () => {
    expect(addr('10.1.2.3')).toMatchObject({
      status: 'valid',
      family: 'ipv4',
      canonical: '10.1.2.3',
    });
    expect(addr('2001:DB8::1')).toMatchObject({
      status: 'valid',
      family: 'ipv6',
      canonical: '2001:db8::1',
    });
  });

  it('rejects prefix lengths and extra fields', () => {
    expect(addr('10.0.0.0/8').status).toBe('invalid');
    expect(addr('10.0.0.0 255.0.0.0').status).toBe('invalid');
  });

  it('marks garbage invalid and skips empties', () => {
    expect(addr('300.1.1.1').status).toBe('invalid');
    expect(addr('   ').status).toBe('empty');
  });

  it('keeps line numbers through parseAddresses', () => {
    const list = parseAddresses('\n8.8.8.8');
    expect(list[0]?.status).toBe('empty');
    expect(list[1]).toMatchObject({ line: 2, status: 'valid' });
  });
});

describe('lookupAll', () => {
  const subnets = [
    sub('192.168.1.0/24', 1),
    sub('10.0.0.0/8', 2),
    sub('10.42.0.0/16', 3),
    sub('2001:db8:1000::/48', 4),
  ];
  const canons = (rows: ReturnType<typeof lookupAll>) => rows[0]?.matches.map((m) => m.canonical);

  it('finds the containing subnet', () => {
    expect(canons(lookupAll([addr('192.168.1.55')], subnets))).toEqual(['192.168.1.0/24']);
  });

  it('lists every overlapping subnet in subnets-input order', () => {
    expect(canons(lookupAll([addr('10.42.7.9')], subnets))).toEqual(['10.0.0.0/8', '10.42.0.0/16']);
  });

  it('matches within the same family only', () => {
    expect(canons(lookupAll([addr('2001:db8:1000::abc')], subnets))).toEqual([
      '2001:db8:1000::/48',
    ]);
    expect(lookupAll([addr('10.1.1.1')], [sub('2001:db8::/32', 1)])[0]?.matches).toEqual([]);
  });

  it('leaves unmatched and invalid addresses with no matches', () => {
    const rows = lookupAll([addr('8.8.8.8'), addr('300.1.1.1', 2)], subnets);
    expect(rows[0]?.matches).toEqual([]);
    expect(rows[1]?.matches).toEqual([]);
  });

  it('respects the broadcast boundary', () => {
    expect(lookupAll([addr('192.168.2.0')], subnets)[0]?.matches).toEqual([]);
    expect(canons(lookupAll([addr('192.168.1.255')], subnets))).toEqual(['192.168.1.0/24']);
  });

  it('estimates the pair count for the guard', () => {
    expect(estimatePairs([addr('1.1.1.1'), addr('2.2.2.2', 2), addr('x', 3)], subnets)).toBe(8);
  });
});
