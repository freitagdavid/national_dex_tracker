import { graphqlRequestBaseQuery } from "@rtk-query/graphql-request-base-query";
import { createApi } from "@reduxjs/toolkit/query/react";

export const api = createApi({
    baseQuery: graphqlRequestBaseQuery({
        url: "http://localhost:8080/v1/graphql",
    }),
    endpoints: () => ({}),
});
