import { Pressable, Text, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NAV_ITEMS, pathActive } from "./nav-config";

type DrawerNavContentProps = {
	/** Called after navigation (e.g. close overlay drawer on mobile). */
	onNavigate?: () => void;
};

export function DrawerNavContent({ onNavigate }: DrawerNavContentProps) {
	const router = useRouter();
	const pathname = usePathname();

	return (
		<>
			<View className="border-b border-border px-4 pb-3">
				<Text className="text-lg font-semibold text-foreground">National Dex Tracker</Text>
				<Text className="mt-0.5 text-xs text-muted-foreground">Browse</Text>
			</View>
			<View className="mt-2 px-2">
				{NAV_ITEMS.map(({ href, label }) => {
					const active = pathActive(pathname, href);
					return (
						<Pressable
							key={href}
							onPress={() => {
								router.push(href);
								onNavigate?.();
							}}
							className={`mb-1 flex-row items-center rounded-lg px-3 py-3 active:bg-accent ${active ? "bg-accent" : ""}`}
							accessibilityRole="button"
							accessibilityState={{ selected: active }}
						>
							<Text
								className={`text-base ${active ? "font-semibold text-foreground" : "text-foreground"}`}
							>
								{label}
							</Text>
							<Ionicons
								name="chevron-forward"
								size={18}
								color="#71717a"
								style={{ marginLeft: "auto", opacity: 0.7 }}
							/>
						</Pressable>
					);
				})}
			</View>
		</>
	);
}
