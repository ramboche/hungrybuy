import crypto from "crypto";

export function generateQrToken() {
  return crypto.randomBytes(32).toString("hex");
}
