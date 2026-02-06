/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Fallback for Node.js modules that don't work in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      // Fix for MetaMask SDK
      '@react-native-async-storage/async-storage': false,
    };

    // External modules to ignore
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Ignore specific warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
    ];

    return config;
  },
}

module.exports = nextConfig
