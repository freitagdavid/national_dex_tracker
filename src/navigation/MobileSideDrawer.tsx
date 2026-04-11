import { useEffect } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DESKTOP_BREAKPOINT, NAV_ITEMS, pathActive } from "./nav-config";
import { useNavDrawer } from "./NavDrawerContext";

const DRAWER_WIDTH = 288;
const TIMING_MS = 240;
/** Must match `ChromeHeader` content row (`h-12`). */
const HEADER_ROW_PX = 48;

export function MobileSideDrawer() {
	const { width } = useWindowDimensions();
	const isDesktop = width >= DESKTOP_BREAKPOINT;
	const { open, close } = useNavDrawer();
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const pathname = usePathname();

	const progress = useSharedValue(0);

	useEffect(() => {
		if (isDesktop && open) {
			close();
		}
	}, [isDesktop, open, close]);

	useEffect(() => {
		if (isDesktop) {
			progress.value = 0;
			return;
		}
		progress.value = withTiming(open ? 1 : 0, { duration: TIMING_MS });
	}, [open, isDesktop, progress]);

	const backdropStyle = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, [0, 1], [0, 0.45]),
	}));

	const panelStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateX: interpolate(
					progress.value,
					[0, 1],
					[-DRAWER_WIDTH, 0],
				),
			},
		],
	}));

	if (isDesktop) {
		return null;
	}

	const belowHeaderTop = insets.top + HEADER_ROW_PX;

	return (
		<View
			pointerEvents={open ? "box-none" : "none"}
			style={{
				position: "absolute",
				left: 0,
				right: 0,
				top: belowHeaderTop,
				bottom: 0,
				zIndex: 50,
			}}
		>
			<Animated.View
				pointerEvents={open ? "auto" : "none"}
				style={[
					StyleSheet.absoluteFillObject,
					backdropStyle,
					{ backgroundColor: "#000" },
				]}
			>
				<Pressable style={StyleSheet.absoluteFillObject} onPress={close} />
			</Animated.View>
			<Animated.View
				pointerEvents="box-none"
				className="absolute bottom-0 border-r border-border bg-background"
				style={[
					panelStyle,
					{
						top: 0,
						width: DRAWER_WIDTH,
						zIndex: 51,
						paddingTop: 12,
						paddingBottom: insets.bottom + 16,
						shadowColor: "#000",
						shadowOffset: { width: 2, height: 0 },
						shadowOpacity: 0.12,
						shadowRadius: 8,
						elevation: 8,
					},
				]}
			>
				<View className="border-b border-border px-4 pb-3">
					<Text className="text-lg font-semibold text-foreground">
						National Dex Tracker
					</Text>
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
									close();
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
			</Animated.View>
		</View>
	);
}
