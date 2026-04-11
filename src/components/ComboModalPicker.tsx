import { MaterialIcons } from "@expo/vector-icons";
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

export type ComboRow = { key: string; label: string };

export function ComboModalPicker({
	title,
	selectedLabel,
	rows,
	onSelect,
	emptyText,
	filterRow,
}: {
	title: string;
	selectedLabel: string;
	rows: ComboRow[];
	onSelect: (key: string) => void;
	emptyText: string;
	filterRow?: (row: ComboRow, needle: string) => boolean;
}) {
	const insets = useSafeAreaInsets();
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");

	const needle = query.trim().toLowerCase();
	const filtered = useMemo(() => {
		let out = rows;
		if (needle) {
			out = out.filter(
				(r) =>
					r.label.toLowerCase().includes(needle) ||
					r.key.toLowerCase().includes(needle),
			);
		}
		if (filterRow) {
			out = out.filter((r) => filterRow(r, needle));
		}
		return out;
	}, [rows, needle, filterRow]);

	const close = useCallback(() => {
		setOpen(false);
		setQuery("");
	}, []);

	const pick = useCallback(
		(key: string) => {
			onSelect(key);
			close();
		},
		[onSelect, close],
	);

	return (
		<>
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
						<Box className="border-b border-border px-3 py-2">
							<Text className="text-center text-base font-semibold text-foreground">
								{title}
							</Text>
						</Box>
						<Box className="px-3 py-2">
							<Input>
								<InputField
									placeholder="Search…"
									value={query}
									onChangeText={setQuery}
									autoFocus
								/>
							</Input>
						</Box>
						<FlatList
							data={filtered}
							keyExtractor={(item) => item.key}
							keyboardShouldPersistTaps="handled"
							ListEmptyComponent={
								<Text className="px-4 py-6 text-center text-sm text-muted-foreground">
									{emptyText}
								</Text>
							}
							renderItem={({ item }) => (
								<Pressable
									onPress={() => pick(item.key)}
									className="border-b border-border/50 px-4 py-3 active:bg-accent"
								>
									<Text className="text-base text-foreground">
										{item.label}
									</Text>
								</Pressable>
							)}
						/>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</>
	);
}
