import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third argument '' ensures we load all env vars, not just VITE_ ones.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Check both the loaded env object and the actual process.env (for system/Netlify vars)
  const apiKey = env.API_KEY || process.env.API_KEY;

  return {
    plugins: [react()],
    define: {
      // Correctly define the global constant replacement
      'process.env.API_KEY': JSON.stringify(apiKey),
    }
  };
});