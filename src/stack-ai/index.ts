export async function query(data: { "in-0": string }) {
    const response = await fetch(
        "https://www.stack-inference.com/run_deployed_flow?flow_id=65e0dccda5962775219ba742&org=501a4204-4f0a-4a5e-b5bc-d866cbf13fae",
        {
            headers: {
                'Authorization':
                    'Bearer 01957069-09ac-482b-8d9a-d3526a76a163',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result['out-0']
}