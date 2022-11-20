import { Prisma, VideoPlatform } from '@prisma/client'

/**
 * Dict-style key-value object mapping of YouTube Video IDs to their titles.
 * See comment at the end of this file for an example of how to pull this from the YouTube API + format with jq.
 */
export const youTubeRawData = {
  WHaASkHpYHk: 'Baby Winky Comes Home [Dora the Explorer]',
  N33ldfKwdLs: 'Dora the Explorer | Dora&#39;s Night Light Adventure | Nick Jr. UK',
  T53yDxrnLMY: 'Dora The Explorer Swiper the Explorer',
  kvZUPYtbtZI: 'Dora The Explorer 1 hour FULL EPISODES',
  ONvNWclIes4: 'Dora the Explorer - Winter Holiday Adventures | Run Time: 22 Minutes',
  OKe7q1nUFgE: 'Dora the Explorer | Sleepy Bear | Nick Jr. UK',
  rYjmxcV1se4: 'Film Theory: Dora is CURSED! (Dora The Explorer)',
  kuKKn8fWirc: 'Dora Exploradora | Dance Rescue | Full Movie Game | ZigZag',
  '7_9Ukfi46CA': 'Fun Sing-Along Songs w/ Dora the Explorer! 🎤🎵| Sing-Along | Nick Jr.',
  'GLz1C3zmL-8': 'Dora The Explorer Theme',
  '8BKkKmxs_L8': 'Dora the Explorer - ABC Nursery Rhymes COLLECT |  Dora Alphabet Forest Adventure',
  '-uvO7VxMq-U': 'Dora the Explorer Full Episodes - Movie Cartoons Children',
  gyOl2WChZDg: 'Dora in Troll Land',
  xlkH17apLMY: '&quot;Dora the Explorer&quot; Theme Song | Nick Animation',
  'S6o-Pcn6_D8': 'Dora The Explorer Super Babies',
  Ar6iffZCSs4: 'Dora the Explorer-Backpack adventure (FULL VERSION 2014)',
  'I-i2S-Gh-9s': 'Dora the explorer 5 babies 👶🏻👶🏼👶🏽👶🏾👶🏿🍼🚼🧸',
  '5XlPCpA8_gw': 'DORA THE EXPLORER - Dora&#39;s Mermaid Movie Compilation Game - Mermaid Great Adventure HD',
  w1Cg_ernefE: 'Dora the Explorer Games to Play Cartoon ➤ Dora&#39;s Halloween Parade and Friends!',
  'DG-f_JkE258': 'Episodes 1-6 of Creepy Dora 😃',
  Z_qv2UqV0y4: 'Dora Exploradora | Tchu Tchu Station | Aventureira | ZigZag',
  D3tWdjrUmjM: 'Dora a Exploradora | English Adventure Learning | Episode 12 Faces | ZigZag',
  HPJmLco_Q6E: 'CREEPY Dora Season 1 - EVERY EPISODE OF EVIL DORA ! ! !',
  PvdqwBk2yUw: 'Dora the explorer: Fairytale Adventure | Full Game Movie | Dora and Boots Episodes| Dora games',
  eKgAmDmYlHQ: 'Dora The Explorer | Dora&#39;s Song | Akili Kids!',
  'NM3Uun-Vc6s': 'ABC Song | ABC Alphabet Songs Nursery Rhymes | Learn Alphabets ABC with Dora the Explorer By Nick JR',
  '0T8Qf--GwrA': 'Dora Exploradora | The Go to Sleep Adventure | Aventureira | ZigZag',
  '006Tti2ZMeU': '[HQ] Dora the Explorer | Perrito&#39;s Big Surprise Full Game 2014',
  TnpTcrtsN3U: 'Dora the Explorer Movie Trailer (with Ariel Winter)',
  '2fDpfTH7P9A': 'Dora The Explorer Swiper &quot;Your Too Late&quot; Compilation Season 3',
  eYWVNuFPwpA: 'Dora The Explorer Swiper&#39;s Funniest Moments Compilation (Season 5-8)',
  xPmNapfZlhs: 'dora the explorer finds the vaccine...',
  psINsAbDLKc: 'Conspiracy Theory: Dora is CURSED! (Dora The Explorer) | Reaction',
  '2Ruj0hfu9pg': 'Dora Exploradora | A Visit To The Hospital | Aventureira | ZigZag',
  kezjyL_yMe8: 'Dora and Friends | Mermaid Treasure Hunt | Nick Jr. UK',
  dfFOhGaBcMk: 'ZIDDI DORA Gayi School | Moral Story for Kids | Hindi Kahani | ToyStars',
  '5RBC2QjBTmA': 'Dora the Explorer - Theme Song (Horror Version) 😱',
  i6kXaW7iaOE: 'Dora the Explorer Goes Wild | Robot Chicken | adult swim',
  'D-S11J_xPgY': 'Dora The Explorer: Dora&#39;s Ballet Adventure (S6 E6) (2011)',
  UW0tLO26H5M: 'Dora the explorer opening telugu #dorabujji dora bujji telugu | dora telugu intro | Dora episode 1',
  UxGtzdHyOA4: 'Dora the Explorer | Sea Monkey Wiggle | Nick Jr. UK',
  'c-bGiKgw2lk': 'Dora and Friends | The Lost Necklace | Nick Jr. UK',
  sa0vebZTnI0: 'DORA THE GROWNUP 2',
  kPq6CSRrjzc: 'Speak Spanish w/ Dora the Explorer! | Dora and Friends | Nick Jr.',
  '36L2REX06uU': 'How Dora Went into Coma » TS S2 [Ep.9] » dora bujji in tamil ,ben 10 , shinchan ,dora the explorer',
  C42TinmK_jc: 'Dora Is Trapped In The Backrooms.',
  Spv_mnjOuf0: "Swiper's Greatest Swipes 🦊 Dora the Explorer | Dora and Friends | Nick Jr.",
  '6gLUy0gdoTs': 'Dora the Explorer - 1x27 - The Lost City  [Best Moment Plus ]',
  Qe5RUop6ejE: 'Dora and Friends The Explorer Cartoon 💖 Journey To The Cheese Planet Adventure as a Cartoon !',
  TgDUKGgHhd4: 'Dora a Exploradora | English Adventure Learning | Episode 13 Open &amp; Close | ZigZag',
}

export const videosData: Omit<Prisma.VideoCreateInput, 'player'>[] = Object.entries(youTubeRawData).map(
  ([videoId, name]) => {
    return {
      name,
      externalId: videoId,
      platform: VideoPlatform.YOUTUBE,
    }
  },
)

/*

// the above raw data was obtained from YouTube API v3 via curl and mapped to JS object syntax using jq command.
// to use the example: replace $API_KEY in the above with your Google/YouTube API from Google Developers console.

curl -s \
-H "Accept: application/json+v3" \
"https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=Dora%20the%20Explorer&type=video&key=$API_KEY" \
| \
jq '.items | (map({ (.id.videoId): .snippet.title }) | add)'

*/
