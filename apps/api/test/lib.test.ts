import { beforeAll, describe, expect, it } from "vitest";
import { INVITE_CODE_CHARSET } from "@selenas-chase/shared";
import { generateInviteCode } from "../src/lib/inviteCode.js";
import { encryptToken, decryptToken } from "../src/lib/crypto.js";
import { signSession, verifySession } from "../src/lib/session.js";

beforeAll(() => {
  process.env.TOKEN_ENC_KEY = "a".repeat(64);
  process.env.JWT_SECRET = "test-secret";
});

describe("generateInviteCode", () => {
  it("produces 6 chars from the unambiguous charset", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateInviteCode();
      expect(code).toHaveLength(6);
      for (const c of code) expect(INVITE_CODE_CHARSET).toContain(c);
    }
  });

  it("never contains ambiguous characters", () => {
    for (const bad of ["I", "L", "O", "0", "1"]) {
      expect(INVITE_CODE_CHARSET).not.toContain(bad);
    }
  });
});

describe("token crypto (AES-256-GCM)", () => {
  it("round-trips", () => {
    const ct = encryptToken("refresh-token-xyz");
    expect(decryptToken(ct)).toBe("refresh-token-xyz");
  });

  it("ciphertext is not plaintext and IVs differ per call", () => {
    const a = encryptToken("same");
    const b = encryptToken("same");
    expect(a.toString("utf8")).not.toContain("same");
    expect(a.equals(b)).toBe(false);
  });

  it("rejects tampered ciphertext", () => {
    const ct = encryptToken("secret");
    ct[ct.length - 1] ^= 0xff;
    expect(() => decryptToken(ct)).toThrow();
  });
});

describe("session JWT", () => {
  it("round-trips claims", () => {
    const token = signSession({ user_id: "u-1" });
    expect(verifySession(token)).toEqual({ user_id: "u-1" });
  });

  it("rejects garbage and wrong-secret tokens", () => {
    expect(verifySession("not-a-jwt")).toBeNull();
    const token = signSession({ user_id: "u-1" });
    process.env.JWT_SECRET = "other";
    expect(verifySession(token)).toBeNull();
    process.env.JWT_SECRET = "test-secret";
  });
});
