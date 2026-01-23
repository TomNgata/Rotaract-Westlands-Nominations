/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cranberry: {
                    DEFAULT: '#D41B5C',
                    50: '#FCE7EE',
                    100: '#FACFD9',
                    200: '#F69FB6',
                    300: '#F26F93',
                    400: '#EE3F6F',
                    500: '#D41B5C',
                    600: '#AA164A',
                    700: '#7F1037',
                    800: '#550B25',
                    900: '#2A0512',
                    950: '#150309',
                }
            },
            fontFamily: {
                heading: ['Montserrat', 'sans-serif'],
                body: ['Montserrat', 'sans-serif'],
            }
        },
    },
    plugins: [
        require("tailwindcss-animate")
    ],
}
