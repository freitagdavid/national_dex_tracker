import "../global.css";
import "../preload-rn";
import "../import-reanimated";
import { Stack } from "expo-router";
import { View } from "react-native";
import { ChromeHeader } from "@/navigation/ChromeHeader";
import { MobileSideDrawer } from "@/navigation/MobileSideDrawer";
import { NavDrawerProvider } from "@/navigation/NavDrawerContext";
import { Provider } from "@/state";

export default function RootLayout() {
	return (
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
	);
}
