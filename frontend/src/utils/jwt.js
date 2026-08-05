import { jwtDecode } from "jwt-decode";

/**
 * Decodes a JWT and returns its payload, or null if it's missing/invalid/expired.
 * Matches the backend's token payload shape: { sub, role, user_id, exp }.
 */
export function decodeToken(token) {
  if (!token) return null;
  try {
    const payload = jwtDecode(token);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null; // expired
    }
    return {
      employeeId: payload.sub,
      role: payload.role,
      userId: payload.user_id,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
