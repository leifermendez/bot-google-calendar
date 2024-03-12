import { MAKE_ADD_TO_CALENDAR, MAKE_GET_FROM_CALENDAR } from 'src/config'

/**
 * get calendar
 * @returns 
 */
const getCurrentCalendar = async (): Promise<string[]> => {
    const dataCalendarApi = await fetch(MAKE_GET_FROM_CALENDAR)
    const json: { date: string, name: string }[] = await dataCalendarApi.json()
    console.log({ json })
    const list = json.filter(({date, name}) => !!date && !!name).reduce((prev, current) => {
        prev.push(current.date)
        return prev
    }, [])
    return list
}

/**
 * add to calendar
 * @param body 
 * @returns 
 */
const appToCalendar = async (payload: { name: string, email: string, startDate: string, endData: string, phone: string }) => {
    try {
        const dataApi = await fetch(MAKE_ADD_TO_CALENDAR, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        })
        return dataApi
    } catch (err) {
        console.log(`error: `, err)
    }
}

export { getCurrentCalendar, appToCalendar }