export function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (s !== undefined && s.trim().length > 0) {
    return s.trim();
  }
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  if (nodeEnv === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }
  return 'dev-insecure-jwt-secret-change-me';
}
