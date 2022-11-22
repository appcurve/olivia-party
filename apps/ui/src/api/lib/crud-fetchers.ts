import { RequiredIdentifier } from '@firx/op-data-api'
import { apiFetchData } from './api-fetch-data'

export interface CrudFetch<DTO extends object, CDATA extends object, UDATA extends object> {
  getMany: () => Promise<DTO[]>
  getManyWithConstraints: (params: string) => Promise<DTO[]>
  getOne: (uuid: string | undefined) => Promise<DTO>
  create: (data: CDATA) => Promise<DTO>
  mutate: (data: RequiredIdentifier<UDATA>) => Promise<DTO>
  delete: (data: { uuid: string }) => Promise<void>
}

export const getCrudFetchers = <DTO extends object, CDATA extends object, UDATA extends object>(
  endpointPath: string,
): CrudFetch<DTO, CDATA, UDATA> => {
  return {
    getMany: () => fetchMany<DTO>(endpointPath),
    getManyWithConstraints: async (params: string): Promise<DTO[]> => {
      return apiFetchData<DTO[]>(`${endpointPath}${params ? `${params}?sortFilterPaginationParams` : ''}`, {
        method: 'GET',
      })
    },
    getOne: (uuid: string | undefined) => fetchOne<DTO>(endpointPath, uuid),
    create: (data: CDATA) => fetchCreate<DTO, CDATA>(endpointPath, data),
    mutate: (data: RequiredIdentifier<UDATA>) => fetchMutate<DTO, UDATA>(endpointPath, data),
    delete: (data: { uuid: string }) => fetchDelete(endpointPath, data),
  }
}

export const fetchMany = async <DTO>(endpointPath: string): Promise<DTO[]> => {
  return apiFetchData<DTO[]>(endpointPath, {
    method: 'GET',
  })
}

export const fetchManyWithConstraints = async <DTO>(endpointPath: string, params?: string): Promise<DTO[]> => {
  return apiFetchData<DTO[]>(`${endpointPath}${params ? `${params}?sortFilterPaginationParams` : ''}`, {
    method: 'GET',
  })
}

export const fetchOne = async <DTO>(endpointPath: string, uuid: string | undefined): Promise<DTO> => {
  if (!uuid) {
    return Promise.reject(new Error('Invalid identifier'))
  }

  return apiFetchData<DTO>(`${endpointPath}/${uuid}`, {
    method: 'GET',
  })
}

export const fetchCreate = async <DTO, DATA>(endpointPath: string, data: DATA): Promise<DTO> => {
  return apiFetchData<DTO>(endpointPath, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const fetchMutate = async <DTO extends object, UDATA extends object>(
  endpointPath: string,
  { uuid, ...data }: RequiredIdentifier<UDATA>,
): Promise<DTO> => {
  return apiFetchData<DTO>(`${endpointPath}/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export const fetchDelete = async (endpointPath: string, { uuid }: { uuid: string }): Promise<void> => {
  return apiFetchData<void>(`${endpointPath}/${uuid}`, {
    method: 'DELETE',
  })
}
