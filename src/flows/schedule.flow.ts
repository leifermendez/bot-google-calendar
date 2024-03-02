import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import AIClass from "../services/ai";
import { getHistoryParse, handleHistory } from "../utils/handleHistory";
import { generateTimer } from "../utils/generateTimer";
import { getCurrentCalendar } from "../services/calendar";
import { getFullCurrentDate } from "src/utils/currentDate";

const PROMPT_SCHEDULE = `As an artificial intelligence engineer specializing in meeting scheduling, your goal is to analyze the conversation and determine the client's intent to schedule a meeting, as well as their date and time preference. 

Today's date: {CURRENT_DAY}

MEETING GUIDELINES.
-----------------------------------
{DATABASE}

Meetings already scheduled:
-----------------------------------
{AGENDA}

Conversation History:
-----------------------------------
{HISTORY}

Examples of appropriate responses to suggest times and check availability:
----------------------------------
"Of course, I have a space available tomorrow, what time is most convenient for you?"
"Yes, I have a slot available today, what time is most convenient for you?"
"Certainly, I have several slots available this week. Please let me know the day and time you prefer."

INSTRUCTIONS:
- DO NOT greet.
- If there is availability you should tell the user to confirm.
- Review in detail the conversation history and calculate the day, date and time that does not conflict with another time already scheduled.
- Ideal short answers to send by whatsapp with emojis
-----------------------------
Useful answer in first person:`

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