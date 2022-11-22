# shared-data-fetch (@firx/react-fetch)

Shared library to serve as home for an `apiFetch` wrapper that adds functionality to browser native `fetch()`.

The library also exports miscellaneous helper methods related to fetch operations such as working with cookies, and a set of custom error classes to help provide better granlularity for API errors within an app:
`ApiError`, `AuthError`, `FormError`, `NetworkError`.

Using native fetch is a great option where alternatives such as axios and its contemporaries are too large or otherwise overkill for the task at hand. A key benefit is fewer dependencies and smaller bundle.

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test shared-data-fetch` to execute the unit tests via [Jest](https://jestjs.io).
