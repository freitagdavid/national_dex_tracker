import "../global.css";
import "../preload-rn";
import "../import-reanimated";
import { Stack } from "expo-router";
import { Provider } from "@/state";

export default function RootLayout() {
	return (
		<Provider>
			<Stack screenOptions={{ headerShown: false }} />
		</Provider>
	);
}
