import { randomInt } from "node:crypto";
import { INVITE_CODE_CHARSET } from "@selenas-chase/shared";

export function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += INVITE_CODE_CHARSET[randomInt(INVITE_CODE_CHARSET.length)];
  }
  return code;
}
