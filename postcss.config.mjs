// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},   // ← CHANGED from tailwindcss
    autoprefixer: {},
  },
};

export default config;