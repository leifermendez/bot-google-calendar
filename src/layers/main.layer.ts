import { BotContext, BotMethods } from "@bot-whatsapp/bot/dist/types"
import { getHistoryParse } from "../utils/handleHistory"
import AIClass from "../services/ai"
import { flowSeller } from "../flows/seller.flow"
import { flowSchedule } from "../flows/schedule.flow"
import { flowConfirm } from "../flows/confirm.flow"

const PROMPT_DISCRIMINATOR = `As advanced artificial intelligence, your task is to analyze the context of a conversation and determine the most appropriate action based on its description.

Conversation history (Customer/Seller):
-------------------
{HISTORY}
-------------------
Possible actions to select:
1. SCHEDULE: Select this action if the customer shows intent to schedule an appointment.
2. TALK: Select this action if the client seems to want to ask a question or needs more information.
3. CONFIRM: This action should only be selected if there is a previous response from the "Seller" confirming their availability and the customer has expressed their intention to schedule an appointment, providing the exact date, day and time. It is essential to avoid conflicts with other appointments, especially those scheduled for the same day.

Your task is to understand the customer's intent and select the most appropriate action in response to their statement, taking special care to avoid scheduling conflicts. Remember, you cannot select "CONFIRM" unless there is a prior conversation with the salesperson where a time and date is agreed upon.

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
    ], 'gpt-4-0613')


    console.log(`[Intention]:`, intention)

    if (intention.includes('TALK')) return gotoFlow(flowSeller)
    if (intention.includes('SCHEDULE')) return gotoFlow(flowSchedule)
    if (intention.includes('CONFIRM')) return gotoFlow(flowConfirm)
}