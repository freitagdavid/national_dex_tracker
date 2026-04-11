import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { useMemo } from "react";
import { Pressable } from "react-native";
import { ComboModalPicker, type ComboRow } from "@/components/ComboModalPicker";
import { Box } from "@/components/ui/box";
import { app, setInfoModalVersion } from "@/state";
import {
	getVersionGroupGenerationId,
	type VersionNameRow,
} from "@/state/versionRegionFilter";

function sortVersionRows(rows: VersionNameRow[]): VersionNameRow[] {
	return [...rows].sort((a, b) => {
		const ga = getVersionGroupGenerationId(a) ?? 999;
		const gb = getVersionGroupGenerationId(b) ?? 999;
		if (ga !== gb) return ga - gb;
		const va = a.version_id ?? 0;
		const vb = b.version_id ?? 0;
		return va - vb;
	});
}

export function InfoModalVersionSelect() {
	const versionRows = useSelector(() => app.state.query.versionRows.get());
	const selectedVersionId = useSelector(
		() => app.state.infoModal.selectedVersionId.get(),
	);

	const rows = useMemo((): ComboRow[] => {
		const base: ComboRow[] = [
			{ key: "0", label: "National · latest Pokédex" },
		];
		const raw = versionRows ?? [];
		for (const r of sortVersionRows(raw)) {
			const vid = r.version_id;
			if (vid == null) continue;
			base.push({ key: String(vid), label: r.name });
		}
		return base;
	}, [versionRows]);

	const selectedLabel = useMemo(() => {
		if (selectedVersionId === 0) return "National · latest Pokédex";
		const r = (versionRows ?? []).find((x) => x.version_id === selectedVersionId);
		return r?.name ?? `Version ${selectedVersionId}`;
	}, [selectedVersionId, versionRows]);

	return (
		<Box className="w-full flex-row flex-wrap items-center gap-1">
			<Box className="min-w-0 flex-1">
				<ComboModalPicker
					title="Game for this modal"
					selectedLabel={selectedLabel}
					rows={rows}
					onSelect={(key) => setInfoModalVersion(Number(key))}
					emptyText="No versions match."
				/>
			</Box>
			{selectedVersionId !== 0 ? (
				<Pressable
					accessibilityLabel="Use national latest Pokédex"
					onPress={() => setInfoModalVersion(0)}
					className="h-8 w-8 items-center justify-center rounded-md"
				>
					<MaterialIcons name="close" size={20} color="#888" />
				</Pressable>
			) : null}
		</Box>
	);
}
