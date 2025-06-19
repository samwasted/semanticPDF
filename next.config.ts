/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/sign-in',
        destination: '/api/auth/login',
        permanent: true,
      },
      {
        source: '/sign-up',
        destination: '/api/auth/register',
        permanent: true,
      },
    ]
  },

  webpack: (
    config: { resolve: { alias: { canvas: boolean; encoding: boolean } } },
    { buildId, dev, isServer, defaultLoaders, webpack }: any
  ) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    return config
  },
  
}

module.exports = nextConfig
module.exports = {
  images: {
    domains: ['images.app.goo.gl'],
  },
}