import { env } from "cloudflare:workers";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function arrayBuffer(bytes: Uint8Array): ArrayBuffer {
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

export function randomToken(byteLength = 32): string {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

export function createRecoveryCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `RI-${hex.match(/.{1,4}/g)?.join("-") ?? hex}`.toUpperCase();
}

export function normalizeRecoveryCode(value: string): string {
  const clean = value.toUpperCase().replace(/[^A-F0-9]/g, "").replace(/^RI/, "");
  return `RI-${clean.match(/.{1,4}/g)?.join("-") ?? clean}`;
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

function encryptionKeyBytes(): Uint8Array {
  const value = env.DATA_ENCRYPTION_KEY;
  if (!value) throw new Error("DATA_ENCRYPTION_KEY is not configured.");
  const bytes = base64UrlToBytes(value.trim());
  if (bytes.length !== 32) throw new Error("DATA_ENCRYPTION_KEY must decode to exactly 32 bytes.");
  return bytes;
}

export async function encryptJson(payload: unknown): Promise<string> {
  const key = await crypto.subtle.importKey("raw", arrayBuffer(encryptionKeyBytes()), "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(payload)));
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return bytesToBase64Url(combined);
}

export async function decryptJson<T>(encrypted: string): Promise<T> {
  const combined = base64UrlToBytes(encrypted);
  if (combined.length < 29) throw new Error("Encrypted inventory is invalid.");
  const key = await crypto.subtle.importKey("raw", arrayBuffer(encryptionKeyBytes()), "AES-GCM", false, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: combined.slice(0, 12) },
    key,
    combined.slice(12),
  );
  return JSON.parse(decoder.decode(plaintext)) as T;
}

export function utf8(value: string): ArrayBuffer {
  return arrayBuffer(encoder.encode(value));
}

export function signatureBytes(value: string): ArrayBuffer {
  return arrayBuffer(Uint8Array.from(value.match(/.{1,2}/g) ?? [], (pair) => Number.parseInt(pair, 16)));
}
