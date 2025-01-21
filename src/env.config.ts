const { APP_PORT, NODE_ENV } = process.env;

export const ENV = {
  PORT: APP_PORT,
  NODE_ENV: NODE_ENV,
};

export default () => ({
  envFilePath: !!process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
});
