import { AnimateOnIntersect } from './AnimateOnIntersect'

export interface SlideInAnimationProps {
  animate: 'from-left' | 'from-right'
  runOnce?: boolean
  threshold?: IntersectionObserverInit['threshold']
  onIntersectionChange?: (isIntersecting: boolean) => void
}

export const SlideInAnimation: React.FC<React.PropsWithChildren<SlideInAnimationProps>> = ({
  animate,
  runOnce = true,
  threshold = 0.5,
  children,
  onIntersectionChange,
}) => {
  return (
    <AnimateOnIntersect
      from={{ transform: `translateX(${100 * (animate === 'from-right' ? 1 : -1)}vw)` }}
      to={{ transform: `translateX(0vw)` }}
      runOnce={runOnce}
      threshold={threshold}
      onIntersectionChange={onIntersectionChange}
    >
      {children}
    </AnimateOnIntersect>
  )
}
