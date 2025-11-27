const isDev = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(...args); // Warnings toujours affichés
  },
  error: (...args: unknown[]) => {
    console.error(...args); // Erreurs toujours affichées
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args);
  },
};
