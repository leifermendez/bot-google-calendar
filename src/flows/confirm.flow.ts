import { addKeyword, EVENTS } from "@builderbot/bot";
import { clearHistory } from "../utils/handleHistory";
import { addMinutes, format } from "date-fns";
import { appToCalendar } from "src/services/calendar";

const DURATION_MEET = process.env.DURATION_MEET ?? 45
/**
 * Encargado de pedir los datos necesarios para registrar el evento en el calendario
 */
const flowConfirm = addKeyword(EVENTS.ACTION).addAction(async (_, { flowDynamic }) => {
    await flowDynamic('Ok, voy a pedirte unos datos para agendar')
    await flowDynamic('¿Cual es tu nombre?')
}).addAction({ capture: true }, async (ctx, { state, flowDynamic, endFlow }) => {

    if (ctx.body.toLocaleLowerCase().includes('cancelar')) {
        clearHistory(state)
        return endFlow(`¿Como puedo ayudarte?`)

    }
    await state.update({ name: ctx.body })
    await flowDynamic(`Ultima pregunta ¿Cual es tu email?`)
})
    .addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack }) => {

        if (!ctx.body.includes('@')) {
            return fallBack(`Debes ingresar un mail correcto`)
        }

        const dateObject = {
            name: state.get('name'),
            email: ctx.body,
            startDate: format(state.get('desiredDate'), 'yyyy/MM/dd HH:mm:ss'),
            endData: format(addMinutes(state.get('desiredDate'), +DURATION_MEET), 'yyyy/MM/dd HH:mm:ss'),
            phone: ctx.from
        }

        await appToCalendar(dateObject)
        
        clearHistory(state)
        await flowDynamic('Listo! agendado Buen dia')
    })

export { flowConfirm }