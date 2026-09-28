import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Next.js 16: eslint-config-next sudah menyediakan flat config bawaan
// (FlatCompat lama menyebabkan "circular structure" di ESLint 9).
const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
];

export default eslintConfig;
