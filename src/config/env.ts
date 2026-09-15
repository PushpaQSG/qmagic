import 'dotenv/config';

const requiredOrDefault = (name: string, defaultValue: string): string => {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : defaultValue;
};

export const env = {
  baseUrl: requiredOrDefault('BASE_URL', 'https://playwright.dev'),
};
