import { isStringRecord } from '../lib/is-string-record'

describe('isStringRecord type guard', () => {
  it('should pass empty objects', () => {
    expect(isStringRecord({})).toEqual(true)
  })

  it('should pass objects with string keys and values', () => {
    expect(isStringRecord({ hello: 'world' })).toEqual(true)
    expect(isStringRecord({ hello: 'world', world: 'hello', asdf: 'fdsa' })).toEqual(true)
  })

  it('should fail objects with numerical keys', () => {
    expect(isStringRecord({ 1: 1984 })).toEqual(false)
    expect(isStringRecord({ 33: 'world', year: 1984, world: 'hello' })).toEqual(false)
  })

  it('should fail objects with numerical values', () => {
    expect(isStringRecord({ year: 1984 })).toEqual(false)
    expect(isStringRecord({ hello: 'world', year: 1984, world: 'hello' })).toEqual(false)
  })

  it('should fail nested objects', () => {
    expect(isStringRecord({ year: 1984 })).toEqual(false)
    expect(isStringRecord({ hello: 'world', again: { hello: 'world' } })).toEqual(false)
  })

  it('should fail objects with function values', () => {
    expect(isStringRecord({ fn: (): string => 'return' })).toEqual(false)
    expect(isStringRecord({ hello: 'world', world: 'hello', fn: (): string => 'return' })).toEqual(false)
  })

  it('should fail objects with symbol keys', () => {
    const sym = Symbol()
    const obj: Record<string | number | symbol, unknown> = {}
    obj['str'] = 'hello'
    obj[sym] = 'symbol value'
    expect(isStringRecord(obj)).toEqual(false)
  })

  it('should fail null', () => {
    expect(isStringRecord(null)).toEqual(false)
  })

  it('should fail undefined', () => {
    expect(isStringRecord(undefined)).toEqual(false)
  })

  it('should fail arrays', () => {
    expect(isStringRecord([])).toEqual(false)
    expect(isStringRecord([{ hello: 'world' }, { world: 'hello' }])).toEqual(false)
  })
})
