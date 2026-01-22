import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coverartarchive.org',
        port: '',
        pathname: '/**',
      }, {
        protocol: 'http',
        hostname: 'coverartarchive.org',
        port: '',
        pathname: '/**',
      }, {
        protocol: 'https',
        hostname: '*.wikipedia.org',
        port: '',
        pathname: '/**',
      }, {
        protocol: 'https',
        hostname: '*.wikimedia.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
