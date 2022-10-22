// @todo create shared lib for dto's / interfaces of api responses

import { apiFetch } from './api-fetch'
import { buildDataQueryString, VideoDto, type DataQueryParams, type RequiredIdentifier } from '@firx/op-data-api'
import { ParentContext, ParentContextType } from '../../context/ParentContextProvider'

const REST_ENDPOINT_BASE = '/opx' as const

export interface CrudFetch<
  DTO extends object,
  CDTO extends object,
  MDTO extends object,
  P extends DataQueryParams<DTO>,
  PCTX extends ParentContextType | undefined,
> {
  getMany: () => Promise<DTO[]>
  getManyWithParams: (params: string) => Promise<DTO[]>
  getOne: (uuid: string | undefined) => Promise<DTO>
  create: (data: CDTO) => Promise<DTO>
  mutate: (data: RequiredIdentifier<MDTO>) => Promise<DTO>
  delete: (data: { uuid: string }) => Promise<void>
}

// // @todo add to shared lib so API + UI have DRY definition of what the accepted params are
// export type VideosDataParams = DataQueryParams<VideoDto, 'name' | 'platform', never>

// const defaultRestEndpointUrlBuilder = <T extends keyof ParentContext>(
//   endpointBaseUrl: string,
//   parentContext?: ParentContext[T],
// ): string => {
//   if (parentContext) {
//     return `${endpointBaseUrl}/${Object.values(parentContext).join('/')}`
//   }

//   return endpointBaseUrl
// }

// // export const getRestEndpoint = (apiEndpointBaseUrl: string): string => {}

// interface HookFactory<DTO extends object, PT extends ParentContextType | undefined> {
//   parentContext?: PT extends ParentContextType ? ParentContext[PT] : PT extends undefined ? undefined : never
//   endpointDtoPathName: string
//   endpointBaseUrl: string
//   endpointUrlBuilder?: PT extends ParentContextType ? (parentContext?: ParentContext[PT]) => string : () => string
// }

// export async function fetchVideos(parentContext?: ParentContext['box']): Promise<VideoDto[]> {
//   // assertParentContext(parentContext)
//   const endpoint = `${REST_ENDPOINT_BASE}/${parentContext?.boxProfileUuid}/videos`

//   return apiFetch<VideoDto[]>(endpoint, {
//     method: 'GET',
//   })
// }

// export function createFetchList<DTO extends object, PT extends ParentContextType | undefined = undefined>({
//   endpointDtoPathName,
//   endpointBaseUrl,
//   endpointUrlBuilder,
// }: HookFactory<DTO, PT>) {
//   return async (parentContext?: PT extends ParentContextType ? ParentContext[PT] : undefined): Promise<DTO[]> => {
//     const endpoint = parentContext
//       ? endpointUrlBuilder
//         ? endpointUrlBuilder(parentContext)
//         : defaultRestEndpointUrlBuilder(endpointBaseUrl, parentContext)
//       : endpointUrlBuilder
//       ? endpointUrlBuilder()
//       : defaultRestEndpointUrlBuilder(endpointBaseUrl)

//     return apiFetch<DTO[]>(endpoint, {
//       method: 'GET',
//     })
//   }
// }
