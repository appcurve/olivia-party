const plugin = require('tailwindcss/plugin')

/* WIP (see to todo in doc comment) */

/**
 * TailwindCSS plugin for the project to ship alongside its Tailwind Preset as a dependency.
 *
 * This plugin should be included in the `plugins` array of the tailwind-preset.
 *
 * It is assumed that the project's color palette is defined and available via the 'P' naming convention
 * (e.g. 'text-P-heading') as defined in `tailwind-palette.js` and imported into the preset.
 *
 * @todo refactor tailwind-preset to move some of the components out and into this plugin
 *
 * @see tailwind-preset.js
 * @see {@link https://tailwindcss.com/docs/plugins}
 */
module.exports = {
  plugins: [
    plugin(function ({ addUtilities, addComponents, e, config }) {
      addComponents({
        // '.fx-nav-header': {
        //   '@apply ': {},
        // },
      })
    }),
  ],
}
