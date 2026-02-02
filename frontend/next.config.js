/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false,
    };

    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Ignore node-specific modules that aren't needed in browser
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'fs': false,
        'net': false,
        'tls': false,
      };
    }

    return config;
  },
}

module.exports = nextConfig
