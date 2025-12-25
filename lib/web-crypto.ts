/**
 * Web Crypto API Utilities for Cloudflare Workers
 * 
 * This module provides cryptographic functions using the Web Crypto API,
 * which is available in Cloudflare Workers edge runtime.
 * 
 * It replaces Node.js crypto module which is NOT available in edge runtime.
 * 
 * @module lib/web-crypto
 * @since 1.0.0
 * @license MIT
 */

/**
 * Create HMAC SHA256 signature
 * 
 * This function generates an HMAC (Hash-based Message Authentication Code)
 * using SHA-256 algorithm. It's used primarily for verifying Razorpay
 * payment signatures and webhook authenticity.
 * 
 * Algorithm:
 * 1. Convert secret and data to Uint8Array using TextEncoder
 * 2. Import secret as a CryptoKey for HMAC-SHA256
 * 3. Sign the data using the key
 * 4. Convert result to hexadecimal string
 * 
 * @param secret - The secret key for HMAC (e.g., Razorpay key secret)
 * @param data - The data to sign (e.g., order_id|payment_id)
 * @returns Promise resolving to hexadecimal signature string
 * 
 * @example
 * ```typescript
 * const signature = await createHmacSha256('my_secret', 'data_to_sign')
 * // Returns: "a1b2c3d4..." (64 character hex string)
 * ```
 */
export async function createHmacSha256(
  secret: string,
  data: string
): Promise<string> {
  // Convert strings to Uint8Array (binary data)
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(data)

  // Import the secret as a CryptoKey for HMAC operations
  // This creates a key object that can be used with crypto.subtle
  const key = await crypto.subtle.importKey(
    'raw', // Key format (raw bytes)
    keyData, // The key data
    {
      name: 'HMAC', // Algorithm name
      hash: 'SHA-256' // Hash function to use
    },
    false, // Not extractable (security)
    ['sign'] // Can be used to sign data
  )

  // Sign the message data using HMAC-SHA256
  const signature = await crypto.subtle.sign('HMAC', key, messageData)

  // Convert ArrayBuffer to hex string
  // 1. Create Uint8Array view of the signature
  // 2. Convert each byte to hex (00-ff)
  // 3. Join all hex values into one string
  const hashArray = Array.from(new Uint8Array(signature))
  const hexSignature = hashArray
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

  return hexSignature
}

/**
 * Verify HMAC SHA256 signature
 * 
 * This function verifies if a given signature matches the expected HMAC
 * signature for the data. Used for validating Razorpay webhooks and
 * payment confirmations.
 * 
 * Security: Uses timing-safe comparison to prevent timing attacks.
 * 
 * @param secret - The secret key used for HMAC
 * @param data - The original data that was signed
 * @param expectedSignature - The signature to verify against
 * @returns Promise resolving to true if signature matches, false otherwise
 * 
 * @example
 * ```typescript
 * const isValid = await verifyHmacSha256(
 *   'my_secret',
 *   'data_to_verify',
 *   'received_signature'
 * )
 * // Returns: true or false
 * ```
 */
export async function verifyHmacSha256(
  secret: string,
  data: string,
  expectedSignature: string
): Promise<boolean> {
  // Generate signature from data
  const actualSignature = await createHmacSha256(secret, data)

  // Timing-safe comparison
  // This prevents timing attacks by always comparing all characters
  if (actualSignature.length !== expectedSignature.length) {
    return false
  }

  let isValid = true
  for (let i = 0; i < actualSignature.length; i++) {
    if (actualSignature[i] !== expectedSignature[i]) {
      isValid = false
    }
  }

  return isValid
}

/**
 * Generate random hexadecimal string
 * 
 * Uses Web Crypto API's secure random number generator to create
 * cryptographically strong random strings. Used for order IDs,
 * receipt numbers, and tokens.
 * 
 * Algorithm:
 * 1. Generate random bytes using crypto.getRandomValues()
 * 2. Convert bytes to hexadecimal string
 * 
 * @param length - Number of bytes to generate (output will be 2x this length)
 * @returns Hexadecimal string of random bytes
 * 
 * @example
 * ```typescript
 * const orderId = generateRandomHex(16)
 * // Returns: "a1b2c3d4e5f6..." (32 character hex string)
 * ```
 */
export function generateRandomHex(length: number): string {
  // Create array of random bytes
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)

  // Convert to hex string
  return Array.from(array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Generate random alphanumeric string
 * 
 * Generates a random string using uppercase letters and numbers.
 * Useful for order numbers, referral codes, etc.
 * 
 * @param length - Length of the string to generate
 * @returns Random alphanumeric string
 * 
 * @example
 * ```typescript
 * const code = generateRandomAlphanumeric(8)
 * // Returns: "A1B2C3D4"
 * ```
 */
export function generateRandomAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)

  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length]
  }

  return result
}

/**
 * Hash data using SHA-256
 * 
 * Creates a SHA-256 hash of the input data. Used for creating
 * unique identifiers or checksums.
 * 
 * @param data - Data to hash
 * @returns Promise resolving to hexadecimal hash string
 * 
 * @example
 * ```typescript
 * const hash = await sha256Hash('my data')
 * // Returns: "abc123..." (64 character hex string)
 * ```
 */
export async function sha256Hash(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)

  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)

  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate secure random token
 * 
 * Generates a URL-safe random token using base64 encoding.
 * Useful for session tokens, API keys, etc.
 * 
 * @param byteLength - Number of random bytes to generate
 * @returns Base64-encoded random token
 * 
 * @example
 * ```typescript
 * const token = generateSecureToken(32)
 * // Returns: "AbCdEf123..." (base64 string)
 * ```
 */
export function generateSecureToken(byteLength: number = 32): string {
  const array = new Uint8Array(byteLength)
  crypto.getRandomValues(array)

  // Convert to base64
  const base64 = btoa(String.fromCharCode(...array))

  // Make URL-safe
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
