import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 部署到 https://jackielin666.github.io/FIRDI-s-AI-Lab/
// 因此 base 必須是 /FIRDI-s-AI-Lab/，靜態資源才找得到。
export default defineConfig({
  plugins: [react()],
  base: '/FIRDI-s-AI-Lab/',
});
