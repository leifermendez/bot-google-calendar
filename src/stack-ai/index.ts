import { STACK_AI_API, STACK_AI_URL } from "src/config";

export async function query(data: { "in-0": string }) {
    const response = await fetch(
        STACK_AI_URL,
        {
            headers: {
                'Authorization':
                    `Bearer ${STACK_AI_API}`,
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result['out-0']
}