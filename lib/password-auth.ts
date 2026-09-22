const encoder = new TextEncoder();

const PASSWORD_SCHEME = "pbkdf2-sha256";
const PASSWORD_ITERATIONS = 600_000;
const PASSWORD_BYTES = 32;
const SALT_BYTES = 16;

const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "billing",
  "help",
  "moderator",
  "recovery-inventory",
  "recoveryinventory",
  "root",
  "support",
  "system",
]);

const COMMON_PASSWORDS = new Set([
  "123456789012345",
  "correcthorsebatterystaple",
  "iloveyouiloveyou",
  "letmeinletmeinletmein",
  "passwordpassword",
  "password123456789",
  "qwertyqwertyqwerty",
  "recoveryinventory",
  "recoveryinventory123",
]);

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer as ArrayBuffer;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function normalizedPassword(value: string): string {
  return value.normalize("NFC");
}

function comparable(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en-US");
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    asArrayBuffer(encoder.encode(normalizedPassword(password))),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: asArrayBuffer(salt), iterations },
    key,
    PASSWORD_BYTES * 8,
  );
  return new Uint8Array(bits);
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

export type UsernameValue = {
  display: string;
  normalized: string;
};

export function validateUsername(value: unknown): { value?: UsernameValue; error?: string } {
  const display = typeof value === "string" ? value.normalize("NFKC").trim() : "";
  const length = Array.from(display).length;
  if (length < 3 || length > 32) {
    return { error: "Choose a username between 3 and 32 characters." };
  }
  if (!/^[\p{L}\p{N}](?:[\p{L}\p{N}._-]*[\p{L}\p{N}])?$/u.test(display)) {
    return { error: "Use letters, numbers, periods, underscores, or hyphens, and begin and end with a letter or number." };
  }
  const normalized = display.toLocaleLowerCase("en-US");
  if (RESERVED_USERNAMES.has(normalized)) {
    return { error: "Choose a different username." };
  }
  return { value: { display, normalized } };
}

export function validatePassword(value: unknown, personalValues: string[] = []): { value?: string; error?: string } {
  if (typeof value !== "string") return { error: "Enter a password." };
  const password = normalizedPassword(value);
  const length = Array.from(password).length;
  if (length < 15) return { error: "Use at least 15 characters for your password." };
  if (length > 128) return { error: "Use 128 characters or fewer for your password." };
  const lowered = comparable(password);
  const matchesPersonalValue = personalValues.some((item) => item && lowered === comparable(item));
  if (COMMON_PASSWORDS.has(lowered) || matchesPersonalValue) {
    return { error: "Choose a less common password that is different from your username, name, and email." };
  }
  return { value: password };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt, PASSWORD_ITERATIONS);
  return [PASSWORD_SCHEME, PASSWORD_ITERATIONS, bytesToBase64Url(salt), bytesToBase64Url(hash)].join("$");
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  try {
    const [scheme, iterationText, saltText, hashText, extra] = encoded.split("$");
    const iterations = Number(iterationText);
    if (extra !== undefined || scheme !== PASSWORD_SCHEME || !Number.isInteger(iterations) || iterations < 100_000 || iterations > 2_000_000) {
      return false;
    }
    const salt = base64UrlToBytes(saltText);
    const expected = base64UrlToBytes(hashText);
    if (salt.length < 16 || expected.length !== PASSWORD_BYTES) return false;
    const actual = await derive(password, salt, iterations);
    return equalBytes(actual, expected);
  } catch {
    return false;
  }
}

export async function consumePasswordHashWork(password: string): Promise<void> {
  const fixedSalt = new Uint8Array([71, 19, 201, 44, 88, 173, 5, 126, 211, 9, 61, 149, 237, 33, 101, 184]);
  await derive(password, fixedSalt, PASSWORD_ITERATIONS);
}
