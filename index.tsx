import "@expo/metro-runtime";
import "./preload-rn";
import "./import-reanimated";
import "./global.css";
import { registerRootComponent } from "expo";
import App from "./src/App";
import { Provider } from "./src/state";

function Root() {
	return (
		<Provider>
			<App />
		</Provider>
	);
}

registerRootComponent(Root);
