/**
 * AES-256-GCM encryption utilities for securing API keys
 * Uses Web Crypto API for strong encryption
 */

const ENCRYPTION_KEY_ENV = 'API_KEY_ENCRYPTION_SECRET';

// Get or generate encryption key
async function getEncryptionKey(): Promise<CryptoKey> {
  const secret = Deno.env.get(ENCRYPTION_KEY_ENV);
  
  if (!secret) {
    throw new Error('API_KEY_ENCRYPTION_SECRET environment variable is not set. Please set a secure 32-byte base64 string.');
  }

  console.log('Encryption secret info:', {
    exists: !!secret,
    length: secret.length,
    preview: secret.substring(0, 10) + '...'
  });

  // Convert base64 secret to key material
  let keyMaterial;
  try {
    keyMaterial = Uint8Array.from(atob(secret), c => c.charCodeAt(0));
    console.log('Decoded key material length:', keyMaterial.length);
  } catch (error) {
    console.error('Failed to decode base64 secret:', error);
    throw new Error('Encryption secret is not valid base64. Please set a proper base64-encoded 32-byte key.');
  }
  
  if (keyMaterial.length !== 32) {
    throw new Error(`Encryption key must be exactly 32 bytes, but got ${keyMaterial.length} bytes. Please generate a new key using: crypto.getRandomValues(new Uint8Array(32)) and base64 encode it.`);
  }

  // Import as AES-GCM key
  return await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a string value using AES-256-GCM
 * Returns base64 encoded: iv:ciphertext
 */
export async function encrypt(plaintext: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Generate random IV (12 bytes for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Combine IV and ciphertext, convert to base64
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt a base64 encoded encrypted value
 * Expects format: iv:ciphertext
 */
export async function decrypt(encryptedData: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV and ciphertext
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generate a random 32-byte encryption key (base64 encoded)
 * Use this to generate a new encryption key for the environment variable
 */
export function generateEncryptionKey(): string {
  const key = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...key));
}