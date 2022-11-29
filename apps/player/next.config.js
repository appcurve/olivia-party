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

  // run in react strict mode
  reactStrictMode: true,

  // preserve trailing slashes for s3 deployment
  trailingSlash: true,

  // disable compression as this concern is offloaded to cloudfront deploy (refer to infra)
  compress: false,

  // use basePath to specify a base path for deployments that are not at the root of a domain/subdomain (e.g. /deploy-path)
  // basePath: '/deploy-path',

  // uncomment before build if deploying to one-off player preview on shared web host (and re-comment after for infra)
  // basePath: '/olivia-joystick-nextjs',

  // @see https://nextjs.org/docs/basic-features/image-optimization#domains
  // @see https://nextjs.org/docs/messages/next-image-unconfigured-host
  images: {
    // image optimization must be off for static html export
    unoptimized: true,
    domains: ['images.unsplash.com'],
  },
}

module.exports = withNx(nextConfig)
