import { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
        "../../../appmint-form/src/**/*.{js,ts,jsx,tsx}", // 🔥 Include appmint-form components
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};

export default config;
