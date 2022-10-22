import { buildDataQueryString } from '../lib/build-data-query-string'
import type { DataQueryParams } from '../types/data-query-params.interface'

interface MockDto {
  name: string
  title: string
}

describe('buildDataQueryString', () => {
  it('should build a query string with sort + filter as objects with offset and limit', () => {
    const test: DataQueryParams<MockDto> = {
      sort: {
        name: 'asc',
      },
      filter: {
        name: 'bob',
      },
      offset: 10,
      limit: 100,
    }

    const result = buildDataQueryString<MockDto>(test)
    const expected = encodeURI('sort[name]=asc&filter[name]=bob&offset=10&limit=100')

    expect(result).toEqual(expected)
  })

  it('should omit optional omitted and/or undefined DataQuery properties', () => {
    const test: DataQueryParams<MockDto> = {
      sort: undefined,
      offset: 10,
      limit: 100,
    }

    const result = buildDataQueryString<MockDto>(test)
    const expected = encodeURI('offset=10&limit=100')

    expect(result).toEqual(expected)
  })

  it('returns an empty string if given undefined params', () => {
    const result = buildDataQueryString<MockDto>(undefined)

    expect(typeof result).toEqual<string>('string')
    expect(result).toEqual<string>('')
  })

  it('returns an empty string if given an empty object as params', () => {
    const result = buildDataQueryString<MockDto>({})

    expect(typeof result).toEqual<string>('string')
    expect(result).toEqual<string>('')
  })
})
