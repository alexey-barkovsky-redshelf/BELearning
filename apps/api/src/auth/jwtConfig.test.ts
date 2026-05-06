describe('jwtAuthConfig', () => {
  const savedJwt = process.env.JWT_SECRET;
  const savedNodeEnv = process.env.NODE_ENV;
  const savedExpiresIn = process.env.JWT_EXPIRES_IN;

  afterEach(() => {
    process.env.JWT_SECRET = savedJwt;
    process.env.NODE_ENV = savedNodeEnv;
    process.env.JWT_EXPIRES_IN = savedExpiresIn;
    jest.resetModules();
  });

  describe('secret', () => {
    it('uses dev default when JWT_SECRET is unset and NODE_ENV is not production', async () => {
      delete process.env.JWT_SECRET;
      process.env.NODE_ENV = 'development';
      const { jwtAuthConfig } = await import('./jwtConfig.js');
      expect(jwtAuthConfig.secret).toBe('dev-insecure-jwt-secret-change-me');
    });

    it('throws on first read when JWT_SECRET is unset in production', async () => {
      delete process.env.JWT_SECRET;
      process.env.NODE_ENV = 'production';
      const { jwtAuthConfig } = await import('./jwtConfig.js');
      expect(() => {
        void jwtAuthConfig.secret;
      }).toThrow('JWT_SECRET is required in production');
    });
  });

  describe('expiresIn', () => {
    it('uses trimmed JWT_EXPIRES_IN when set', async () => {
      process.env.JWT_SECRET = 'test-secret';
      process.env.NODE_ENV = 'development';
      process.env.JWT_EXPIRES_IN = '  15m  ';
      const { jwtAuthConfig } = await import('./jwtConfig.js');
      expect(jwtAuthConfig.expiresIn).toBe('15m');
    });

    it('uses 7d when JWT_EXPIRES_IN is unset', async () => {
      process.env.JWT_SECRET = 'test-secret';
      process.env.NODE_ENV = 'development';
      delete process.env.JWT_EXPIRES_IN;
      const { jwtAuthConfig } = await import('./jwtConfig.js');
      expect(jwtAuthConfig.expiresIn).toBe('7d');
    });
  });
});
