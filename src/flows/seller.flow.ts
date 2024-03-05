import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import { generateTimer } from "../utils/generateTimer";
import { getHistoryParse, handleHistory } from "../utils/handleHistory";
import AIClass from "../services/ai";
import { getFullCurrentDate } from "src/utils/currentDate";
import { query } from "src/stack-ai";

const PROMPT_QA = `Given the following conversation and a follow-up question, rephrase the follow-up question to be a stand-alone question.
Conversation:
-------------
{HISTORY}
-------------
Follow-up input: {question}
Stand-alone question:`

const PROMPT_SELLER = `As a sales expert with approximately 15 years of experience in sales funnels and lead generation, your task is to maintain a pleasant conversation, answer the customer's questions about our products and, finally, guide them to book an appointment.

You must base your answers solely on the context provided:
-------
CURRENT_DAY={CURRENT_DAY}
------- 
-------
HISTORY={HISTORY}
------- 
To provide more useful answers, you can use the information provided in the database:
-------
DATABASE={DATABASE}
------
Question:{question}

The context is the only information you have. Ignore anything that is not related to the context.

Some non-literal examples might be:

- Greet the user and provide the information they need, if you have it.
- Rephrase and ask if you don't have enough details or if the context doesn't show the information.
- Guide the user to book an appointment.
- Responds in Spanish language.
Maintain a professional tone and always respond in the first person. Your answers should be suitable for sending via WhatsApp, possibly with the use of emojis to keep the conversation friendly and accessible.

Helpful response (in spanish):`

export const generateConversationPrompt = (history: string, question: string) => {
    return PROMPT_QA
        .replace('{HISTORY}', history)
        .replace('{question}', question)
}

export const generatePromptSeller = (history: string) => {
    const nowDate = getFullCurrentDate()
    return PROMPT_SELLER
        .replace('{HISTORY}', history)
        .replace('{CURRENT_DAY}', nowDate)
};

const flowSeller = addKeyword(EVENTS.ACTION)
    .addAnswer(`⏱️`)
    .addAction(async (ctx, { state, flowDynamic, extensions, globalState }) => {
        try {

            const ai = extensions.ai as AIClass
            const history = getHistoryParse(state)

            const promptQA = generateConversationPrompt(history, ctx.body)
            const promptInfo = generatePromptSeller(history)

            const responseQA = await ai.createChat([
                {
                    role: 'system',
                    content: promptQA
                }
            ])

            const dbQuery = await query({ "in-0": responseQA })
            const promptInfoMerge = promptInfo
                .replace(`{DATABASE}`, dbQuery)
                .replace(`{question}`, responseQA)

            const responseInfo = await ai.createChat([
                {
                    role: 'system',
                    content: promptInfoMerge
                }
            ])
            console.log({ dbQuery, responseQA, promptInfo: promptInfoMerge, responseInfo })
            await handleHistory({ content: responseInfo, role: 'assistant' }, state)
            const chunks = responseInfo.split(/(?<!\d)\.\s+/g);
            for (const chunk of chunks) {
                await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
            }
        } catch (err) {
            console.log(`[ERROR]:`, err)
            return
        }
    })

export { flowSeller }