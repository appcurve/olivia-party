import { render } from '@testing-library/react'

import SharedReactAnimated from './shared-react-animated'

describe('SharedReactAnimated', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SharedReactAnimated />)
    expect(baseElement).toBeTruthy()
  })
})
