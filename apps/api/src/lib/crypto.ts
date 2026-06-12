import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// AES-256-GCM for OAuth refresh tokens at rest (plan §1 Security).
// Ciphertext layout: 12-byte IV ‖ 16-byte auth tag ‖ payload.

function key(): Buffer {
  const hex = process.env.TOKEN_ENC_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("TOKEN_ENC_KEY must be 32 bytes hex (openssl rand -hex 32)");
  }
  return Buffer.from(hex, "hex");
}

export function encryptToken(plaintext: string): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]);
}

export function decryptToken(ciphertext: Buffer): string {
  const iv = ciphertext.subarray(0, 12);
  const tag = ciphertext.subarray(12, 28);
  const data = ciphertext.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
