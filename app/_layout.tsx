import "../global.css";
import "../preload-rn";
import "../import-reanimated";
import { Stack } from "expo-router";
import { useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ChromeHeader } from "../src/navigation/ChromeHeader";
import { DesktopSidebar } from "../src/navigation/DesktopSidebar";
import { MobileSideDrawer } from "../src/navigation/MobileSideDrawer";
import { NavDrawerProvider } from "../src/navigation/NavDrawerContext";
import { DESKTOP_BREAKPOINT } from "../src/navigation/nav-config";
import { Provider } from "../src/state";

import { GluestackUIProvider } from "../src/components/ui/gluestack-ui-provider";
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";

export default function RootLayout() {
	const { width } = useWindowDimensions();
	const isDesktop = width >= DESKTOP_BREAKPOINT;

	return (
		<SafeAreaListener
			onChange={({ insets }) => {
				Uniwind.updateInsets(insets);
			}}
		>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<GluestackUIProvider mode="dark">
					<GestureHandlerRootView style={{ flex: 1 }}>
						<Provider>
							<NavDrawerProvider>
								<View className="flex-1 flex-row">
									{isDesktop ? <DesktopSidebar /> : null}
									<View style={{ flex: 1, minWidth: 0 }}>
										<Stack
											screenOptions={{
												headerShown: true,
												header: () => <ChromeHeader />,
												animation: "fade",
											}}
										/>
										<MobileSideDrawer />
									</View>
								</View>
							</NavDrawerProvider>
						</Provider>
					</GestureHandlerRootView>
				</GluestackUIProvider>
			</GestureHandlerRootView>
		</SafeAreaListener>
	);
}
