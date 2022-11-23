import styles from './shared-react-animated.module.css'

/* eslint-disable-next-line */
export interface SharedReactAnimatedProps {}

export function SharedReactAnimated(props: SharedReactAnimatedProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to SharedReactAnimated!</h1>
    </div>
  )
}

export default SharedReactAnimated
