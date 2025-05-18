const isDev =
  process.env.NODE_ENV === 'development' ||
  (typeof __DEV__ !== 'undefined' && __DEV__); // __DEV__ is true in React Native development

export const log = (...args: any[]) => {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}; 