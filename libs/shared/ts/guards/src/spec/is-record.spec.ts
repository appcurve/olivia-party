import { isRecord } from '../lib/is-record'

describe('isRecord type guard', () => {
  it('should pass empty objects', () => {
    expect(isRecord({})).toEqual(true)
  })

  it('should pass objects with string keys', () => {
    expect(isRecord({ hello: 'world', world: 'hello' })).toEqual(true)
    expect(isRecord({ hello: 'world', world: 'hello', year: 1984 })).toEqual(true)
    expect(isRecord({ hello: 'world', world: 'hello', year: 1984, fn: (): string => 'return' })).toEqual(true)
    expect(
      isRecord({
        hello: 'world',
        world: 'hello',
        nest: { hello: 'world', another: {} },
        year: 1984,
        fn: (): string => 'return',
      }),
    ).toEqual(true)
  })

  it('should pass objects with numerical keys', () => {
    expect(isRecord({ hello: 'world', world: 'hello' })).toEqual(true)
    expect(isRecord({ hello: 'world', world: 'hello', year: 1984 })).toEqual(true)
    expect(isRecord({ hello: 'world', world: 'hello', year: 1984, fn: (): string => 'return' })).toEqual(true)
  })

  it('should pass symbol keys', () => {
    const sym = Symbol()
    const obj: Record<string | number | symbol, unknown> = {}
    obj['str'] = 'hello'
    obj[sym] = 'symbol value'
    expect(isRecord(obj)).toEqual(true)
  })

  it('should fail null', () => {
    expect(isRecord(null)).toEqual(false)
  })

  it('should fail undefined', () => {
    expect(isRecord(undefined)).toEqual(false)
  })

  it('should fail arrays', () => {
    expect(isRecord([])).toEqual(false)
    expect(isRecord([{ hello: 'world' }, { world: 'hello' }])).toEqual(false)
  })
})
