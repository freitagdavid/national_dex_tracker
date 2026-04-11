import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "@legendapp/state/react";
import { useCallback, useMemo, useState } from "react";
import {
	FlatList,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Box } from "@/components/ui/box";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { app } from "@/state";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"] as const;

type GenOption = { key: string; label: string; isClear?: boolean };

const GEN_OPTIONS: GenOption[] = ROMAN.slice(1).map((r, i) => ({
	key: String(i + 1),
	label: `Generation ${r}`,
}));

const ALL_ROW: GenOption = {
	key: "__all__",
	label: "All generations",
	isClear: true,
};

const STATIC_OPTIONS: GenOption[] = [ALL_ROW, ...GEN_OPTIONS];

function normalizeGenIds(ids: number[]): number[] {
	return [...new Set(ids)].filter((n) => n >= 1 && n <= 9).sort((a, b) => a - b);
}

function formatGenSummary(ids: number[]): string {
	if (ids.length === 0) return "All generations";
	const sorted = [...ids].sort((a, b) => a - b);
	if (sorted.length === 1) {
		const r = ROMAN[sorted[0]];
		return r ? `Generation ${r}` : `Generation ${sorted[0]}`;
	}
	if (sorted.length <= 4) {
		return sorted
			.map((id) => (ROMAN[id] ? `Gen ${ROMAN[id]}` : String(id)))
			.join(", ");
	}
	return `${sorted.length} generations`;
}

export function GenerationSelect() {
	const insets = useSafeAreaInsets();
	const selected = useSelector(() => app.state.ui.selectedGenerations.get());
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");

	const selectedLabel = useMemo(() => formatGenSummary(selected), [selected]);

	const needle = query.trim().toLowerCase();
	const filtered = useMemo(() => {
		if (!needle) return STATIC_OPTIONS;
		return STATIC_OPTIONS.filter(
			(o) => o.label.toLowerCase().includes(needle) || o.key.includes(needle),
		);
	}, [needle]);

	const clearAll = useCallback(() => {
		app.state.ui.selectedGenerations.set([]);
	}, []);

	const toggleGen = useCallback((id: number) => {
		const cur = app.state.ui.selectedGenerations.peek();
		const has = cur.includes(id);
		const next = has ? cur.filter((x) => x !== id) : [...cur, id];
		app.state.ui.selectedGenerations.set(normalizeGenIds(next));
	}, []);

	const applyOption = useCallback((opt: GenOption) => {
		if (opt.isClear) {
			clearAll();
			return;
		}
		const id = Number.parseInt(opt.key, 10);
		if (id >= 1 && id <= 9) toggleGen(id);
	}, [clearAll, toggleGen]);

	const isOptionSelected = useCallback(
		(opt: GenOption): boolean => {
			if (opt.isClear) return selected.length === 0;
			const id = Number.parseInt(opt.key, 10);
			return selected.includes(id);
		},
		[selected],
	);

	const close = useCallback(() => {
		setOpen(false);
		setQuery("");
	}, []);

	return (
		<Box className="flex-row flex-wrap items-center gap-1">
			<Pressable
				onPress={() => {
					setOpen(true);
					setQuery("");
				}}
			>
				<Box className="h-9 min-w-[200px] max-w-[260px] flex-row items-center rounded-md border border-border bg-background px-3">
					<Text
						className="flex-1 text-sm text-foreground"
						numberOfLines={1}
					>
						{selectedLabel}
					</Text>
					<MaterialIcons name="arrow-drop-down" size={22} color="#888" />
				</Box>
			</Pressable>
			{selected.length > 0 ? (
				<Pressable
					accessibilityLabel="Reset to all generations"
					onPress={clearAll}
					className="h-8 w-8 items-center justify-center rounded-md"
				>
					<MaterialIcons name="close" size={20} color="#888" />
				</Pressable>
			) : null}

			<Modal
				visible={open}
				animationType="slide"
				transparent
				onRequestClose={close}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : undefined}
					className="flex-1 justify-end bg-black/50"
				>
					<Pressable className="flex-1" onPress={close} />
					<View
						className="max-h-[70%] rounded-t-xl bg-background"
						style={{ paddingBottom: insets.bottom + 8 }}
					>
						<Box className="flex-row items-center justify-between border-b border-border px-3 py-2">
							<Text className="flex-1 text-center text-base font-semibold text-foreground">
								Generations
							</Text>
							<Pressable onPress={close} className="absolute right-2 p-2">
								<Text className="text-base font-medium text-primary">Done</Text>
							</Pressable>
						</Box>
						<Box className="px-3 py-2">
							<Input>
								<InputField
									placeholder="Search…"
									value={query}
									onChangeText={setQuery}
								/>
							</Input>
						</Box>
						<FlatList
							data={filtered}
							keyExtractor={(item) => item.key}
							keyboardShouldPersistTaps="handled"
							ListEmptyComponent={
								<Text className="px-4 py-6 text-center text-sm text-muted-foreground">
									No generations match.
								</Text>
							}
							renderItem={({ item }) => {
								const sel = isOptionSelected(item);
								return (
									<Pressable
										onPress={() => applyOption(item)}
										className="flex-row items-center gap-2 border-b border-border/50 px-4 py-3 active:bg-accent"
									>
										<Box className="h-5 w-5 items-center justify-center">
											{sel ? (
												<MaterialIcons
													name="check"
													size={20}
													color="#22c55e"
												/>
											) : null}
										</Box>
										<Text className="flex-1 text-base text-foreground">
											{item.label}
										</Text>
									</Pressable>
								);
							}}
						/>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</Box>
	);
}
