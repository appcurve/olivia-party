import type { VideoPlaylistDto } from './op-apps/videos/playlists'
import type { PhraseListDto } from './op-apps/phrases/phrases'
import type { PlayerProfileDto } from './player-profile'

/**
 * Enum of all OliviaParty PlayerApps.
 *
 * PlayerApps are self-contained interactive React components that the user can cycle through using this project's
 * Player app.
 *
 * They are required to obey the constraints + requirements of the Player environment and may use the hooks provided
 * by the Player to interface with joystick/gamepad, keyboard, etc. inputs.
 *
 * PlayerApps receive props in a standardized data format that supports the future addition of many more.
 *
 * **Project Conventions**:
 *
 * - enum values match the actual component names (and filenames) of the React components loaded by the player.
 * - component names of PlayerApps are prefixed with _"Op"_ (i.e. PascalCase of OliviaParty's acronym "OP")
 *   and suffixed with _"App"_ so they are easily and consistently distinguished throughout the project.
 */
export enum PlayerApp {
  'OpVideoApp' = 'OpVideoApp',
  'OpSpeechApp' = 'OpSpeechApp',
}

/**
 * Data consumed by OliviaParty PlayerApp's and provided to them via props by the Player.
 * @see PlayerApp enum of PlayerApp's
 */
export interface PlayerAppDto<A extends PlayerApp> {
  app: PlayerApp
  data: A extends 'OpVideoApp' ? VideoPlaylistDto[] : A extends 'OpSpeechApp' ? PhraseListDto[] : never
}

/**
 * Generic type of the props of OliviaParty PlayerApp components.
 */
export type PlayerAppProps<APP extends PlayerApp> = PlayerAppDto<APP>

/**
 * DTO consumed by the Player App.
 */
export interface PlayerDto {
  name: PlayerProfileDto['name']
  apps: PlayerAppDto<PlayerApp>[]
}
