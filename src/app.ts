import 'dotenv/config'
import { createBot, MemoryDB, createProvider } from '@bot-whatsapp/bot'
import { BaileysProvider } from '@bot-whatsapp/provider-baileys'
import AIClass from './services/ai';
import flow from './flows';

const ai = new AIClass(process.env.OPEN_API_KEY, 'gpt-3.5-turbo-16k')

const main = async () => {
    const provider = createProvider(BaileysProvider)

    await createBot({
        database: new MemoryDB(),
        provider,
        flow,
    }, { extensions: { ai } })

    console.log(`Listo para enviar`)

}

main()
