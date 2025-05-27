import { Base64 } from 'js-base64';
import crypto from 'crypto';

export function generateCodeVerifier() {
  return Base64.fromUint8Array(crypto.randomBytes(32), true);
}

export function generateCodeChallenge(codeVerifier) {
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  return Base64.fromUint8Array(hash, true);
}
