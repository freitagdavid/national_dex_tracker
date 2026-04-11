import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

type PlaceholderScreenProps = {
	title: string;
	description?: string;
};

/**
 * Temporary shell for routes that are not built yet (moves, items, etc.).
 */
export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
	return (
		<SafeAreaView
			className="flex-1 bg-background"
			edges={["top", "left", "right"]}
			style={{ flex: 1 }}
		>
			<ScrollView
				className="flex-1"
				contentContainerClassName="flex-grow p-4"
				keyboardShouldPersistTaps="handled"
			>
				<Card className="border-border bg-card p-6 shadow-sm">
					<Text className="text-xl font-semibold text-foreground">{title}</Text>
					{description ? (
						<Text className="mt-3 text-sm leading-relaxed text-muted-foreground">
							{description}
						</Text>
					) : (
						<Text className="mt-3 text-sm text-muted-foreground">
							This section is coming soon.
						</Text>
					)}
				</Card>
				<Box className="h-8" />
			</ScrollView>
		</SafeAreaView>
	);
}
