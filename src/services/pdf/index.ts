import { CHATPDF_API, CHATPDF_KEY, CHATPDF_SRC } from "src/config"

/**
 * 
 * @returns 
 */
export const pdfQuery = async (query:string): Promise<string> => {
    try {
        const dataApi = await fetch(CHATPDF_API, {
            method: 'POST',
            headers: {
                'x-api-key': CHATPDF_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "sourceId": CHATPDF_SRC,
                "messages": [
                    {
                        "role": "user",
                        "content": query
                    }
                ]
            })
        })
        const response = await dataApi.json()
        return response.content
    } catch (e) {
        console.log(e)
        return 'ERROR'
    }
}
