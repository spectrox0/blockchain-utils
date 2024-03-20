// @ts-ignore
import * as argon2 from "argon2-browser/dist/argon2-bundled.min";

export const verifyPassword = async ({
  storedPassword,
  value,
}: {
  storedPassword: string;
  value?: string;
}): Promise<boolean> => {
  if (!value) return false;
  try {
    await argon2.verify({
      encoded: storedPassword,
      pass: Uint8Array.from(Buffer.from(value)),
    });
    return true;
  } catch (_) {
    return false;
  }
};
