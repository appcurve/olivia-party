import { PhraseListDto } from './phrases.types'
import { BoxProfileDto } from './player-profile.types'
import { VideoGroupDto } from './videos.types'

/**
 * Enum of all native player apps.
 * The values correspond to app component names and may be used to dynamically load components within the Player.
 */
export enum PlayerApp {
  'OpVideoApp' = 'OpVideoApp',
  'OpSpeechApp' = 'OpSpeechApp',
}

/**
 * Data for a given instance/configuration of a given OliviaPartyPlayerApp.
 * These correspond to individual interactive screens/modes that the user can cycle through.
 */
interface PlayerAppDto<A extends PlayerApp> {
  app: PlayerApp
  data: A extends 'OpVideoApp' ? VideoGroupDto[] : A extends 'OpSpeechApp' ? PhraseListDto[] : never
}

/**
 * DTO provided to the player App.
 */
export interface PlayerDto {
  name: BoxProfileDto['name']
  apps: PlayerAppDto<PlayerApp>[]
}
