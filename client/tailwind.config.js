/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable manual dark mode toggling
  theme: {
    extend: {
      colors: {
        // Theme mapped to logical names
        primary: {
          DEFAULT: '#e11d48', // Rose Red (Light Mode)
          dark: '#d97706',    // Dark Yellow (Dark Mode)
        },
        background: {
          DEFAULT: '#ffffff', // White (Light Mode)
          dark: '#111827',    // Greyish Black (Dark Mode)
        },
        surface: {
          DEFAULT: '#f8f9fa', // Off-white surface
          dark: '#1f2937',    // Slightly lighter dark surface
        },
        text: {
          DEFAULT: '#1f2937', // Dark text for light mode
          dark: '#f3f4f6',    // Light text for dark mode
        }
      }
    },
  },
  plugins: [],
}
