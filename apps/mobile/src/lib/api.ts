import { BexoApiClient } from '@bexo/shared';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${defaultHost}:3000/api/v1`;

export const client = new BexoApiClient({
  baseUrl: API_BASE_URL,
});

// Variable to keep track of the loaded token in memory synchronously
let cachedToken: string | null = null;

// Synchronous Base64URL decoder for JWT decoding on React Native
function base64Decode(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let buffer = '';
  const cleanStr = str.replace(/=+$/, '');
  
  let bc = 0;
  let bs = 0;
  for (let i = 0; i < cleanStr.length; i++) {
    const char = cleanStr.charAt(i);
    const idx = chars.indexOf(char);
    if (idx === -1) continue;
    
    bs = bc % 4 ? bs * 64 + idx : idx;
    if (bc++ % 4) {
      buffer += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
    }
  }
  return buffer;
}

function decodeBase64Url(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0: break;
    case 2: output += '=='; break;
    case 3: output += '='; break;
    default: throw new Error('Illegal base64url string');
  }
  return base64Decode(output);
}

/**
 * Loads the token asynchronously from SecureStore during app startup.
 */
export async function loadSavedToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync('bexo_access_token');
    if (token) {
      cachedToken = token;
      client.setToken(token);
      return token;
    }
  } catch (e) {
    console.warn('Failed to read secure store token', e);
  }
  return null;
}

/**
 * Sets the authentication token and persists it to SecureStore.
 */
export async function setAccessToken(token: string | undefined): Promise<void> {
  try {
    if (token) {
      await SecureStore.setItemAsync('bexo_access_token', token);
      cachedToken = token;
      client.setToken(token);
    } else {
      await SecureStore.deleteItemAsync('bexo_access_token');
      cachedToken = null;
      client.setToken(undefined);
    }
  } catch (e) {
    console.error('Failed to set secure store token', e);
  }
}

/**
 * Get active token from cache (synchronous lookup).
 */
export function getAccessToken(): string | null {
  return cachedToken;
}

/**
 * Parses the user ID (subject) out of the persisted JWT.
 */
export function getUserIdFromToken(): string | null {
  const token = cachedToken;
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadJson = decodeBase64Url(parts[1]);
    const payload = JSON.parse(payloadJson);
    return payload.sub || null;
  } catch (e) {
    console.warn('Failed to parse JWT payload', e);
    return null;
  }
}
