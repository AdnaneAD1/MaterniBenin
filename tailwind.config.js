/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,jsx}',
        './src/components/**/*.{js,jsx}',
        './src/app/**/*.{js,jsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'primary': 'var(--primary)',
                'secondary': 'var(--secondary)',
                'light': 'var(--light)',
                'dark': 'var(--dark)',
                'primary-light': 'var(--primary-light)',
                'primary-dark': 'var(--primary-dark)',
                'secondary-light': 'var(--secondary-light)',
                'secondary-dark': 'var(--secondary-dark)',
                'gray-light': 'var(--gray-light)',
                'gray-medium': 'var(--gray-medium)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
            },
            backgroundColor: {
                'primary': 'var(--primary)',
                'secondary': 'var(--secondary)',
            },
            textColor: {
                'primary': 'var(--primary)',
                'secondary': 'var(--secondary)',
            },
            borderColor: {
                'primary': 'var(--primary)',
                'secondary': 'var(--secondary)',
            },
            fontFamily: {
                'sans': ['Roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
                'display': ['Roboto', 'ui-sans-serif', 'system-ui'],
            },
            spacing: {
                '72': '18rem',
                '84': '21rem',
                '96': '24rem',
            },
            boxShadow: {
                'card': '0 4px 6px rgba(0, 0, 0, 0.1)',
                'card-hover': '0 10px 15px rgba(0, 0, 0, 0.1)',
            },
            borderRadius: {
                'lg': '0.5rem',
                'xl': '1rem',
            },
        },
    },
    plugins: [],
}
