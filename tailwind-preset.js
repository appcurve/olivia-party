const plugin = require('tailwindcss/plugin')
const defaultTheme = require('tailwindcss/defaultTheme')

// const colors = require('tailwindcss/colors')
const palette = require('./tailwind-palette')

const { disableCodeBlockCss } = require('./tailwind-utils')

const colord = require('colord').colord
const alpha = (c, value) => colord(c).alpha(value).toRgbString()
const lighten = (c, value) => colord(c).lighten(value).toRgbString()
const darken = (c, value) => colord(c).darken(value).toRgbString()

module.exports = {
  // future: { ... }
  theme: {
    // fontFamily: { mono: [ ...defaultTheme.fontFamily.mono ], sans: [], serif: [] },
    screens: {
      xxs: '315px', // ~320px is about as small as a smartphone gets
      xs: '475px',
      ...defaultTheme.screens,
    },
    extend: {
      // refer to inline plugin `Utilities` below for addition of animation delay utilities
      animation: {
        'bouncy-opacity': 'bouncy-opacity 0.75s infinite alternate',
      },
      keyframes: {
        'bouncy-opacity': {
          from: {
            opacity: 0.8,
            transform: 'translate3d(0, 0.5rem, 0)',
          },
          to: {
            opacity: 0.1,
            transform: 'translate3d(0, -0.5rem, 0)',
          },
        },
      },
      // reminder: mesher.org is a generator for some cool gradients
      backgroundImage: {
        radial: 'radial-gradient(var(--tw-gradient-stops))',
        'radial-hero': 'radial-gradient(115% 90% at 0% 100%, var(--tw-gradient-stops))', // orig hero was radial-to-tr
        'radial-to-tr': 'radial-gradient(115% 90% at 0% 100%, var(--tw-gradient-stops))',
        'radial-to-tl': 'radial-gradient(115% 90% at 100% 100%, var(--tw-gradient-stops))',
        'radial-to-br': 'radial-gradient(90% 115% at 0% 0%, var(--tw-gradient-stops))',
        'radial-to-bl': 'radial-gradient(90% 115% at 100% 0%, var(--tw-gradient-stops))',
        fun: `
          radial-gradient(at 82% 13%, hsla(112,61%,74%,1) 0px, transparent 50%),
          radial-gradient(at 9% 46%, hsla(169,88%,76%,1) 0px, transparent 50%),
          radial-gradient(at 23% 28%, hsla(190,80%,69%,1) 0px, transparent 50%),
          radial-gradient(at 29% 83%, hsla(338,79%,70%,1) 0px, transparent 50%),
          radial-gradient(at 50% 45%, hsla(285,95%,61%,1) 0px, transparent 50%),
          radial-gradient(at 11% 53%, hsla(203,91%,71%,1) 0px, transparent 50%),
          radial-gradient(at 41% 44%, hsla(255,84%,78%,1) 0px, transparent 50%);
        `,
      },
      spacing: {
        1.25: '0.3125rem',
      },
      padding: {
        '1/3': '33.33333%',
        '2/3': '66.66666%',
      },
      minWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      },
      fontSize: {
        xxs: '.625rem',
      },
      opacity: {
        // add opacity values from 1-9 in steps of 1
        ...Array.from({ length: 9 }, (_, i) => 1 + i).reduce((acc, curr) => ({ ...acc, [curr]: `0.0${curr}` })),
        85: '0.85',
      },
      grayscale: {
        25: '25%',
        50: '50%',
        75: '75%',
      },
      // add zIndex values from 60-100 in steps of 10
      zIndex: Array.from({ length: 5 }, (_, i) => (6 + i) * 10).reduce(
        (acc, curr) => ({ ...acc, [curr]: String(curr) }),
        {},
      ),
      colors: {
        fx1: {
          50: '#f1f5f9',
          100: '#e9eff5',
          200: '#cedde9',
          300: '#a3c0d6',
          400: '#729fbe',
          500: '#5083a7',
          600: '#3d698c',
          700: '#325572',
          800: '#2d495f',
          900: '#293e51',
        },
        P: {
          ...palette,
        },
      },
      // typography can also be customized inline: prose-headings, prose-strong, prose-em, etc
      // documentation: https://github.com/tailwindcss/typography
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: palette.copy.prose.DEFAULT,
            'h1,h2,h3,h4,h5,h6': {
              color: palette.heading.DEFAULT,
              // scrollMarginTop: theme('spacing.36'),
            },
            p: {
              // lineHeight: '1.75',
            },
            a: {
              color: palette.link.dark.DEFAULT,
              '&:hover': {
                color: palette.link.dark.hover,
              },
            },
            strong: {
              color: palette.copy.prose.strong.DEFAULT, //palette.copy.prose.strong.DEFAULT, theme('colors.P.copy.prose.strong.DEFAULT')
              fontWeight: 500,
            },
            blockquote: {
              color: palette.copy.prose.blockquote,
              borderColor: alpha(palette.primary.DEFAULT, 0.65),
            },
            'ul > li::before': {
              backgroundColor: theme('colors.sky.600'),
            },
            'ol > li::before': {
              color: theme('colors.sky.600'),
            },
            ...disableCodeBlockCss,
          },
        },
        ...['sm', 'lg', 'xl', '2xl'].reduce((acc, curr) => {
          return {
            ...acc,
            [curr]: {
              css: { ...disableCodeBlockCss },
            },
          }
        }, {}),
      }),
    },
  },
  plugins: [
    // common tailwindcss plugins
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),

    // headlessui tailwindcss plugin - adds modifiers for headlessui including ui-open:*, ui-active:*, etc
    require('@headlessui/tailwindcss'),

    // project custom plugin
    require('./tailwind-plugin'),

    // add custom styles via inline custom plugin
    plugin(function ({ addBase, addComponents, addVariant, addUtilities }) {
      const webkitSearchInputXIconTarget =
        'input[type="search"]::-webkit-search-decoration, input[type="search"]::-webkit-search-cancel-button, input[type="search"]::-webkit-search-results-button, input[type="search"]::-webkit-search-results-decoration'

      const ieSearchInputXIconTarget =
        'input.hide-clear[type=search]::-ms-clear, input.hide-clear[type=search]::-ms-reveal'

      // these selectors match + override the selector used by the @tailwindcss/forms plugin
      const formInputTargets = `[type='text']:not(.fx-custom-input), [type='email'], [type='url'], [type='password'], [type='number'], [type='date'], [type='datetime-local'], [type='month'], [type='search'], [type='tel'], [type='time'], [type='week'], [multiple], textarea, select`
      // const formInputFocusTargets = `[type='text']:focus:not(.fx-custom-input), [type='email']:focus, [type='url']:focus, [type='password']:focus, [type='number']:focus, [type='date']:focus, [type='datetime-local']:focus, [type='month']:focus, [type='search']:focus, [type='tel']:focus, [type='time']:focus, [type='week']:focus, [multiple]:focus, textarea:focus, select:focus`
      // const buttonTargets = `button, [type='button'], [type='reset'], [type='submit']`

      addBase({
        // always show scrollbar to help avoid horizontal jank especially on Win/PC's during loading/modals/transitions
        body: {
          overflowY: 'scroll',
          scrollBehavior: 'smooth',
          backgroundColor: 'white',
        },
        main: {
          '@apply text-slate-900': {},
        },
        // remove spinner on number inputs for chrome/safari/edge/opera
        'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
          '-webkit-appearance': 'none',
          margin: '0',
        },
        // remove spinner on number inputs for firefox
        'input[type="number"]': {
          '-moz-appearance': 'textfield',
        },
        // remove 'x' cancel icon from input type=search on webkit-based browsers
        [webkitSearchInputXIconTarget]: {
          '-webkit-appearance': 'none',
        },
        // remove 'x' cancel icon from input type=search on IE
        [ieSearchInputXIconTarget]: {
          display: 'none',
          width: 0,
          height: 0,
        },
        // [formInputTargets]: {
        //   '@apply fx-form-input': {},
        // },
        strong: {
          '@apply font-medium text-slate-800': {},
        },
        // [formInputFocusTargets]: {
        // }
        // see .bg-party below (thanks to https://codepen.io/P1N2O/pen/pyBNzX)
        '@keyframes gradient': {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
          },
        },
      })
      addComponents({
        '.fx-layout-max-width': {
          '@apply max-w-6xl': {},
        },
        '.fx-layout-padding-x': {
          '@apply px-4 sm:px-6 xl:px-8': {},
        },
        '.fx-layout-padding-y': {
          '@apply pt-0 xs:pt-4 sm:pt-6 pb-10 xs:pb-12 sm:pb-16': {},
        },
        '.fx-modal-body-shadow': {
          '@apply shadow-[0_0_24px_8px_rgba(51,65,85,0.5)]': {}, // slate-700 50% opacity
        },
        // add modal body shadow to ::after pseudo element, to transition in after modal body renders for performance
        // usage: add conditional styles `after:opacity-0` when !hasEntered + `after:opacity-100` when hasEntered
        '.fx-modal-body-after-shadow': {
          '@apply relative after:pointer-events-none': {},
          "@apply after:absolute after:top-0 after:left-0 after:w-full after:h-full after:content-['']": {},
          '@apply after:rounded-md after:shadow-[0_0_24px_8px_rgba(51,65,85,0.5)]': {}, // slate-700 50% opacity
          '@apply after:transition-opacity after:duration-100': {},
        },
        '.fx-box': {
          'p-2 xs:p-4 sm:p-6 lg:p-8': {},
        },
        // focus ring preset with no color
        '.fx-focus': {
          '@apply focus:outline-none focus:ring-2': {},
        },
        '.fx-focus-highlight': {
          '@apply focus:outline-none focus:ring-2 focus:ring-P-a11y-highlight': {},
        },
        '.fx-focus-ring': {
          '@apply focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-100': {},
        },
        '.fx-focus-ring-wide': {
          '@apply focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200/75': {},
        },
        '.fx-focus-ring-highlight': {
          '@apply focus:outline-none focus-visible:ring-2 focus-visible:ring-P-a11y-highlight': {},
        },
        '.fx-focus-ring-form': {
          '@apply focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-sky-100': {},
        },
        // buttons
        '.fx-button-base, button.fx-button-base, a.fx-button-base': {
          // px-2 py-1
          '@apply inline-flex items-center justify-center px-3 py-1.5 xs:px-4 xs:py-2 rounded-md': {},
          '@apply text-base font-medium tracking-tight transition-colors': {},
          '&.fx-size-short': {
            '@apply py-1 xs:py-1.5': {},
          },
        },
        '.fx-button-standard-border': {
          '@apply border-2': {},
        },
        '.fx-button-thin-border': {
          '@apply border': {},
        },
        'button.fx-button-solid-primary, a.fx-button-solid-primary': {
          '&.fx-scheme-dark': {
            '@apply border-P-button-border-dark bg-P-button-background-dark text-P-button-text-dark': {},
            '@apply hover:border-P-button-border-dark-hover hover:bg-P-button-background-dark-hover': {},
            '@apply fx-focus-highlight': {},
          },
          '&.fx-scheme-light': {
            '@apply border-P-button-border-light bg-P-button-background-light text-P-button-text-light': {},
            '@apply hover:border-P-button-border-light-hover hover:bg-P-button-background-light-hover': {},
            '@apply fx-focus-highlight': {},
          },
        },
        'button.fx-button-solid-primary-disabled, a.fx-button-solid-primary-disabled': {
          // @todo light + dark scheme
          '@apply border-slate-200 bg-slate-200 text-slate-400 cursor-not-allowed': {},
        },
        'button.fx-button-outline-primary, a.fx-button-outline-primary': {
          '@apply bg-transparent border-sky-800 text-sky-800 hover:bg-slate-100 hover:border-sky-900 hover:text-sky-900':
            {},
        },
        'button.fx-button-outline-primary-disabled, a.fx-button-outline-primary-disabled': {
          '@apply bg-transparent border-slate-300 text-slate-400 cursor-not-allowed': {},
        },
        'button.fx-button-transparent-primary, a.fx-button-transparent-primary': {
          '@apply bg-transparent border-transparent text-sky-800 hover:text-sky-900': {},
        },
        'button.fx-button-transparent-primary-disabled, a.fx-button-transparent-primary-disabled': {
          '@apply bg-transparent border-transparent text-slate-400 cursor-not-allowed': {},
        },
        '.fx-input-border, input.fx-input-border': {
          '@apply border border-slate-300 rounded-md': {},
        },

        // intentionally does not set color
        '.fx-link': {
          '@apply fx-focus-ring-highlight ring-offset-1 focus:rounded-sm transition-colors duration-150': {},
          '&:hover': {
            '@apply underline': {},
          },
          // '&:active': { '@apply ': {} },
        },
        '.fx-form-input': {
          '@apply border rounded-md': {},
          '@apply border-P-form-input-border text-P-form-input-text placeholder:text-P-form-input-placeholder': {},
          // '@apply fx-focus-ring-form': {},
        },
        '.fx-form-label': {
          // requires that a parent wrapping div have the tailwind 'group' class applied
          '@apply block text-sm font-normal text-left': {},
          '@apply text-P-form-input-label group-focus-within:font-medium group-focus-within:text-P-form-input-label-focus':
            {},
        },
        // round the corners and add a border seperator to sets of adjacent items e.g. list items
        // usage: apply this class along with definitions for border width + color
        '.fx-rounded-set-md': {
          '@apply border-x border-y': {},
          '@apply first:rounded-t-md first:border-t first:border-b-0 last:rounded-b-md last:border-t-0 last:border-b':
            {},
        },
        // apply to parent of a set of stacked items (e.g. ul list) to add a rounded border + dividers between children
        '.fx-stack-set-parent-rounded-border-divided-children': {
          '@apply -space-y-px': {},
          '&>*': {
            // note in tailwind 3.1 arbitrary variants can also be written inline e.g. className="[&>a]:text-black"
            '@apply border -space-y-px': {}, //
            '@apply first:rounded-t-md last:rounded-b-md': {},

            // use of -space-y-px prevents double-borders between list items but a top or bottom border of an
            // active item may get hidden by an inactive one (in cases where active item borders may be a different
            // color). this can be mitigated by adding a higher z-index either via .fx-active or adding z-10
            // to the className as long as it doesn't interfere with the stacking context of any dropdowns within the
            // components.
            '&.fx-active': {
              // '@apply z-10': {},
            },
          },
        },

        // '.bg-cool': {
        //   // for fun... credit: https://codepen.io/nxworld/pen/aOdERG
        //   background:
        //     'linear-gradient(-45deg, rgba(229,93,135,.7), rgba(95,195,228,.7)), url(https://picsum.photos/g/2000/1200?image=443) center center / cover no-repeat',
        // },
        '.bg-party': {
          // https://codepen.io/P1N2O/pen/pyBNzX
          // original background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
          // softened up each of the above colors with coolors.co so that WCAG contrast guidelines can be met
          background: 'linear-gradient(-45deg, #F9D3C7, #F9D3C7, #96D6EE, #96EED9)',
          backgroundSize: '400% 400%',
          animation: 'gradient 10s ease infinite',
          height: '100%',
          '@apply motion-reduce:animate-none': {},
          // '@apply animate-[gradient_10s_ease_infinite]': {},
        },
      })
      addUtilities({
        // add .animation-delay-100 to .animation-delay-900
        ...Array.from({ length: 9 }, (_, i) => i).reduce(
          (acc, i) => ({ ...acc, [`.animation-delay-${i * 100}`]: { animationDelay: `0.${i}s` } }),
          {},
        ),
      })
      addVariant('not-first', '&:not(:first-child)')
      addVariant('not-last', '&:not(:last-child)')
      addVariant('not-first-not-last', '&:not(:first-child):not(:last-child)')
    }),
  ],
}
