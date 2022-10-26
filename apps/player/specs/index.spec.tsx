import React from 'react'
import { render } from '@testing-library/react'

import IndexPage from '../src/pages'
import DynamicIndexPage from '../src/pages/[player]'

describe('IndexPage (Default)', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<IndexPage />)
    expect(baseElement).toBeTruthy()
  })
})

describe('DynamicIndexPage (Player)', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DynamicIndexPage />)
    expect(baseElement).toBeTruthy()
  })
})
