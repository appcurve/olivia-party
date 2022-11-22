import { isStringKeyRecord } from '../lib/is-string-key-record'

describe('isStringKeyRecord type guard', () => {
  it('should pass empty objects', () => {
    expect(isStringKeyRecord({})).toEqual(true)
  })

  it('should pass objects with string keys and various types of values', () => {
    expect(isStringKeyRecord({ hello: 'world' })).toEqual(true)
    expect(isStringKeyRecord({ hello: 'world', world: 'hello', asdf: 'fdsa' })).toEqual(true)
    expect(
      isStringKeyRecord({ hello: 'world', world: 12345, asdf: { eep: 3343, bob: { sally: 'mal' } }, hey: 'there' }),
    ).toEqual(true)
    expect(isStringKeyRecord({ func: (): string => 'return' })).toEqual(true)
    expect(isStringKeyRecord({ hello: 'world', world: 'hello', fn: (): string => 'return' })).toEqual(true)
  })

  it('should pass objects created with numerical keys as they coerced to strings by js', () => {
    expect(isStringKeyRecord({ 1: 1984 })).toEqual(true)
    expect(isStringKeyRecord({ 33: 'world', year: 1984, world: 'hello' })).toEqual(true)
  })

  it('should fail objects with symbol keys', () => {
    const sym = Symbol()
    const obj: Record<string | number | symbol, unknown> = {}
    obj['str'] = 'hello'
    obj[sym] = 'symbol value'
    expect(isStringKeyRecord(obj)).toEqual(false)
  })

  it('should fail null', () => {
    expect(isStringKeyRecord(null)).toEqual(false)
  })

  it('should fail undefined', () => {
    expect(isStringKeyRecord(undefined)).toEqual(false)
  })

  it('should fail arrays', () => {
    expect(isStringKeyRecord([])).toEqual(false)
    expect(isStringKeyRecord([{ hello: 'world' }, { world: 'hello' }])).toEqual(false)
  })
})
