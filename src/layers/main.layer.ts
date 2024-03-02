import { BotContext, BotMethods } from "@bot-whatsapp/bot/dist/types"
import { getHistoryParse } from "../utils/handleHistory"
import AIClass from "../services/ai"
import { flowSeller } from "../flows/seller.flow"
import { flowSchedule } from "../flows/schedule.flow"
import { flowConfirm } from "../flows/confirm.flow"

const PROMPT_DISCRIMINATOR = `As an advanced artificial intelligence, your mission is to interpret the context of a conversation and decide which of the following actions is the most appropriate to take:

Conversation History={HISTORY}

Possible actions to perform:
1. SCHEDULE: This action should be performed when the customer expresses a desire to schedule an appointment.
2. TALK: This action should be performed when the customer wishes to ask a question or needs more information.
3. CONFIRM: This action should only be performed when you have secured the intent to confirm from both the customer and the salesperson, providing an exact date, day and time with no scheduling conflicts.

Your goal is to understand the customer's intent and select the most appropriate action in response to their statement.

Ideal response (SCHEDULE|TALK|CONFIRM):`


export default async (_: BotContext, { state, gotoFlow, extensions }: BotMethods) => {
    const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)
    const prompt = PROMPT_DISCRIMINATOR

    console.log(prompt.replace('{HISTORY}', history))

    const intention = await ai.createChat([
        {
            role: 'system',
            content: prompt.replace('{HISTORY}', history)
        }
    ])


    console.log(`[Intention]:`, intention)

    if (intention.includes('TALK')) return gotoFlow(flowSeller)
    if (intention.includes('SCHEDULE')) return gotoFlow(flowSchedule)
    if (intention.includes('CONFIRM')) return gotoFlow(flowConfirm)
}