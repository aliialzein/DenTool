export function validateEnvironment(config: Record<string, unknown>) {
  const requiredVariables = [
    'DATABASE_URL',
    'REDIS_URL',
    'IMAGEKIT_PUBLIC_KEY',
    'IMAGEKIT_PRIVATE_KEY',
    'IMAGEKIT_URL_ENDPOINT',
    'WHATSAPP_BUSINESS_NUMBER',
    'CORS_ORIGIN',
  ];

  for (const variable of requiredVariables) {
    const value = config[variable];

    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Environment validation failed: ${variable} is required`);
    }
  }

  const port = Number(config.PORT ?? 3001);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(
      'Environment validation failed: PORT must be a valid port number',
    );
  }

  const nodeEnv = config.NODE_ENV ?? 'development';

  if (
    nodeEnv !== 'development' &&
    nodeEnv !== 'test' &&
    nodeEnv !== 'production'
  ) {
    throw new Error(
      'Environment validation failed: NODE_ENV must be development, test, or production',
    );
  }

  return {
    ...config,
    PORT: port,
    NODE_ENV: nodeEnv,
  };
}
