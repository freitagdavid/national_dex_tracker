import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useUniwind } from "uniwind";
import { DESKTOP_BREAKPOINT, NAV_ITEMS, pathActive } from "./nav-config";
import { useNavDrawer } from "./NavDrawerContext";

export function ChromeHeader() {
	const { width } = useWindowDimensions();
	const isDesktop = width >= DESKTOP_BREAKPOINT;
	const insets = useSafeAreaInsets();
	const pathname = usePathname();
	const { toggle } = useNavDrawer();
	const { theme } = useUniwind();
	const isDark = theme === "dark";
	const borderColor = isDark ? "#27272a" : "#e4e4e7";

	const currentLabel =
		NAV_ITEMS.find((item) => pathActive(pathname, item.href))?.label ??
		"National Dex Tracker";

	return (
		<View
			style={{
				paddingTop: insets.top,
				borderBottomWidth: 1,
				borderBottomColor: borderColor,
				backgroundColor: isDark ? "#09090b" : "#fafafa",
			}}
		>
			<View className="h-12 flex-row items-center px-3">
				{!isDesktop ? (
					<Pressable
						onPress={toggle}
						className="mr-2 h-10 w-10 items-center justify-center rounded-md active:bg-accent"
						accessibilityRole="button"
						accessibilityLabel="Open navigation menu"
					>
						<Ionicons name="menu" size={26} color={isDark ? "#fafafa" : "#18181b"} />
					</Pressable>
				) : null}

				<Text className="flex-1 text-base font-semibold text-foreground" numberOfLines={1}>
					{currentLabel}
				</Text>
			</View>
		</View>
	);
}
