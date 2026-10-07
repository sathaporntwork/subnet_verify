import { describe, expect, it } from 'vitest';
import { ipv6Canonical, ipv6Network, parseIpv6Address, parseIpv6Prefix } from '../ipv6';

describe('parseIpv6Address', () => {
  it('parses full and compressed forms to the same value', () => {
    const full = parseIpv6Address('2001:0db8:0000:0000:0000:0000:0000:0001');
    const compressed = parseIpv6Address('2001:db8::1');
    expect(full).toEqual(compressed);
    expect(full.ok).toBe(true);
  });

  it('parses the all-zero address', () => {
    expect(parseIpv6Address('::')).toEqual({ ok: true, value: 0n });
  });

  it('parses embedded IPv4 tails', () => {
    const r = parseIpv6Address('::ffff:192.168.1.1');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(0x00000000000000000000ffffc0a80101n);
  });

  it('rejects more than one "::"', () => {
    expect(parseIpv6Address('1::2::3').ok).toBe(false);
  });

  it('rejects wrong group counts', () => {
    expect(parseIpv6Address('1:2:3:4:5:6:7').ok).toBe(false);
    expect(parseIpv6Address('1:2:3:4:5:6:7:8::').ok).toBe(false);
  });

  it('rejects bad groups', () => {
    expect(parseIpv6Address('12345::').ok).toBe(false);
    expect(parseIpv6Address('1:2:3:4:5:6:7:8g').ok).toBe(false);
    expect(parseIpv6Address(':1:2:3:4:5:6:7:8').ok).toBe(false);
  });
});

describe('parseIpv6Prefix', () => {
  it('parses a valid CIDR', () => {
    const r = parseIpv6Prefix('2001:db8::/32');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.prefix).toBe(32);
      expect(r.value.value).toBe(0x20010db8000000000000000000000000n);
    }
  });

  it('rejects a missing prefix length', () => {
    expect(parseIpv6Prefix('2001:db8::1').ok).toBe(false);
  });

  it('rejects out-of-range prefix lengths', () => {
    expect(parseIpv6Prefix('2001:db8::/129').ok).toBe(false);
    expect(parseIpv6Prefix('2001:db8::/0128').ok).toBe(false);
  });

  it('rejects zone IDs', () => {
    expect(parseIpv6Prefix('fe80::1%eth0/64').ok).toBe(false);
  });
});

describe('ipv6Network + ipv6Canonical', () => {
  it('masks host bits', () => {
    const addr = parseIpv6Address('2001:db8:0:f101::1');
    expect(addr.ok).toBe(true);
    if (addr.ok) {
      expect(ipv6Network(addr.value, 64)).toBe(0x20010db80000f1010000000000000000n);
    }
  });

  it('produces RFC 5952 canonical text', () => {
    expect(ipv6Canonical(0x20010db80000f1010000000000000000n)).toBe('2001:db8:0:f101::');
    expect(ipv6Canonical(0n)).toBe('::');
    expect(ipv6Canonical(1n)).toBe('::1');
    // A single zero group must not be compressed.
    expect(ipv6Canonical(0x20010db8000000000000000000000001n)).toBe('2001:db8::1');
    // Ties compress the leftmost run.
    expect(ipv6Canonical(0x00010000000000020003000000000004n)).toBe('1::2:3:0:0:4');
    // Lowercases hex.
    expect(ipv6Canonical(0x00ab00cd00ef00000000000000000000n)).toBe('ab:cd:ef::');
  });
});
