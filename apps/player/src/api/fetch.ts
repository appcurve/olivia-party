import { PlayerAppsDto, zGenericPlayerAppsDto } from '@firx/op-data-api'

const BASE_URL = process.env.NEXT_PUBLIC_PROJECT_API_BASE_URL ?? ''
const PLAYER_API_PATH = process.env.NEXT_PUBLIC_PROJECT_API_PLAYER_DATA_PATH ?? ''

if (!BASE_URL || !PLAYER_API_PATH) {
  console.error(`player missing URL values for API`)
}

function stripLeadingTrailingSlashes(input: string): string {
  return input.replace(/^\/|\/$/g, '')
}

const playerApiPath = `${BASE_URL}/${stripLeadingTrailingSlashes(PLAYER_API_PATH)}`

export async function fetchPlayerData({ nid }: { nid: string }): Promise<PlayerAppsDto> {
  const response = await fetch(`${playerApiPath}/${nid}`)

  if (!response.ok) {
    throw new Error('Error fetching data')
  }

  const data: unknown = await response.json()
  const appsDto: PlayerAppsDto = zGenericPlayerAppsDto.parse(data)

  return appsDto
}
