/**
 * Common props interface for presentational/display components that impelement light + dark schemes.
 */
export interface Themable {
  scheme: 'light' | 'dark'
}

// note on the spelling of themable vs. themeable:
// the former was chosen because that's how Microsoft Office spells it.
