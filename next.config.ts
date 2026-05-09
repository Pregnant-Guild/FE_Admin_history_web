import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.kain.id.vn',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  async rewrites() {
    // Proxy backend API calls through Next.js to avoid browser CORS issues.
    //
    // Configure the target via:
    // - API_PROXY_TARGET (server-side, recommended) e.g. http://localhost:8080
    // - NEXT_PUBLIC_API_URL_ROOT (fallback)
    const target =
      process.env.API_PROXY_TARGET ||
      process.env.NEXT_PUBLIC_API_URL_ROOT ||
      "https://history-api.kain.id.vn";

    const prefixes = [
      "auth",
      "users",
      "media",
      "projects",
      "submissions",
      "statistics",
      "roles",
      "historian",
    ];
    return [
      ...prefixes.map((p) => ({
        source: `/${p}/:path*`,
        destination: `${target}/${p}/:path*`,
      })),
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
