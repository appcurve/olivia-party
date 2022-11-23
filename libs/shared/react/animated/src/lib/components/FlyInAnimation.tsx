import { AnimateOnIntersect } from './AnimateOnIntersect'

export interface FlyInAnimationProps {
  runOnce?: boolean
  threshold?: IntersectionObserverInit['threshold']
  onIntersectionChange?: (isIntersecting: boolean) => void
}

export const FlyInAnimation: React.FC<React.PropsWithChildren<FlyInAnimationProps>> = ({
  runOnce = true,
  threshold = 0.5,
  children,
  onIntersectionChange,
}) => {
  return (
    <AnimateOnIntersect
      from={{ transform: `translateY(50px) scale(0.5)`, opacity: 0 }}
      to={{ transform: `translateY(0px) scale(1)`, opacity: 1 }}
      threshold={threshold}
      runOnce={runOnce}
      onIntersectionChange={onIntersectionChange}
    >
      {children}
    </AnimateOnIntersect>
  )
}
