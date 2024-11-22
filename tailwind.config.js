/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      transitionProperty: {
        'padding': 'padding',
      },
      colors: {
        background: "var(--background-color)",
        text: "var(--text-color)",
      },
    },
  },
  plugins: [],
};