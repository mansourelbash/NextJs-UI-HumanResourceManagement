/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle client-side fallbacks for server-side modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }
    
    // Handle face-api.js and other modules
    config.module.rules.push({
      test: /\.(node)$/,
      use: 'raw-loader',
    });

    return config;
  },
  // Disable server-side rendering for pages that use face-api.js
  experimental: {
    esmExternals: 'loose',
  },
  // compiler: {
  //   styledComponents: true,
  // },
};

export default nextConfig;
