import { describe, expect, it } from 'vitest';
import { verifyAll, verifyLine } from '../verify';

describe('verifyLine — IPv4', () => {
  it('accepts a proper network prefix', () => {
    expect(verifyLine('192.168.1.0/24', 1)).toMatchObject({
      status: 'valid',
      family: 'ipv4',
      canonical: '192.168.1.0/24',
    });
  });

  it('accepts host routes and the default route', () => {
    expect(verifyLine('10.20.30.40/32', 1).status).toBe('valid');
    expect(verifyLine('0.0.0.0/0', 1).status).toBe('valid');
  });

  it('flags host bits set as fixable with the masked suggestion', () => {
    const r = verifyLine('192.168.1.77/24', 3);
    expect(r.status).toBe('fixable');
    expect(r.fix?.suggested).toBe('192.168.1.0/24');
    expect(r.fix?.reasons[0]).toContain('Host bits are set');
  });

  it('normalizes a dotted netmask to CIDR', () => {
    const r = verifyLine('172.16.100.0 255.255.255.0', 1);
    expect(r.status).toBe('fixable');
    expect(r.fix?.suggested).toBe('172.16.100.0/24');
    expect(r.fix?.reasons.join(' ')).toContain('CIDR');
  });

  it('combines reasons for netmask + host bits', () => {
    const r = verifyLine('10.0.14.9 255.255.0.0', 1);
    expect(r.status).toBe('fixable');
    expect(r.fix?.suggested).toBe('10.0.0.0/16');
    expect(r.fix?.reasons).toHaveLength(2);
  });

  it('normalizes leading zeros to decimal', () => {
    const r = verifyLine('192.168.01.0/24', 1);
    expect(r.status).toBe('fixable');
    expect(r.fix?.suggested).toBe('192.168.1.0/24');
  });

  it('marks malformed input as invalid with a reason', () => {
    const r = verifyLine('300.1.2.3/24', 1);
    expect(r.status).toBe('invalid');
    expect(r.reason).toBeTruthy();
    expect(verifyLine('8.8.8.8/33', 1).status).toBe('invalid');
    expect(verifyLine('not-a-prefix', 1).status).toBe('invalid');
    expect(verifyLine('1.2.3.4', 1).status).toBe('invalid');
  });

  it('marks blank lines as empty', () => {
    expect(verifyLine('   ', 1).status).toBe('empty');
    expect(verifyLine('', 1).status).toBe('empty');
  });
});

describe('verifyLine — IPv6', () => {
  it('accepts a proper network prefix', () => {
    expect(verifyLine('2001:db8::/32', 1)).toMatchObject({
      status: 'valid',
      family: 'ipv6',
      canonical: '2001:db8::/32',
    });
  });

  it('canonicalizes uppercase and expanded input while staying valid', () => {
    const r = verifyLine('2001:0DB8:0000:0000:0000:0000:0000:0000/32', 1);
    expect(r.status).toBe('valid');
    expect(r.canonical).toBe('2001:db8::/32');
  });

  it('flags host bits set as fixable', () => {
    const r = verifyLine('2001:db8:0:f101::1/64', 1);
    expect(r.status).toBe('fixable');
    expect(r.fix?.suggested).toBe('2001:db8:0:f101::/64');
  });

  it('accepts the unspecified and loopback single-host prefixes', () => {
    expect(verifyLine('::/0', 1).status).toBe('valid');
    expect(verifyLine('::1/128', 1).status).toBe('valid');
  });

  it('marks malformed IPv6 as invalid', () => {
    expect(verifyLine('2001:db8::1::2/64', 1).status).toBe('invalid');
    expect(verifyLine('2001:db8::/129', 1).status).toBe('invalid');
    expect(verifyLine('fe80::1%eth0/64', 1).status).toBe('invalid');
    expect(verifyLine('2001:db8::1', 1).status).toBe('invalid');
  });
});

describe('verifyAll', () => {
  it('keeps line numbers and skips empties', () => {
    const results = verifyAll('\n192.168.1.0/24\n\n192.168.1.77/24');
    expect(results).toHaveLength(4);
    expect(results[0]?.status).toBe('empty');
    expect(results[1]).toMatchObject({ line: 2, status: 'valid' });
    expect(results[2]?.status).toBe('empty');
    expect(results[3]).toMatchObject({ line: 4, status: 'fixable' });
  });

  it('routes dotted-quad-less garbage to the IPv4 parser', () => {
    const r = verifyLine('hello world', 1);
    expect(r.status).toBe('invalid');
    expect(r.family).toBe('ipv4');
  });
});
