import { v4 as uuidv4 } from 'uuid'
const circleAPIUrl = 'https://api-sandbox.circle.com'

class circle {
    getParams = async ({ apiKey }) => {
        const options = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` },
        }
        try {
            const result = await fetch(`${circleAPIUrl}/v1/configuration`, options)
            let data = await result.json()
            return data
        }
        catch(e) {console.log(`Circle Service: GetParams: Somenting went wrong ${e}`)}
    }
    getBallance = async ({ apiKey }) => {
        const options = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` },
        }
        try {
            const result = await fetch(`${circleAPIUrl}/v1/stablecoins`, options)
            let data = await result.json()
            return data
        }
        catch(e) {console.log(`Circle Service: getBallance: Somenting went wrong ${e}`)}
    }
    sendPayment = async({ apiKey, to, amount}) => {
        const options = {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                destination: {
                    type: 'verified_blockchain',
                    addressId: to
               },
               amount: {
                    amount
               },
                idempotencyKey: uuidv4()
            })

        }
    }
}

export default new circle()