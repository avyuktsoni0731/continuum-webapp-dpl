// Beta access control utilities

// Client-side validation (for UI feedback)
// Note: This is client-side only for UX. For production, add server-side validation too.
export function validateAccessCode(code: string): boolean {
  // In client-side, we check against a hash or do client-side validation
  // For better security, you should validate on the server
  if (typeof window === "undefined") {
    return false;
  }

  // Get allowed codes from environment variable (public, so use with caution)
  // Better: Validate on server via API call
  const allowedCodes = (process.env.NEXT_PUBLIC_BETA_ACCESS_CODES || "")
    .split(",")
    .filter((c) => c.trim());
  
  // Also allow single code if set
  const singleCode = process.env.NEXT_PUBLIC_BETA_ACCESS_CODE;
  if (singleCode) {
    allowedCodes.push(singleCode);
  }

  if (allowedCodes.length === 0) {
    // If no codes set, deny access (safer default)
    return false;
  }

  // Normalize and check
  const normalizedCode = code.trim().toLowerCase();
  return allowedCodes.some((allowed) => allowed.trim().toLowerCase() === normalizedCode);
}

export function isBetaEnabled(): boolean {
  // Check if beta is enabled (requires access code)
  return process.env.NEXT_PUBLIC_BETA_ENABLED === "true";
}
