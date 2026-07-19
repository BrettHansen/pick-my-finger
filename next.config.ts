import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'export',
    basePath: process.env.PAGES_BASE_PATH,
    reactCompiler: true,
    allowedDevOrigins: process.env.DEV_ORIGIN ? [process.env.DEV_ORIGIN] : undefined,
    env: {
        SHOW_DEBUG_INFO: process.env.SHOW_DEBUG_INFO,
    },
};

export default nextConfig;
