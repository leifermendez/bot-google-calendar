import { createProvider } from "@builderbot/bot";
import { TelegramProvider } from '@builderbot-plugins/telegram'

export const providerTelegram = createProvider(TelegramProvider, {
    token: process.env.TELEGRAM_API ?? ''
})
