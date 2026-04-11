import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { useMemo } from "react";
import { Pressable } from "react-native";
import { Box } from "@/components/ui/box";
import { app } from "@/state";
import { regionHasTypeInScope } from "@/state/pokemonFilters";
import { getRegionSlugsForVersionId } from "@/state/versionRegionFilter";
import { ComboModalPicker, type ComboRow } from "./ComboModalPicker";

export function RegionSelect() {
	const regionRows = useSelector(() => app.state.query.regionRows.get());
	const versionRows = useSelector(() => app.state.query.versionRows.get());
	const processedPokemon = useSelector(() => app.processedPokemonList.get());
	const selectedGame = useSelector(() => app.state.ui.selectedGame.get());
	const selectedTypeFilter = useSelector(() => app.state.ui.selectedTypeFilter.get());
	const selected = useSelector(() => app.state.ui.selectedRegion.get());

	const rows = useMemo((): ComboRow[] => {
		const national: ComboRow = { key: "national", label: "National" };
		let rest = (regionRows ?? []).map((r) => ({
			key: r.name,
			label: r.pokemon_v2_regionnames[0]?.name ?? r.name,
		}));
		if (selectedGame !== 0) {
			const allowed = getRegionSlugsForVersionId(versionRows, selectedGame);
			rest = rest.filter((r) => allowed.has(r.key));
		}
		const typeSlug = selectedTypeFilter !== "all" ? selectedTypeFilter : null;
		const processed = processedPokemon;
		if (typeSlug && processed.length > 0) {
			rest = rest.filter((r) =>
				regionHasTypeInScope(
					processed,
					selectedGame,
					r.key,
					versionRows,
					typeSlug,
				),
			);
		}
		return [national, ...rest];
	}, [
		regionRows,
		versionRows,
		selectedGame,
		selectedTypeFilter,
		processedPokemon,
	]);

	const selectedLabel = useMemo(() => {
		if (selected === "national") return "National";
		const r = (regionRows ?? []).find((x) => x.name === selected);
		return r?.pokemon_v2_regionnames[0]?.name ?? selected;
	}, [selected, regionRows]);

	return (
		<Box className="flex-row flex-wrap items-center gap-1">
			<ComboModalPicker
				title="Region"
				selectedLabel={selectedLabel}
				rows={rows}
				onSelect={(key) => app.state.ui.selectedRegion.set(key)}
				emptyText="No regions match."
			/>
			{selected !== "national" ? (
				<Pressable
					accessibilityLabel="Reset to National dex"
					onPress={() => app.state.ui.selectedRegion.set("national")}
					className="h-8 w-8 items-center justify-center rounded-md"
				>
					<MaterialIcons name="close" size={20} color="#888" />
				</Pressable>
			) : null}
		</Box>
	);
}
