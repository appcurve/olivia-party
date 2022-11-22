import { registerAs } from '@nestjs/config'
import type { GoogleConfig } from './types/google-config.interface'

export default registerAs('google', (): GoogleConfig => {
  return {
    apiKey: process.env.GOOGLE_API_KEY ?? '',
  }
})
