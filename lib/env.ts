export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is missing`);
  }
  return value;
}

export function getFirstEnv(names: string[]): string | undefined {
  for (const name of names) {
    if (process.env[name]) {
      return process.env[name];
    }
  }
  return undefined;
}

export function requireEnvAny(names: string[]): string {
  const value = getFirstEnv(names);
  if (!value) {
    throw new Error(`Missing environment variable: one of [${names.join(", ")}] must be set.`);
  }
  return value;
}
