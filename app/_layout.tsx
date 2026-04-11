import "../global.css";
import "../preload-rn";
import "../import-reanimated";
import { Stack } from "expo-router";
import { useLayoutEffect, useRef } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ChromeHeader } from "../src/navigation/ChromeHeader";
import { MobileSideDrawer } from "../src/navigation/MobileSideDrawer";
import { NavDrawerProvider } from "../src/navigation/NavDrawerContext";
import { Provider } from "../src/state";

import { GluestackUIProvider } from "../src/components/ui/gluestack-ui-provider";
import { SafeAreaListener } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

export default function RootLayout() {
	// #region agent log
	const rootRenderLogged = useRef(false);
	if (!rootRenderLogged.current) {
		rootRenderLogged.current = true;
		fetch("http://127.0.0.1:7600/ingest/06cfe345-8dcf-4c64-a41f-dd6b261e2b74", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Debug-Session-Id": "17756d",
			},
			body: JSON.stringify({
				sessionId: "17756d",
				runId: "root-render",
				hypothesisId: "H-mount",
				location: "app/_layout.tsx:render",
				message: "RootLayout render invoked",
				data: {},
				timestamp: Date.now(),
			}),
		}).catch(() => {});
	}
	useLayoutEffect(() => {
		if (typeof window === "undefined") return;
		fetch("http://127.0.0.1:7600/ingest/06cfe345-8dcf-4c64-a41f-dd6b261e2b74", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Debug-Session-Id": "17756d",
			},
			body: JSON.stringify({
				sessionId: "17756d",
				runId: "root-layout-mount",
				hypothesisId: "H12",
				location: "app/_layout.tsx",
				message: "RootLayout committed",
				data: {},
				timestamp: Date.now(),
			}),
		}).catch(() => {});
	}, []);
	// #endregion

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
					<View className="flex-1">
						<Stack
							screenOptions={{
								headerShown: true,
								header: () => <ChromeHeader />,
								animation: "fade",
							}}
						/>
						<MobileSideDrawer />
					</View>
				</NavDrawerProvider>
			</Provider>
		</GestureHandlerRootView>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </SafeAreaListener>
  
	);
}
