import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import AIClass from "../services/ai";
import { getHistoryParse, handleHistory } from "../utils/handleHistory";
import { generateTimer } from "../utils/generateTimer";
import { getCurrentCalendar } from "../services/calendar";
import { getFullCurrentDate } from "src/utils/currentDate";

const PROMPT_SCHEDULE = `As an artificial intelligence engineer specializing in meeting scheduling, your goal is to analyze the conversation and determine the client's intention to schedule a meeting, as well as their preferred date and time.

Today's date: {CURRENT_DAY}

Meetings already scheduled:
-----------------------------------
{AGENDA}

Conversation history:
-----------------------------------
{HISTORY}

INSTRUCTIONS:
- DO NOT greet.
- If there is availability you must tell the user to confirm.
- Check in detail the conversation history and calculate the day, date and time that does not conflict with another already scheduled.
- Ideal short answers to send by WhatsApp with emojis.

Examples of suitable answers to suggest times and check availability:
----------------------------------
"Sure, I have a space available tomorrow, what time works best for you?".
"Yes, I have a space available today, what time works best for you?".
"Sure, I have several spaces available this week. Please let me know the day and time you prefer."

Helpful first-person response (in Spanish):`

const generateSchedulePrompt = (summary: string, history: string) => {
    const nowDate = getFullCurrentDate()
    const mainPrompt = PROMPT_SCHEDULE
        .replace('{AGENDA}', summary)
        .replace('{HISTORY}', history)
        .replace('{CURRENT_DAY}', nowDate)

    return mainPrompt
}

/**
 * Hable sobre todo lo referente a agendar citas, revisar historial saber si existe huecos disponibles
 */
const flowSchedule = addKeyword(EVENTS.ACTION).addAction(async (ctx, { extensions, state, flowDynamic }) => {
    await flowDynamic('dame un momento para consultar la agenda...')
    const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)
    const list = await getCurrentCalendar()
    const promptSchedule = generateSchedulePrompt(list?.length ? list : 'ninguna', history)

    console.log(`-------------------------agendar---------------------------------`)
    console.log(promptSchedule)

    const text = await ai.createChat([
        {
            role: 'system',
            content: promptSchedule
        },
        {
            role: 'user',
            content: `Cliente pregunta: ${ctx.body}`
        }
    ], 'gpt-4')

    await handleHistory({ content: text, role: 'assistant' }, state)

    const chunks = text.split(/(?<!\d)\.\s+/g);
    for (const chunk of chunks) {
        await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
    }

})

export { flowSchedule }