import { useSelector } from "@legendapp/state/react";
import { type ReactNode, useCallback, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { app } from "@/state";
import { GenerationSelect } from "./GenerationSelect";
import { RegionSelect } from "./RegionSelect";
import { SelectionReconcile } from "./SelectionReconcile";
import { TypeSelect } from "./TypeSelect";
import { VersionSelect } from "./VersionSelect";

function BottomSheetModal({
	visible,
	title,
	onClose,
	children,
}: {
	visible: boolean;
	title: string;
	onClose: () => void;
	children: ReactNode;
}) {
	const insets = useSafeAreaInsets();
	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent
			onRequestClose={onClose}
		>
			<Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
				<Pressable
					onPress={(e) => e.stopPropagation()}
					className="rounded-t-xl bg-background"
					style={{ paddingBottom: insets.bottom + 12 }}
				>
					<Box className="border-b border-border px-4 py-3">
						<Text className="text-center text-base font-semibold text-foreground">
							{title}
						</Text>
					</Box>
					{children}
				</Pressable>
			</Pressable>
		</Modal>
	);
}

function MenuPill({
	label,
	onPress,
}: {
	label: string;
	onPress: () => void;
}) {
	return (
		<Pressable
			onPress={onPress}
			className="rounded-md border border-border bg-muted/50 px-3 py-1.5 active:bg-accent"
		>
			<Text className="text-sm text-foreground">{label}</Text>
		</Pressable>
	);
}

export const AppBar = () => {
	const layout = useSelector(() => app.state.ui.listLayout.get());
	const favoriteFilter = useSelector(() => app.state.ui.favoriteFilter.get());
	const includeCatchableAltForms = useSelector(() =>
		app.state.ui.includeCatchableNonDefaultForms.get(),
	);
	const catchableIdsReady = useSelector(
		() => app.state.query.catchableNonDefaultFormPokemonIds.get() != null,
	);

	const [layoutOpen, setLayoutOpen] = useState(false);
	const [formsOpen, setFormsOpen] = useState(false);
	const [favOpen, setFavOpen] = useState(false);

	const layoutLabel =
		layout === "box" ? "Layout: Box" : layout === "grid" ? "Layout: Grid" : "Layout: List";

	const favLabel =
		favoriteFilter === "all"
			? "Favorites: All"
			: favoriteFilter === "favorites"
				? "Favorites: ★"
				: "Favorites: Unfavorited";

	const pickLayout = useCallback((v: "box" | "grid" | "list") => {
		app.state.ui.listLayout.set(v);
		setLayoutOpen(false);
	}, []);

	const pickFav = useCallback((v: "all" | "favorites" | "unfavorites") => {
		app.state.ui.favoriteFilter.set(v);
		setFavOpen(false);
	}, []);

	return (
		<Card className="w-full rounded-none border-x-0 border-t border-b-0 border-border bg-background p-0 shadow-none">
			<Box className="flex-row flex-wrap items-center gap-2 px-2 py-2">
				<SelectionReconcile />
				<MenuPill label={layoutLabel} onPress={() => setLayoutOpen(true)} />
				<MenuPill label="Forms" onPress={() => setFormsOpen(true)} />
				<MenuPill label={favLabel} onPress={() => setFavOpen(true)} />
				<VersionSelect />
				<RegionSelect />
				<TypeSelect />
				<GenerationSelect />
			</Box>

			<BottomSheetModal
				visible={layoutOpen}
				title="Layout"
				onClose={() => setLayoutOpen(false)}
			>
				{(
					[
						["box", "Box"],
						["grid", "Grid"],
						["list", "List"],
					] as const
				).map(([v, lab]) => (
					<Pressable
						key={v}
						onPress={() => pickLayout(v)}
						className={`border-b border-border px-4 py-3 ${layout === v ? "bg-accent" : ""}`}
					>
						<Text className="text-base text-foreground">{lab}</Text>
					</Pressable>
				))}
			</BottomSheetModal>

			<BottomSheetModal
				visible={formsOpen}
				title="Forms"
				onClose={() => setFormsOpen(false)}
			>
				<View className="flex-row items-center justify-between px-4 py-4">
					<Text className="mr-3 flex-1 text-sm text-foreground">
						Catchable alternate forms
					</Text>
					<Switch
						value={includeCatchableAltForms}
						disabled={!catchableIdsReady}
						onValueChange={(v): void => {
							app.state.ui.includeCatchableNonDefaultForms.set(v);
						}}
					/>
				</View>
			</BottomSheetModal>

			<BottomSheetModal
				visible={favOpen}
				title="Favorites"
				onClose={() => setFavOpen(false)}
			>
				{(
					[
						["all", "All Pokémon"],
						["favorites", "Favorites only"],
						["unfavorites", "Not favorited"],
					] as const
				).map(([v, lab]) => (
					<Pressable
						key={v}
						onPress={() => pickFav(v)}
						className={`border-b border-border px-4 py-3 ${favoriteFilter === v ? "bg-accent" : ""}`}
					>
						<Text className="text-base text-foreground">{lab}</Text>
					</Pressable>
				))}
			</BottomSheetModal>
		</Card>
	);
};
