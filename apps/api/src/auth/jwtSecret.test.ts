describe('getJwtSecret', () => {
  const savedJwt = process.env.JWT_SECRET;
  const savedNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.JWT_SECRET = savedJwt;
    process.env.NODE_ENV = savedNodeEnv;
    jest.resetModules();
  });

  it('returns trimmed JWT_SECRET when set', async () => {
    process.env.JWT_SECRET = '  unit-test-secret  ';
    process.env.NODE_ENV = 'production';
    const { getJwtSecret } = await import('./jwtSecret.js');
    expect(getJwtSecret()).toBe('unit-test-secret');
  });

  it('returns dev default when JWT_SECRET is unset and NODE_ENV is not production', async () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'development';
    const { getJwtSecret } = await import('./jwtSecret.js');
    expect(getJwtSecret()).toBe('dev-insecure-jwt-secret-change-me');
  });

  it('throws when JWT_SECRET is unset in production', async () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'production';
    const { getJwtSecret } = await import('./jwtSecret.js');
    expect(() => {
      getJwtSecret();
    }).toThrow('JWT_SECRET is required in production');
  });
});
