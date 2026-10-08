import { Client, HttpConnection } from "@elastic/elasticsearch"

export const elastic = new Client({
    node: 'https://search.deltex.com.br',
    auth: {
        apiKey: process.env.ELASTIC_API_KEY!
        // username: 'elastic',
        // password: 'Wrgs2703!'
    },
    Connection: HttpConnection
})