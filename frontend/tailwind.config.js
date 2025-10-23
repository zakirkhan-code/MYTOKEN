module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8',
        dark: '#1a1a2e',
        light: '#f8f9fa',
        'admin-dark': '#0f1729',
        'admin-sidebar': '#1e293b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'admin': '0 1px 3px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}