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
        source: '/Start/',
        destination: '/',
        permanent: false,
      },
      {
        source: '/Hundepension',
        destination: '/hundepension',
        permanent: false,
      },
      {
        source: '/Hundepension/',
        destination: '/hundepension',
        permanent: false,
      },
      {
        source: '/Unsere-Leistungen',
        destination: '/#leistungen',
        permanent: false,
      },
      {
        source: '/Unsere-Leistungen/',
        destination: '/#leistungen',
        permanent: false,
      },
      {
        source: '/Kundenstimmen',
        destination: '/kundenstimmen',
        permanent: false,
      },
      {
        source: '/Kundenstimmen/',
        destination: '/kundenstimmen',
        permanent: false,
      },
      {
        source: '/SeminareWorkshops',
        destination: '/',
        permanent: false,
      },
      {
        source: '/SeminareWorkshops/',
        destination: '/',
        permanent: false,
      },
      {
        source: '/Katzenbetreuung',
        destination: '/katzenbetreuung',
        permanent: false,
      },
      {
        source: '/Katzenbetreuung/',
        destination: '/katzenbetreuung',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
