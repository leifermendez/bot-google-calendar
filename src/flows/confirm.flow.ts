import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import AIClass from "../services/ai";
import { clearHistory, handleHistory, getHistoryParse } from "../utils/handleHistory";
import { getFullCurrentDate } from "../utils/currentDate";
import { appToCalendar } from "src/services/calendar";

const generatePromptToFormatDate = (history: string) => {
    const prompt = `Current date: ${getFullCurrentDate()}, Given conversation history: 
    \n${history} \n
    Desired date (format: YYYY/MM/DD hh:mm:ss):
    `
    return prompt
}

const generateJsonParse = (info: string) => {
    const prompt = `As an expert in creating prompts, your main task is to parse the information provided in the context and generate a JSON object. It is crucial that this object strictly adheres to the structure specified below. Make sure that all fields are present and that the information provided complies with the given format.
    Context:"${info}"
    Example JSON object:
    
        {
            "name": "Leifer",
            "email": "fef@fef.com",
            "startDate": "2024/02/15 00:00:00" 
        }
    
    Note: For the "startDate" field, be sure to provide the date in the exact format shown ("YYYYY/MM/DD HH:MM:SS").
    JSON object to generate:`

    return prompt
}

/**
 * Encargado de pedir los datos necesarios para registrar el evento en el calendario
 */
const flowConfirm = addKeyword(EVENTS.ACTION).addAction(async (_, { flowDynamic }) => {
    await flowDynamic('Ok, voy a pedirte unos datos para agendar')
    await flowDynamic('¿Cual es tu nombre?')
}).addAction({ capture: true }, async (ctx, { state, flowDynamic, extensions }) => {
    await state.update({ name: ctx.body })
    const ai = extensions.ai as AIClass

    const history = getHistoryParse(state)
    const text = await ai.createChat([
        {
            role: 'system',
            content: generatePromptToFormatDate(history)
        }
    ], 'gpt-4')

    await handleHistory({ content: text, role: 'assistant' }, state)
    await flowDynamic(`¿Me confirmas fecha y hora?: ${text}. **cancelar** para iniciar de nuevo`)
    await state.update({ startDate: text })
})
    .addAction({ capture: true }, async (ctx, { state, flowDynamic, endFlow }) => {
        if (ctx.body.toLocaleLowerCase().includes('cancelar')) {
            clearHistory(state)
            return endFlow(`¿Como puedo ayudarte?`)

        }
        await flowDynamic(`Ultima pregunta ¿Cual es tu email?`)
    })
    .addAction({ capture: true }, async (ctx, { state, extensions, flowDynamic, fallBack }) => {

        if (!ctx.body.includes('@')) {
            return fallBack(`Debes ingresar un mail correcto`)
        }

        const infoCustomer = `Name: ${state.get('name')}, StarteDate: ${state.get('startDate')}, email: ${ctx.body}`
        const ai = extensions.ai as AIClass

        const text = await ai.createChat([
            {
                role: 'system',
                content: generateJsonParse(infoCustomer)
            }
        ])

        await appToCalendar(text, ctx.from)
        clearHistory(state)
        await flowDynamic('Listo! agendado Buen dia')
    })

export { flowConfirm }