import { describe, expect, it } from 'vitest';
import {
  ipv4ToDotted,
  netmaskToPrefix,
  parseIpv4Address,
  parseIpv4Prefix,
  prefixToMask,
} from '../ipv4';

describe('parseIpv4Address', () => {
  it('parses a valid address', () => {
    expect(parseIpv4Address('192.168.1.1')).toEqual({
      ok: true,
      value: { value: 0xc0a80101, usedLeadingZeros: false },
    });
  });

  it('rejects wrong octet counts', () => {
    for (const bad of ['1.2.3', '1.2.3.4.5', '1.2.3.4.5.6', '']) {
      expect(parseIpv4Address(bad).ok).toBe(false);
    }
  });

  it('rejects octets above 255', () => {
    expect(parseIpv4Address('300.1.1.1').ok).toBe(false);
  });

  it('rejects non-numeric octets', () => {
    expect(parseIpv4Address('a.b.c.d').ok).toBe(false);
    expect(parseIpv4Address('1.2.3.x').ok).toBe(false);
  });

  it('flags leading zeros as decimal interpretation', () => {
    const r = parseIpv4Address('192.168.01.1');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual({ value: 0xc0a80101, usedLeadingZeros: true });
  });
});

describe('parseIpv4Prefix', () => {
  it('parses CIDR notation', () => {
    const r = parseIpv4Prefix('10.0.0.0/8');
    expect(r).toEqual({
      ok: true,
      value: { addr: 0x0a000000, prefix: 8, usedNetmaskNotation: false, usedLeadingZeros: false },
    });
  });

  it('parses dotted netmask after a space', () => {
    const r = parseIpv4Prefix('10.0.0.1 255.255.0.0');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.prefix).toBe(16);
      expect(r.value.usedNetmaskNotation).toBe(true);
    }
  });

  it('parses dotted netmask after a slash', () => {
    const r = parseIpv4Prefix('10.0.0.1/255.255.255.0');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.prefix).toBe(24);
      expect(r.value.usedNetmaskNotation).toBe(true);
    }
  });

  it('rejects a missing prefix length', () => {
    expect(parseIpv4Prefix('1.2.3.4').ok).toBe(false);
  });

  it('rejects out-of-range prefix lengths', () => {
    expect(parseIpv4Prefix('10.0.0.0/33').ok).toBe(false);
  });

  it('rejects leading zeros in the prefix length', () => {
    expect(parseIpv4Prefix('10.0.0.0/024').ok).toBe(false);
  });

  it('rejects non-contiguous netmasks', () => {
    expect(parseIpv4Prefix('10.0.0.1/255.0.255.0').ok).toBe(false);
  });

  it('rejects garbage masks', () => {
    expect(parseIpv4Prefix('10.0.0.1/abc').ok).toBe(false);
  });

  it('rejects too many fields', () => {
    expect(parseIpv4Prefix('10.0.0.1 255.255.0.0 extra').ok).toBe(false);
  });

  it('tolerates "addr /len" spacing', () => {
    const r = parseIpv4Prefix('10.0.0.1 /24');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.prefix).toBe(24);
  });
});

describe('mask helpers', () => {
  it('converts prefix to mask', () => {
    expect(prefixToMask(0)).toBe(0);
    expect(prefixToMask(8)).toBe(0xff000000);
    expect(prefixToMask(24)).toBe(0xffffff00);
    expect(prefixToMask(32)).toBe(0xffffffff);
  });

  it('converts netmask to prefix and detects non-contiguity', () => {
    expect(netmaskToPrefix(0xffffff00)).toBe(24);
    expect(netmaskToPrefix(0xfffffc00)).toBe(22);
    expect(netmaskToPrefix(0xff00ff00)).toBeNull();
    expect(netmaskToPrefix(0)).toBe(0);
  });

  it('round-trips dotted output', () => {
    expect(ipv4ToDotted(0xc0a80101)).toBe('192.168.1.1');
    expect(ipv4ToDotted(0)).toBe('0.0.0.0');
  });
});
