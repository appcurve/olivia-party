'use strict'

const REGEX = {
  TRAILING_SLASH: /\/$/,
  FILE_EXTENSION: /(.+)\.[a-zA-Z0-9]{2,5}$/,
  NANOID_10: /^[A-Za-z0-9_-]{10}$/,
  NANOID_DEFAULT: /^[A-Za-z0-9_-]{21}$/,
  PLAYER_NANOID: /^\/?[A-Za-z0-9_-]{10}\/?$/,
}

/**
 * Edge Lambda that serves as rewrite proxy / reverse-proxy for rewriting requests for the OliviaParty
 * web player as exported to static html via NextJS' `static export` feature and hosted with S3 + CloudFront.
 *
 * The edge lambda rewrites all requests that match `/{PLAYER_NANOID}` where `{PLAYER_NANOID}` is a 10-character
 * nanoid to `/[player]/index.html`.
 *
 * The implementation assumes that NextJS' "Static HTML Export" feature generated the site with the configuration
 * option `trailingSlash: true` set in `next.config.js` to export `/pageName/index.html` vs. `/pageName.html`.
 *
 * CloudFront must also be configured to pass along query strings so that NextJS' router can receive the value
 * of the `[player]` dynamic URL segment via its internal mechanism with the query string.
 *
 * For general cases, the lambda implements the "classic" web server (Apache2/nginx/etc) behaviour of default
 * directory indexes by appending `/index.html` to requests that are determined to be for directories in both
 * of the following cases where: the request URI includes and does not include a trailing slash.
 *
 * Important: CloudFront distributions should **not** specify a `defaultRootObject` when configured to use
 * this edge lambda.
 *
 * Note/Aside: a general-case for dynamic routes could possibly be implemented with NextJS' build artifact
 * `routes-manifest.json` or using a library such as hanford/next-static-manifest. A quick search shows
 * that at least one project implements this approach in `edgeLambdaDeploy.ts` of goldstack/goldstack.
 *
 * @see EdgeRewriteProxy project aws-cdk construct
 * @see {@link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-examples.html}
 * @see {@link https://aws.amazon.com/blogs/compute/implementing-default-directory-indexes-in-amazon-s3-backed-amazon-cloudfront-origins-using-lambdaedge/}
 * @see {@link https://nextjs.org/docs/advanced-features/static-html-export}
 * @see {@link https://nextjs.org/docs/api-reference/next.config.js/trailing-slash}
 * @see {@link https://nextjs.org/docs/api-reference/next.config.js/exportPathMap}
 * @see {@link https://vercel.com/docs/file-system-api/v2} for insight to a general-case using `routes-maniest.json`
 */
exports.handler = (event, _context, callback) => {
  // extract request from CloudFront event
  const request = event.Records[0].cf.request
  const uri = request.uri || ''

  // example to access the array of request headers:
  // const headers = request.headers

  // example to access query parameters (note: requires import `const querystring = require('querystring')`):
  // const params = querystring.parse(request.querystring)

  const isPlayerRequest = uri.match(REGEX.PLAYER_NANOID)

  console.log('Request: ' + uri)

  // if the request uri matches the web player url pattern replace it with the nextjs dynamic page
  if (isPlayerRequest) {
    // request.uri = '/[player].html'
    request.uri = '/[player]/index.html'

    console.log(`Request uri '${uri}' matched player nid + url replaced with '${request.uri}'`)
    return callback(null, request)
  }

  // if the request uri has a trailing slash then replace it with '/index.html'
  if (uri.match(REGEX.TRAILING_SLASH)) {
    request.uri = uri.replace(REGEX.TRAILING_SLASH, '/index.html')

    console.log(`Request uri '${uri}' replaced with '${request.uri}'`)
    return callback(null, request)
  }

  // if the request uri is not for a file (no file extension) then append '/index.html'
  if (!uri.match(REGEX.FILE_EXTENSION)) {
    request.uri = `${uri}/index.html`

    console.log(`Request uri '${uri}' replaced with '${request.uri}'`)
    return callback(null, request)
  }

  return callback(null, request)
}

// end
