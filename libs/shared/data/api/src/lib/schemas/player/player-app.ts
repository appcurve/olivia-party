import { z } from 'zod'

import { VideoPlaylistDto, zVideoPlaylistDto } from '../op-apps/videos/playlists'
import { PhraseListDto, zPhraseListDto } from '../op-apps/phrases/phrases'
import type { PlayerDto } from './player'

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

export const zPlayerApps = ['OpVideoApp', 'OpSpeechApp'] as const
export const zPlayerApp = z.enum(zPlayerApps)

// export type PlayerAppEnum = z.infer<typeof zPlayerApp>

export const PlayerAppEnum = {
  OpVideoApp: 'OpVideoApp',
  OpSpeechApp: 'OpSpeechApp',
} as const
export type PlayerAppEnum = typeof PlayerAppEnum[PlayerApp]

/**
 * Data provided to individual React-based OP-Apps as props by the Player app.
 * @see PlayerApp enum of PlayerApp's
 */
export interface PlayerAppDto<APP extends PlayerApp> {
  app: APP
  data: APP extends 'OpVideoApp' ? VideoPlaylistDto[] : APP extends 'OpSpeechApp' ? PhraseListDto[] : never
}

/**
 * Generic type of the props of OliviaParty PlayerApp components.
 */
export type PlayerAppProps<APP extends PlayerApp> = PlayerAppDto<APP>

/**
 * DTO consumed by the Player App.
 * Originally `PlayerDto` when player profiles were `BoxProfile`.
 */
export interface PlayerAppsDto {
  name: PlayerDto['name']
  apps: PlayerAppDto<PlayerApp>[]
}

// app: z.nativeEnum(PlayerApp)

export const zGenericPlayerAppsDto = z.object({
  name: z.string(),
  // apps: z
  //   .discriminatedUnion('app', [
  //     z.object({
  //       app: z.literal(PlayerApp.OpSpeechApp), // z.nativeEnum(PlayerApp).enum.OpSpeechApp,
  //       data: zPhraseListDto,
  //     }),
  //     z.object({
  //       app: z.literal(PlayerApp.OpVideoApp), // z.nativeEnum(PlayerApp),
  //       data: zVideoPlaylistDto,
  //     }),
  //   ])
  //   .array(),

  apps: z.array(
    z.union([
      z.object({
        app: z.literal(PlayerApp.OpSpeechApp), // z.nativeEnum(PlayerApp), // z.nativeEnum(PlayerAppEnum).enum.OpSpeechApp, // z.nativeEnum(PlayerApp).enum.OpSpeechApp,
        data: zPhraseListDto.array(),
      }),
      z.object({
        app: z.literal(PlayerApp.OpVideoApp), // z.nativeEnum(PlayerApp),
        data: zVideoPlaylistDto.array(),
      }),
    ]),
  ),

  // .object({
  //   app: z.nativeEnum(PlayerApp),
  //   data: ,
  // })
  // .array(),
})
