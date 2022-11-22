//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withNx } = require('@nrwl/next/plugins/with-nx')
const { merge } = require('webpack-merge')

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

  // disable compression as this concern is offloaded to cloudfront deploy (refer to infra)
  // note: at time of writing nextjs reportedly uses gzip meanwhile cloudfront uses superior brotli
  compress: false,

  // specify a base path for deployments that are not at the root of a domain/subdomain (e.g. /deploy-path)
  // basePath: '/deploy-path',

  // @see https://nextjs.org/docs/basic-features/image-optimization#domains
  // @see https://nextjs.org/docs/messages/next-image-unconfigured-host
  images: {
    // image optimization must be off for static html export
    unoptimized: true,
    domains: ['images.unsplash.com'],
  },

  /**
   * Seeking to wrangle tree-shaking out of nx with its webpack config + tsconfig's.
   *
   * Note: if the app gets side effects added in future (e.g. global styles are a common case) then they
   * need to to be added to `package.json`:
   *
   * ```json
   * "sideEffects": ["apps/<app>/src/styles/index.css"]
   * ```
   *
   * Potentially useful context methods: `{ buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }`
   */
  webpack: (config, _context) => {
    return merge(config, {
      optimization: {
        sideEffects: true,
      },
    })
  },
}

module.exports = withNx(nextConfig)
