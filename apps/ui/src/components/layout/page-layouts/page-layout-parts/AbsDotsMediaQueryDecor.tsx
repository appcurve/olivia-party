export interface AbsDotsMediaQueryDecorProps {
  /**
   * Specify optional design variant (default: 'circle'):
   *
   * - "circle": circle-shaped dots
   * - "square": square-shaped dots
   */
  variant?: 'circle' | 'square'
}

/**
 * Conditional design frill for content pages that can be used to fill dead whitespace on viewports
 * at the lg breakpoint and larger.
 *
 * **This component uses absolute positioning so it must be used within a positioned parent**.
 *
 * Renders a subtle "dots" pattern in the whitespace to the left and right of the content on large+
 * viewports and hidden for smaller viewports.
 *
 * Coordinates with ProseLayout.
 *
 * Thanks to tailwindui.com for original design and implementation (revised for needs of this project).
 *
 * @see ProseLayout
 */
export const AbsDotsMediaQueryDecor: React.FC<AbsDotsMediaQueryDecorProps> = ({ variant }) => {
  return (
    <div className="hidden lg:absolute lg:inset-y-0 lg:block lg:h-full lg:w-full lg:[overflow-anchor:none]">
      <div className="relative mx-auto h-full max-w-prose text-lg" aria-hidden="true">
        <svg
          className="absolute top-12 left-full translate-x-32 transform"
          width={404}
          height={384}
          fill="none"
          viewBox="0 0 404 384"
        >
          <defs>
            <pattern id="admqd-topright" x={0} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
              {variant === 'circle' ? (
                <circle cx={2} cy={2} r={2} className="text-P-background-contrast-bright/25" fill="currentColor" />
              ) : (
                <rect x={0} y={0} width={4} height={4} className="text-P-neutral-200" fill="currentColor" />
              )}
            </pattern>
          </defs>
          <rect width={404} height={384} fill="url(#admqd-topright)" />
        </svg>
        <svg
          className="absolute top-1/2 right-full -translate-y-1/2 -translate-x-32 transform"
          width={404}
          height={384}
          fill="none"
          viewBox="0 0 404 384"
        >
          <defs>
            <pattern id="admqd-midleft" x={0} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
              {variant === 'circle' ? (
                <circle cx={2} cy={2} r={2} className="text-P-background-contrast-bright/25" fill="currentColor" />
              ) : (
                <rect x={0} y={0} width={4} height={4} className="text-P-neutral-200" fill="currentColor" />
              )}
            </pattern>
          </defs>
          <rect width={404} height={384} fill="url(#admqd-midleft)" />
        </svg>
        <svg
          className="absolute bottom-12 left-full translate-x-32 transform"
          width={404}
          height={384}
          fill="none"
          viewBox="0 0 404 384"
        >
          <defs>
            <pattern id="admqd-bottomright" x={0} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
              {variant === 'circle' ? (
                <circle cx={2} cy={2} r={2} className="text-P-background-contrast-bright/25" fill="currentColor" />
              ) : (
                <rect x={0} y={0} width={4} height={4} className="text-P-neutral-200" fill="currentColor" />
              )}
            </pattern>
          </defs>
          <rect width={404} height={384} fill="url(#admqd-bottomright)" />
        </svg>
      </div>
    </div>
  )
}

AbsDotsMediaQueryDecor.defaultProps = {
  variant: 'circle',
}
