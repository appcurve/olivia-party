import { isStringKeyValueRecord } from '../lib/is-string-key-value-record'

describe('isStringKeyValueRecord type guard', () => {
  it('should pass empty objects', () => {
    expect(isStringKeyValueRecord({})).toEqual(true)
  })

  it('should pass objects with string keys and values', () => {
    expect(isStringKeyValueRecord({ hello: 'world' })).toEqual(true)
    expect(isStringKeyValueRecord({ hello: 'world', world: 'hello', asdf: 'fdsa' })).toEqual(true)
  })

  it('should fail objects with numerical keys', () => {
    expect(isStringKeyValueRecord({ 1: 1984 })).toEqual(false)
    expect(isStringKeyValueRecord({ 33: 'world', year: 1984, world: 'hello' })).toEqual(false)
  })

  it('should fail objects with numerical values', () => {
    expect(isStringKeyValueRecord({ year: 1984 })).toEqual(false)
    expect(isStringKeyValueRecord({ hello: 'world', year: 1984, world: 'hello' })).toEqual(false)
  })

  it('should fail nested objects', () => {
    expect(isStringKeyValueRecord({ year: 1984 })).toEqual(false)
    expect(isStringKeyValueRecord({ hello: 'world', again: { hello: 'world' } })).toEqual(false)
  })

  it('should fail objects with function values', () => {
    expect(isStringKeyValueRecord({ fn: (): string => 'return' })).toEqual(false)
    expect(isStringKeyValueRecord({ hello: 'world', world: 'hello', fn: (): string => 'return' })).toEqual(false)
  })

  it('should fail objects with symbol keys', () => {
    const sym = Symbol()
    const obj: Record<string | number | symbol, unknown> = {}
    obj['str'] = 'hello'
    obj[sym] = 'symbol value'
    expect(isStringKeyValueRecord(obj)).toEqual(false)
  })

  it('should fail null', () => {
    expect(isStringKeyValueRecord(null)).toEqual(false)
  })

  it('should fail undefined', () => {
    expect(isStringKeyValueRecord(undefined)).toEqual(false)
  })

  it('should fail arrays', () => {
    expect(isStringKeyValueRecord([])).toEqual(false)
    expect(isStringKeyValueRecord([{ hello: 'world' }, { world: 'hello' }])).toEqual(false)
  })
})
