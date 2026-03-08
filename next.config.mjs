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
  trailingSlash: false,
  async redirects() {
    return [
      {
        source: '/Start/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/Hundepension/:path*',
        destination: '/hundepension',
        permanent: true,
      },
      {
        source: '/Unsere-Leistungen/:path*',
        destination: '/#leistungen',
        permanent: true,
      },
      {
        source: '/Kundenstimmen/:path*',
        destination: '/kundenstimmen',
        permanent: true,
      },
      {
        source: '/SeminareWorkshops/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/Katzenbetreuung/:path*',
        destination: '/katzenbetreuung',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
