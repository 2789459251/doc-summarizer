/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",           // ← 必须包含！
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}