import { tryGetPrecomputedGraphql } from "@/lib/precomputedGraphql";

const GRAPHQL_URL = "https://beta.pokeapi.co/graphql/v1beta2";

export async function graphqlRequest<TData>(
	query: string,
	variables?: Record<string, unknown>,
): Promise<TData> {
	const cached = tryGetPrecomputedGraphql<TData>(query, variables);
	if (cached !== undefined) {
		return cached;
	}

	const res = await fetch(GRAPHQL_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ query, variables: variables ?? {} }),
	});
	if (!res.ok) {
		throw new Error(`GraphQL HTTP ${res.status}`);
	}
	const json = (await res.json()) as {
		data?: TData;
		errors?: { message: string }[];
	};
	if (json.errors?.length) {
		throw new Error(json.errors.map((e) => e.message).join("; "));
	}
	if (json.data === undefined) {
		throw new Error("GraphQL response missing data");
	}
	return json.data;
}
