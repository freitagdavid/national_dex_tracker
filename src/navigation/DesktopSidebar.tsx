import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";
import { DrawerNavContent } from "./DrawerNavContent";

const SIDEBAR_WIDTH = 288;

/** Persistent left rail for viewports at or above `DESKTOP_BREAKPOINT`. */
export function DesktopSidebar() {
	const insets = useSafeAreaInsets();
	const { theme } = useUniwind();
	const isDark = theme === "dark";
	const borderColor = isDark ? "#27272a" : "#e4e4e7";
	const bg = isDark ? "#09090b" : "#fafafa";

	return (
		<View
			style={{
				width: SIDEBAR_WIDTH,
				flexGrow: 0,
				flexShrink: 0,
				paddingTop: insets.top + 12,
				paddingBottom: insets.bottom + 16,
				paddingLeft: 0,
				paddingRight: 0,
				borderRightWidth: 1,
				borderRightColor: borderColor,
				backgroundColor: bg,
			}}
		>
			<DrawerNavContent />
		</View>
	);
}
