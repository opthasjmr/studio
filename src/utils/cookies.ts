
// src/utils/cookies.ts

interface CookieOptions {
  expires?: Date | number | string;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
}

/**
 * Sets a cookie. This function is intended for client-side usage.
 * @param name The name of the cookie.
 * @param value The value of the cookie.
 * @param options Optional cookie attributes.
 */
export function setClientCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') {
    // This function should only be called on the client-side.
    // For server-side cookie setting (e.g., in API routes or middleware), use appropriate response objects.
    console.warn("setClientCookie: Attempted to set cookie on the server. This function is client-side only.");
    return;
  }

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    let expiresValue: Date;
    if (typeof options.expires === 'number') {
      // if number, it's days
      expiresValue = new Date();
      expiresValue.setTime(expiresValue.getTime() + options.expires * 24 * 60 * 60 * 1000);
    } else if (typeof options.expires === 'string') {
      expiresValue = new Date(options.expires);
    } else {
      expiresValue = options.expires;
    }
    cookieString += `; expires=${expiresValue.toUTCString()}`;
  }

  cookieString += `; path=${options.path || '/'}`; // Default path to root

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.secure) {
    cookieString += `; secure`;
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  } else {
    cookieString += `; samesite=Lax`; // Default to Lax
  }

  document.cookie = cookieString;
}

/**
 * Gets a cookie by name. This function is intended for client-side usage.
 * @param name The name of the cookie.
 * @returns The cookie value or null if not found.
 */
export function getClientCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    // For server components or middleware, use Next.js specific APIs (e.g., `cookies()` from `next/headers` or `request.cookies`).
    console.warn("getClientCookie: Attempted to get cookie on the server. This function is client-side only.");
    return null;
  }

  const nameEQ = `${encodeURIComponent(name)}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

/**
 * Deletes a cookie by name. This function is intended for client-side usage.
 * Sets the cookie's expiration date to the past.
 * @param name The name of the cookie to delete.
 * @param options Optional path and domain for the cookie to ensure correct deletion.
 */
export function deleteClientCookie(name: string, options: { path?: string; domain?: string } = {}): void {
   if (typeof document === 'undefined') {
    console.warn("deleteClientCookie: Attempted to delete cookie on the server. This function is client-side only.");
    return;
  }
  // Set the cookie with an expiry date in the past
  const cookieOptions: CookieOptions = {
    expires: new Date(0), // Expire immediately
    path: options.path || '/', // Must match path used when setting
  };
  if (options.domain) {
    cookieOptions.domain = options.domain; // Must match domain
  }
  // Set secure and samesite to ensure deletion under various policies, though value is empty
  cookieOptions.secure = true;
  cookieOptions.sameSite = 'Lax';

  setClientCookie(name, '', cookieOptions);
}
