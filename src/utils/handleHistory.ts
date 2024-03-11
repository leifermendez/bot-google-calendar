import { BotStateStandAlone } from "@builderbot/bot/dist/types"

export type History = { role: 'user' | 'assistant', content: string }

const handleHistory = async (inside: History, _state: BotStateStandAlone) => {
    const history = _state.get<History[]>('history') ?? []
    history.push(inside)
    await _state.update({ history })
}

const getHistory = (_state: BotStateStandAlone, k = 15) => {
    const history = _state.get<History[]>('history') ?? []
    const limitHistory = history.slice(-k)
    return limitHistory
}

const getHistoryParse = (_state: BotStateStandAlone, k = 15): string => {
    const history = _state.get<History[]>('history') ?? []
    const limitHistory = history.slice(-k)
    return limitHistory.reduce((prev, current) => {
        const msg = current.role === 'user' ? `Customer: "${current.content}"` : `\nSeller: "${current.content}"\n`
        prev += msg
        return prev
    }, ``)
}

const clearHistory = async (_state: BotStateStandAlone) => {
    _state.clear()
}


export { handleHistory, getHistory, getHistoryParse, clearHistory }