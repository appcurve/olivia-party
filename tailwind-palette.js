const colors = require('tailwindcss/colors')

const colord = require('colord').colord
const alpha = (c, value) => colord(c).alpha(value).toRgbString()
const lighten = (c, value) => colord(c).lighten(value).toRgbString()
const darken = (c, value) => colord(c).darken(value).toRgbString()

const primary = {
  DEFAULT: colors.sky[900],
  hover: lighten(colors.sky[900], 0.07),
  alpha: colord(colors.sky[900]).alpha(0.5).toRgbString(),
}

const candidate = {
  50: '#f8f9f9',
  100: '#eaf1f7',
  200: '#d0deee',
  300: '#a6bdd8',
  400: '#7595bb',
  500: '#5a739e',
  600: '#495780',
  700: '#384161',
  800: '#272c43',
  900: '#171b2a',
}

/**
 * Project palette to import in Tailwind Preset (refer to theme > extend > colors in `tailwind-preset.js`).
 *
 * Intended to be used with the capital 'P' naming convention (e.g. 'text-P-heading').
 */
module.exports = {
  // top level colors

  // primary palette color (agnostic to light or dark mode)
  // a bold/dark tone such that when used as a background color white foregrounds have sufficent contrast
  primary,

  // neutral: every palette benefits from a set of coordinating 'gray' or off-gray hues
  // all standard tailwind color properties (50, 100-900) should be set
  neutral: {
    ...colors.slate,
  },

  // various shades from the tailwind sky palette is used throughout the UI
  sky: {
    ...colors.sky,
  },

  /**
   * Colors primarily for accessibility purposes.
   *
   * - highlight: high-visibility color that contrasts nicely vs. the primary palette color
   */
  a11y: {
    highlight: {
      bright: alpha(colors.amber[300], 0.9),
      DEFAULT: alpha(colors.amber[200], 0.9),
      light: colors.amber[100],
    },
  },

  /**
   * Keyboard focus colors that coordinate with palette.
   * If contrast is an issue with a given UI element, consider a11y-highlight for high visibility.
   */
  focus: {
    // light palette color for icon button color or background on focus to provide a subtle emphasis
    light: {
      DEFAULT: colors.sky[50],
    },
    ring: {
      DEFAULT: colors.sky[100],
      darker: alpha(colors.sky[200], 0.25),
    },
  },

  /**
   * Table rows + items in UI lists.
   */
  item: {
    selected: {
      DEFAULT: colors.sky[50],
      hover: darken(colors.sky[50], 0.02),
    },
  },

  heading: {
    DEFAULT: alpha(colors.sky[900], 0.98),
  },
  subheading: {
    DEFAULT: lighten(colors.sky[900], 0.1),
  },
  icon: {
    DEFAULT: alpha(colors.sky[700], 0.98),
  },
  copy: {
    DEFAULT: colors.slate[800],
    prose: {
      DEFAULT: colors.slate[600],
      strong: {
        DEFAULT: lighten(colors.slate[600], 0.05),
      },
      blockquote: {
        DEFAULT: colors.slate[700],
      },
    },
  },
  link: {
    light: {
      DEFAULT: colors.slate[200], // vs. background-contrast
      hover: lighten(colors.slate[200], 0.07),
      decoration: lighten(colors.slate[200], 0.07),
    },
    dark: {
      DEFAULT: colors.sky[900],
      hover: lighten(colors.sky[900], 0.07),
      decoration: lighten(colors.sky[800], 0.07),
      secondary: {
        DEFAULT: colors.sky[700],
        hover: lighten(colors.sky[700], 0.07),
      },
    },
    DEFAULT: colors.sky[900],
  },

  background: {
    contrast: {
      bright: {
        lighter: colors.sky[600],
        hover: lighten(colors.sky[800], 0.05),
        DEFAULT: colors.sky[800], // alpha(colors.sky[900], 0.5),
      },
      hover: lighten(colors.sky[900], 0.05),
      DEFAULT: colors.sky[900],
    },
  },
  button: {
    background: {
      light: {
        DEFAULT: darken(colors.slate[100], 0.05),
        hover: darken(colors.slate[100], 0.1),
      },
      dark: {
        DEFAULT: colors.sky[900],
        hover: lighten(colors.sky[900], 0.07),
      },
    },
    border: {
      light: {
        DEFAULT: darken(colors.slate[100], 0.05),
        hover: darken(colors.slate[100], 0.1),
      },
      dark: {
        DEFAULT: colors.sky[900],
        hover: lighten(colors.sky[900], 0.07),
      },
    },
    text: {
      light: {
        DEFAULT: colors.sky[800],
      },
      dark: {
        DEFAULT: colors.slate[50],
      },
    },
  },

  // going lighter on the toggles so they are not as emphasized as primary actions on the screen
  toggle: {
    DEFAULT: lighten(primary.DEFAULT, 0.1),
    hover: lighten(primary.hover, 0.1),
  },

  // note: slate[500] meets WCAG 2.0 on white bg
  form: {
    input: {
      border: {
        DEFAULT: colors.slate[300],
      },
      text: {
        DEFAULT: colors.slate[800],
      },
      label: {
        DEFAULT: colors.slate[700],
        focus: colors.sky[900],
      },
      placeholder: {
        // @deprecate in future for P-form-placeholder
        DEFAULT: colors.slate[500],
      },
    },
    option: {
      selected: alpha(colors.sky[800], 0.98),
    },
    placeholder: {
      DEFAULT: colors.slate[500],
    },
    helper: {
      text: {
        DEFAULT: colors.slate[500],
        focus: darken(colors.slate[500], 0.1),
      },
    },
  },

  action: {
    primary: {
      toggle: {
        DEFAULT: lighten(colors.sky[900], 0.1),
        hover: lighten(colors.sky[900], 0.15),
      },
      DEFAULT: colors.sky[900],
      hover: lighten(colors.sky[900], 0.07),
    },
  },

  error: {
    DEFAULT: '#a72e2e',
    50: '#fdf3f3',
    100: '#fbe5e5',
    200: '#f8d0d0',
    300: '#f2afaf',
    400: '#e98080',
    500: '#db5858',
    600: '#cb4848',
    700: '#a72e2e',
    800: '#8b2929',
    900: '#742828',
  },
}
