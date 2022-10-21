import { DataQueryParams } from '@firx/op-data-api'

/**
 * Types of API operations: `list` (many), `detail` (single), `static` (for requests to static/fixed
 * route paths with no dynamic segments or query string e.g. /user/profile), `create`, `mutate`
 * (update in this context), and `delete`.
 */
export type CacheApiOperation = 'list' | 'detail' | 'static' | 'create' | 'mutate' | 'delete'

export type CacheKeyDictValue<S extends string> = [
  { scope: S } & { operation: CacheApiOperation } & Record<string, unknown>,
]

export type CacheableParams = string | DataQueryParams<object> | Record<string, unknown> // Request<string, any>

export interface CacheKeyDict<S extends string> {
  all: () => [{ scope: S }]
  list: {
    all: () => CacheKeyDictValue<S>
    params: (params: CacheableParams) => CacheKeyDictValue<S>
  }
  detail: {
    all: () => CacheKeyDictValue<S>
    unique: (identifier: string | number | undefined) => CacheKeyDictValue<S>
  }
  static: {
    all: () => CacheKeyDictValue<S>
    key: (key: string | Record<string, unknown>) => CacheKeyDictValue<S>
  }
  create: {
    any: () => CacheKeyDictValue<S>
  }
  mutate: {
    any: () => CacheKeyDictValue<S>
  }
  delete: {
    any: () => CacheKeyDictValue<S>
  }
}

/**
 * Factory that creates a set of query cache keys as a `CacheKeyDict` object for caching the response
 * of CRUD-like data queries (API requests) vs. a back-end API.
 *
 * The `scope` argument should generally represent a model/entity or endpoint's data type (e.g. 'users',
 * 'videos') and must be unique across the UI.
 *
 * The `CacheKeyDict` implements a design decision influenced by react-query maintainer @TkDodo to use
 * a single object for all react-query keys, with the object specified as the lone element in the array
 * required by react-query. Note react-query checks for differences based on a "serialization hash".
 *
 * @see {@link https://twitter.com/TkDodo/status/1448216950732169216}
 */
export const createQueryCacheKeys = <S extends string>(scope: S): CacheKeyDict<S> => {
  const all: [{ scope: S }] = [{ scope }]

  return {
    all: () => all,
    list: {
      all: () => [{ ...all[0], operation: 'list' }],
      params: (params: CacheableParams) => [{ ...createQueryCacheKeys(scope).list.all()[0], params }],
    },
    detail: {
      all: () => [{ ...all[0], operation: 'detail' }],
      unique: (identifier: string | number | undefined) => [
        { ...createQueryCacheKeys(scope).detail.all()[0], identifier },
      ],
    },
    static: {
      all: () => [{ ...all[0], operation: 'static' }],
      key: (key: string | Record<string, unknown>) => [{ ...createQueryCacheKeys(scope).static.all()[0], key }],
    },
    create: {
      any: () => [{ ...all[0], operation: 'create' }],
    },
    mutate: {
      any: () => [{ ...all[0], operation: 'mutate' }],
    },
    delete: {
      any: () => [{ ...all[0], operation: 'delete' }],
    },
  }
}
