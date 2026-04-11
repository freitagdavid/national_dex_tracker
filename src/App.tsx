import { useSelector } from "@legendapp/state/react";
import { useQuery } from "@tanstack/react-query";
import { Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AllPokemonSpeciesWithSpritesQuery } from "@/gql/operation-types";
import { graphqlRequest } from "@/state/graphqlFetch";
import { app, SPECIES_QUERY } from "@/state";
import { AppBar } from "./components/MenuBar";
import { AppLoadingSkeleton } from "./components/AppLoadingSkeleton";
import { Box as PokemonBox } from "./components/Box";
import { PokemonCard } from "./components/PokemonCard";
import { PokemonListItem } from "./components/PokemonListItem";
import { PokemonInfoModal } from "./components/PokemonInfo/PokemonInfoModal";
import { StatefuleProgress } from "./components/StatefulProgress";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";

function App() {
	const pokemon = useSelector(() => app.pokemonList.get() ?? []);
	const boxes = useSelector(() => app.boxes.get() ?? []);
	const layout = useSelector(() => app.state.ui.listLayout.get());

	const speciesBootstrap = useQuery({
		queryKey: ["graphql", "pokemonSpecies"],
		queryFn: () =>
			graphqlRequest<AllPokemonSpeciesWithSpritesQuery>(SPECIES_QUERY),
	});

	const showMainSkeleton =
		!speciesBootstrap.isError &&
		!speciesBootstrap.data &&
		speciesBootstrap.isPending;

	const shellStyle = { flex: 1 as const, minHeight: 0 as const };

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
				<ScrollView
					className="min-h-0 flex-1"
					style={shellStyle}
					contentContainerStyle={{ flexGrow: 1 }}
					keyboardShouldPersistTaps="handled"
				>
					{speciesBootstrap.isError && !speciesBootstrap.data ? (
						<Box className="min-h-full w-full items-center justify-center p-6">
							<Text className="text-center text-sm text-destructive">
								Could not load Pokémon data.
								{speciesBootstrap.error instanceof Error
									? ` ${speciesBootstrap.error.message}`
									: null}
							</Text>
						</Box>
					) : showMainSkeleton ? (
						<AppLoadingSkeleton layout={layout} />
					) : layout === "box" ? (
						<Box className="w-full flex-row flex-wrap justify-around px-2 py-2">
							{boxes.map((box, boxIndex) => (
								<PokemonBox
									box={box}
									boxNum={boxIndex}
									key={boxIndex}
								/>
							))}
						</Box>
					) : layout === "grid" ? (
						<Box className="w-full flex-row flex-wrap justify-around px-2 py-2">
							{pokemon.map((poke, index) => (
								<PokemonCard
									poke={poke}
									key={poke.id}
									boxNum={Math.floor(index / 30)}
								/>
							))}
						</Box>
					) : (
						<Box className="w-full flex-col gap-3 px-3 py-4">
							{pokemon.map((poke) => (
								<PokemonListItem poke={poke} key={poke.id} />
							))}
						</Box>
					)}
				</ScrollView>
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
