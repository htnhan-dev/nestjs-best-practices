export interface AppConfiguration {
  app: {
    env: string;
    port: number;
  };
  database: {
    url: string;
  };
}

const parsePort = (value: string | undefined): number => {
  const fallback = 3000;
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const configuration = (): AppConfiguration => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: parsePort(process.env.PORT),
  },
  database: {
    url: process.env.DATABASE_URL ?? 'mongodb://localhost:27017/unifined',
  },
});

export default configuration;
