import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { useMemo } from "react";
import { Pressable } from "react-native";
import { Box } from "@/components/ui/box";
import { app } from "@/state";
import { ComboModalPicker, type ComboRow } from "./ComboModalPicker";

export function TypeSelect() {
	const typeSlugs = useSelector(() => app.availableTypeSlugs.get());
	const selected = useSelector(() => app.state.ui.selectedTypeFilter.get());

	const rows = useMemo((): ComboRow[] => {
		const out: ComboRow[] = [{ key: "all", label: "All types" }];
		for (const slug of typeSlugs) {
			out.push({
				key: slug,
				label: slug.charAt(0).toUpperCase() + slug.slice(1),
			});
		}
		return out;
	}, [typeSlugs]);

	const selectedLabel = useMemo(() => {
		if (selected === "all") return "All types";
		return selected.charAt(0).toUpperCase() + selected.slice(1);
	}, [selected]);

	return (
		<Box className="flex-row flex-wrap items-center gap-1">
			<ComboModalPicker
				title="Pokémon type"
				selectedLabel={selectedLabel}
				rows={rows}
				onSelect={(key) =>
					app.state.ui.selectedTypeFilter.set(
						key === "all" ? "all" : key.toLowerCase(),
					)
				}
				emptyText="No types match."
			/>
			{selected !== "all" ? (
				<Pressable
					accessibilityLabel="Reset to all types"
					onPress={() => app.state.ui.selectedTypeFilter.set("all")}
					className="h-8 w-8 items-center justify-center rounded-md"
				>
					<MaterialIcons name="close" size={20} color="#888" />
				</Pressable>
			) : null}
		</Box>
	);
}
