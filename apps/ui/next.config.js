//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withNx } = require('@nrwl/next/plugins/with-nx')

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },

  // feature flags for experimental/upcoming nextjs features
  experimental: {},

  // preserve trailing slashes for s3 deployment
  trailingSlash: true,

  // specify a base path for deployments that are not at the root of a domain/subdomain (e.g. /deploy-path)
  // basePath: '/deploy-path',

  // @see https://nextjs.org/docs/basic-features/image-optimization#domains
  // @see https://nextjs.org/docs/messages/next-image-unconfigured-host
  images: {
    // image optimization must be off for static html export
    unoptimized: true,
    domains: ['images.unsplash.com'],
  },
}

module.exports = withNx(nextConfig)
