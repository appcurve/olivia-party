import { isStringDictionary } from '../lib/is-string-dictionary'

describe('isStringDictionary type guard', () => {
  it('should pass empty objects', () => {
    expect(isStringDictionary({})).toEqual(true)
  })

  it('should pass objects with string keys and values', () => {
    expect(isStringDictionary({ hello: 'world' })).toEqual(true)
    expect(isStringDictionary({ hello: 'world', world: 'hello', asdf: 'fdsa' })).toEqual(true)
  })

  it('should fail objects with string keys and numerical values', () => {
    expect(isStringDictionary({ year: 1984 })).toEqual(false)
  })

  it('should fail objects with string keys and object values', () => {
    expect(isStringDictionary({ hello: 'world', again: { hello: 'world' } })).toEqual(false)
    expect(
      isStringDictionary({
        hello: 'world',
        world: 'earth',
        asdf: { eep: 3343, bob: { sally: 'mal' } },
        hey: 'there',
      }),
    ).toEqual(false)
  })

  it('should fail objects with string keys and function values', () => {
    expect(isStringDictionary({ fn: (): string => 'return' })).toEqual(false)
    expect(isStringDictionary({ hello: 'world', world: 'hello', fn: (): string => 'return' })).toEqual(false)
  })

  it('should pass objects created with numerical keys as they coerced to strings by js', () => {
    expect(isStringDictionary({ 1: '22' })).toEqual(true)
    expect(isStringDictionary({ 33: 'world', 44: 'hello' })).toEqual(true)
  })

  it('should fail objects with symbol keys', () => {
    const sym = Symbol()
    const obj: Record<string | number | symbol, unknown> = {}
    obj['str'] = 'hello'
    obj[sym] = 'symbol value'
    expect(isStringDictionary(obj)).toEqual(false)
  })

  it('should fail null', () => {
    expect(isStringDictionary(null)).toEqual(false)
  })

  it('should fail undefined', () => {
    expect(isStringDictionary(undefined)).toEqual(false)
  })

  it('should fail arrays', () => {
    expect(isStringDictionary([])).toEqual(false)
    expect(isStringDictionary([{ hello: 'world' }, { world: 'hello' }])).toEqual(false)
  })
})
