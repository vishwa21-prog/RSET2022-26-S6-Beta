/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"], // ✅ Ensures Tailwind scans JSX files
  theme: {
    extend: {},
  },
  plugins: [],
};
