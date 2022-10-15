/**
 * Target code blocks (e.g. by rehype) + disable tailwindcss in them.
 * Useful for code blocks inside tailwind `.prose` classes.
 */
module.exports.disableCodeBlockCss = {
  'code::before': false,
  'code::after': false,
  'blockquote p:first-of-type::before': false,
  'blockquote p:last-of-type::after': false,
  pre: false,
  code: false,
  'pre code': false,
  'code::before': false,
  'code::after': false,
}
