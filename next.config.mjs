/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/Start',
        destination: '/',
        permanent: false,
      },
      {
        source: '/Unsere-Leistungen',
        destination: '/#leistungen',
        permanent: false,
      },
      {
        source: '/SeminareWorkshops',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
