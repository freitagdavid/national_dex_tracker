import { createClient, cacheExchange, fetchExchange, } from 'urql';

export const urqlClient = createClient({
    url: 'https://beta.pokeapi.co/graphql/v1beta',
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: () => {
        return { headers: {} }
    }
})
