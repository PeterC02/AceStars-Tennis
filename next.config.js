/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'acestars.co.uk',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
