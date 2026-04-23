import { resolveAttachmentFormat } from '../tools/index.js';

describe('resolveAttachmentFormat', () => {
  it('returns base64 for PDF in auto mode (magic-byte detection)', () => {
    const pdf = Buffer.concat([
      Buffer.from('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n1 0 obj\n<</Title (Test)>>\nendobj\n', 'binary'),
      Buffer.from('stream\n', 'binary'),
      Buffer.alloc(500, 0xff),
      Buffer.from('\nendstream\n', 'binary'),
    ]);
    expect(resolveAttachmentFormat(pdf, 'auto')).toBe('base64');
  });

  it('returns base64 for PNG in auto mode', () => {
    const png = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.alloc(200, 0xab),
    ]);
    expect(resolveAttachmentFormat(png, 'auto')).toBe('base64');
  });

  it('returns base64 for JPEG in auto mode', () => {
    const jpeg = Buffer.concat([
      Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]),
      Buffer.alloc(200, 0xcd),
    ]);
    expect(resolveAttachmentFormat(jpeg, 'auto')).toBe('base64');
  });

  it('returns base64 for GIF in auto mode', () => {
    const gif = Buffer.concat([
      Buffer.from('GIF89a', 'binary'),
      Buffer.alloc(200, 0x7f),
    ]);
    expect(resolveAttachmentFormat(gif, 'auto')).toBe('base64');
  });

  it('returns base64 for ZIP (docx/xlsx/etc) in auto mode', () => {
    const zip = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      Buffer.alloc(200, 0x55),
    ]);
    expect(resolveAttachmentFormat(zip, 'auto')).toBe('base64');
  });

  it('returns base64 for gzip in auto mode', () => {
    const gz = Buffer.concat([
      Buffer.from([0x1f, 0x8b, 0x08, 0x00]),
      Buffer.alloc(200, 0x33),
    ]);
    expect(resolveAttachmentFormat(gz, 'auto')).toBe('base64');
  });

  it('returns text for plain-text (.eml-like) in auto mode', () => {
    const eml = Buffer.from(
      'Received: from mail.example.com\r\n' +
      'From: customer@example.com\r\n' +
      'To: support@keurigonline.nl\r\n' +
      'Subject: Test\r\n\r\n' +
      'Dit is de inhoud van de mail.\r\n',
      'utf-8',
    );
    expect(resolveAttachmentFormat(eml, 'auto')).toBe('text');
  });

  it('returns text for ASCII-heavy log lines in auto mode', () => {
    const log = Buffer.from(
      '2026-04-23 21:28:15 INFO triage started ticket=1289263\n'.repeat(20),
      'utf-8',
    );
    expect(resolveAttachmentFormat(log, 'auto')).toBe('text');
  });

  it('returns base64 when first 2KB contains a null byte', () => {
    const buf = Buffer.concat([
      Buffer.from('prefix that looks like text\n', 'utf-8'),
      Buffer.from([0x00, 0x01, 0x02]),
      Buffer.alloc(100, 0x41),
    ]);
    expect(resolveAttachmentFormat(buf, 'auto')).toBe('base64');
  });

  it('returns base64 when printable-ASCII ratio < 0.9', () => {
    // Mostly high-bit bytes, no known magic, no null bytes
    const buf = Buffer.alloc(2048, 0x80);
    // Sprinkle a few printable chars so we don't coincidentally match a magic
    buf[0] = 0x41;
    expect(resolveAttachmentFormat(buf, 'auto')).toBe('base64');
  });

  it('honors explicit format=base64 override on text content', () => {
    const txt = Buffer.from('plain text content\n', 'utf-8');
    expect(resolveAttachmentFormat(txt, 'base64')).toBe('base64');
  });

  it('honors explicit format=text override on a PDF (caller accepts corruption)', () => {
    const pdf = Buffer.from('%PDF-1.4\nheader\n', 'binary');
    expect(resolveAttachmentFormat(pdf, 'text')).toBe('text');
  });

  it('handles empty buffer without throwing', () => {
    expect(resolveAttachmentFormat(Buffer.alloc(0), 'auto')).toBe('base64');
  });
});
