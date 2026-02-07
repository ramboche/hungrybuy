import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.42.79', // Allow your specific backend IP
        port: '5000',              // Allow the port your backend runs on
        pathname: '/uploads/**',   // Allow access to the uploads folder
      },
      {
        protocol: 'http',
        hostname: 'localhost',     // Good to keep for local testing
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
