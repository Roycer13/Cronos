export default {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
    "postcss-preset-env": {
      features: {
        "color-oklch": true,
      },
    },
  },
};