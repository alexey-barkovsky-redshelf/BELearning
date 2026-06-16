function resolveSecret(): string {
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

function resolveExpiresIn(): string {
  const raw = process.env.JWT_EXPIRES_IN;
  if (raw !== undefined && raw.trim().length > 0) {
    return raw.trim();
  }
  return '7d';
}

type JwtAuthConfigInternal = Readonly<{ secret: string; expiresIn: string }>;

let cached: JwtAuthConfigInternal | null = null;

function getCached(): JwtAuthConfigInternal {
  if (cached === null) {
    cached = Object.freeze({
      secret: resolveSecret(),
      expiresIn: resolveExpiresIn(),
    });
  }
  return cached;
}

export const jwtAuthConfig = {
  get secret(): string {
    return getCached().secret;
  },
  get expiresIn(): string {
    return getCached().expiresIn;
  },
};

export type JwtAuthConfig = JwtAuthConfigInternal;
