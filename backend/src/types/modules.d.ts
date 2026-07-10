// These extraction libraries do not ship TypeScript declarations. We declare
// them as ambient modules so the build stays clean; we only use a small,
// well-known surface of each (pdf-parse(buffer) and mammoth.extractRawText).
declare module 'pdf-parse';
declare module 'mammoth';
