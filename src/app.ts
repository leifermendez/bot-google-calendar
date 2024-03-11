import 'dotenv/config'
import { createBot, MemoryDB } from '@builderbot/bot'
import AIClass from './services/ai';
import flow from './flows';
import { providerTelegram } from './provider/telegram';

const PORT = process.env.PORT ?? 3001
const ai = new AIClass(process.env.OPEN_API_KEY, 'gpt-3.5-turbo')

const main = async () => {

    const { httpServer } = await createBot({
        database: new MemoryDB(),
        provider: providerTelegram,
        flow,
    }, { extensions: { ai } })

    httpServer(+PORT)
    console.log(`Ready for ${PORT}`)
}
main()
