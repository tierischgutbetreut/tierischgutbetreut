/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
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
        permanent: true,
      },
      {
        source: '/Start/',
        destination: '/',
        permanent: true,
      },
      {
        source: '/Hundepension',
        destination: '/hundepension',
        permanent: true,
      },
      {
        source: '/Hundepension/',
        destination: '/hundepension',
        permanent: true,
      },
      {
        source: '/Unsere-Leistungen',
        destination: '/#leistungen',
        permanent: true,
      },
      {
        source: '/Unsere-Leistungen/',
        destination: '/#leistungen',
        permanent: true,
      },
      {
        source: '/Kundenstimmen',
        destination: '/kundenstimmen',
        permanent: true,
      },
      {
        source: '/Kundenstimmen/',
        destination: '/kundenstimmen',
        permanent: true,
      },
      {
        source: '/SeminareWorkshops',
        destination: '/',
        permanent: true,
      },
      {
        source: '/SeminareWorkshops/',
        destination: '/',
        permanent: true,
      },
      {
        source: '/Katzenbetreuung',
        destination: '/katzenbetreuung',
        permanent: true,
      },
      {
        source: '/Katzenbetreuung/',
        destination: '/katzenbetreuung',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
