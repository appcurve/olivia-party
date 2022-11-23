import { render } from '@testing-library/react'
import { AnimateOnIntersect } from './AnimateOnIntersect'

describe('AnimateOnIntersect', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AnimateOnIntersect from={{ opacity: 0 }} to={{ opacity: 1 }} />)
    expect(baseElement).toBeTruthy()
  })
})
