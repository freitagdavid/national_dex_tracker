import { Platform, useWindowDimensions } from "react-native";

/** Matches Tailwind `md`: desktop web gets anchored dropdowns; native & narrow web keep bottom sheets. */
const DESKTOP_WEB_MIN_W = 768;

export function useDesktopFilterDropdown(): boolean {
	const { width } = useWindowDimensions();
	return Platform.OS === "web" && width >= DESKTOP_WEB_MIN_W;
}
