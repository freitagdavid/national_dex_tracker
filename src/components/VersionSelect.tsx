import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { useMemo } from "react";
import { Pressable } from "react-native";
import { Box } from "@/components/ui/box";
import { app } from "@/state";
import { versionHasTypeInScope } from "@/state/pokemonFilters";
import {
	versionNameRowMatchesRegionSlug,
	versionRowMatchesGenerationFilter,
} from "@/state/versionRegionFilter";
import { ComboModalPicker, type ComboRow } from "./ComboModalPicker";

export function VersionSelect() {
	const versionRows = useSelector(() => app.state.query.versionRows.get());
	const processedPokemon = useSelector(() => app.processedPokemonList.get());
	const selectedRegion = useSelector(() => app.state.ui.selectedRegion.get());
	const selectedGame = useSelector(() => app.state.ui.selectedGame.get());
	const selectedTypeFilter = useSelector(() => app.state.ui.selectedTypeFilter.get());
	const selectedGenerations = useSelector(() => app.state.ui.selectedGenerations.get());

	const rows = useMemo((): ComboRow[] => {
		const out: ComboRow[] = [{ key: "0", label: "All versions" }];
		const rowsRaw = versionRows ?? [];
		const filteredRows =
			selectedRegion === "national"
				? rowsRaw
				: rowsRaw.filter((r) => versionNameRowMatchesRegionSlug(r, selectedRegion));
		const typeSlug = selectedTypeFilter !== "all" ? selectedTypeFilter : null;
		const processed = processedPokemon;
		for (const r of filteredRows) {
			const vid = r.version_id;
			if (vid == null) continue;
			if (!versionRowMatchesGenerationFilter(r, selectedGenerations)) continue;
			if (
				typeSlug &&
				processed.length > 0 &&
				!versionHasTypeInScope(
					processed,
					vid,
					selectedRegion,
					versionRows,
					typeSlug,
				)
			) {
				continue;
			}
			out.push({ key: String(vid), label: r.name });
		}
		return out;
	}, [
		versionRows,
		selectedRegion,
		selectedTypeFilter,
		selectedGenerations,
		processedPokemon,
	]);

	const selectedLabel = useMemo(() => {
		if (selectedGame === 0) return "All versions";
		const r = (versionRows ?? []).find((x) => x.version_id === selectedGame);
		return r?.name ?? `Version ${selectedGame}`;
	}, [selectedGame, versionRows]);

	return (
		<Box className="flex-row flex-wrap items-center gap-1">
			<ComboModalPicker
				title="Game version"
				selectedLabel={selectedLabel}
				rows={rows}
				onSelect={(key) => app.state.ui.selectedGame.set(Number(key))}
				emptyText="No versions match."
			/>
			{selectedGame !== 0 ? (
				<Pressable
					accessibilityLabel="Reset to all versions"
					onPress={() => app.state.ui.selectedGame.set(0)}
					className="h-8 w-8 items-center justify-center rounded-md"
				>
					<MaterialIcons name="close" size={20} color="#888" />
				</Pressable>
			) : null}
		</Box>
	);
}
