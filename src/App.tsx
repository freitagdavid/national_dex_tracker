import { useSelector } from "@legendapp/state/react";
import { useQuery } from "@tanstack/react-query";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AllPokemonSpeciesWithSpritesQuery } from "@/gql/operation-types";
import { graphqlRequest } from "@/state/graphqlFetch";
import { app, SPECIES_QUERY } from "@/state";
import { AppBar } from "./components/MenuBar";
import { AppLoadingSkeleton } from "./components/AppLoadingSkeleton";
import { PokemonInfoModal } from "./components/PokemonInfo/PokemonInfoModal";
import { StatefuleProgress } from "./components/StatefulProgress";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { PokemonListView } from "./components/ui/PokemonListView";

function App() {
	const pokemon = useSelector(() => app.pokemonList.get() ?? []);
	const boxes = useSelector(() => app.boxes.get() ?? []);
	const layout = useSelector(() => app.state.ui.listLayout.get());

	const speciesBootstrap = useQuery({
		queryKey: ["graphql", "pokemonSpecies"],
		queryFn: () =>
			graphqlRequest<AllPokemonSpeciesWithSpritesQuery>(SPECIES_QUERY),
	});


	const shellStyle = { flex: 1 as const, minHeight: 0 as const };

	const {data, isError, isPending} = speciesBootstrap;

	const appBody = (
		<>
			<PokemonInfoModal />
			<Box
				className="h-full w-full flex-1 flex-col overflow-hidden"
				style={
					Platform.OS === "web"
						? { flex: 1, minHeight: 0, height: "100%" as const }
						: shellStyle
				}
			>
				<Box className="w-full shrink-0">
					<StatefuleProgress
						numPokemon={pokemon.length || 0}
						fillClassName="bg-green-500"
						className="h-8 w-full rounded-none bg-red-500"
					/>
					<AppBar />
				</Box>
				
					{isError && !data && (
						<Box className="min-h-full w-full items-center justify-center p-6">
						<Text className="text-center text-sm text-destructive">
							Could not load Pokémon data.
							{speciesBootstrap.error instanceof Error
								? ` ${speciesBootstrap.error.message}`
								: null}
						</Text>
					</Box>
					)}

					{
						!isError && !data && (
							<AppLoadingSkeleton layout={layout} />
						)
					}
					{!isError && data && !isPending && (
						<View style={shellStyle}>
							<PokemonListView listStyle={layout} boxes={boxes} pokemon={pokemon} />
						</View>
					)}
			</Box>
		</>
	);

	if (Platform.OS === "web") {
		return (
			<View className="flex-1 bg-background" style={{ flex: 1, height: "100%" }}>
				{appBody}
			</View>
		);
	}

	return (
		<SafeAreaView
			className="flex-1 bg-background"
			edges={["top", "left", "right"]}
			style={{ flex: 1 }}
		>
			{appBody}
		</SafeAreaView>
	);
}

export default App;
