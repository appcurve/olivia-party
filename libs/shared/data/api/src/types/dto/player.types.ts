export {}

// import { PhraseListDto } from './phrases.types'
// import { BoxProfileDto } from './player-profile.types'
// import { VideoGroupDto } from './videos.types'

// /**
//  * Enum of all OliviaPary PlayerApps.
//  *
//  * PlayerApps are relatively self-contained interactive React components that the Player enables the
//  * user to cycle through.
//  *
//  * **Project Conventions**:
//  *
//  * - enum values match the actual component names (and filenames) of the
//  *   React components loaded by the player.
//  * - Player App component names are prefixed with _"Op"_ (i.e. PascalCase of OliviaParty's acronym "OP")
//  *   and suffixed with _"App"_ so they are easily and consistently distinguished throughout the project.
//  */
// export enum PlayerApp {
//   'OpVideoApp' = 'OpVideoApp',
//   'OpSpeechApp' = 'OpSpeechApp',
// }

// /**
//  * Data consumed by OliviaParty PlayerApp's and provided to them via props by the Player.
//  *
//  * @see PlayerApp enum of PlayerApp's
//  */
// export interface PlayerAppDto<A extends PlayerApp> {
//   app: PlayerApp
//   data: A extends 'OpVideoApp' ? VideoGroupDto[] : A extends 'OpSpeechApp' ? PhraseListDto[] : never
// }

// /**
//  * Generic type of the props of OliviaParty PlayerApp components.
//  */
// export type PlayerAppProps<APP extends PlayerApp> = PlayerAppDto<APP>

// /**
//  * DTO consumed by the Player App.
//  */
// export interface PlayerDto {
//   name: BoxProfileDto['name']
//   apps: PlayerAppDto<PlayerApp>[]
// }
