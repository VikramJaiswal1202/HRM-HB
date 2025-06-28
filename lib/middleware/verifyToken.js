import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verifies JWT from token string and returns decoded info
 * @param {string} token - JWT from cookies
 * @param {string[]} allowedRoles - e.g., ['superadmin']
 */
export function verifyToken(token, allowedRoles = []) {
  if (!token) {
    throw new Error("Unauthorized: Token missing");
  }

  const decoded = jwt.verify(token, JWT_SECRET);

  if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
    throw new Error("Forbidden: Role not allowed");
  }

  return decoded; // e.g., { _id, role, email }
}