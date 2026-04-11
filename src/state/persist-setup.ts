import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureObservablePersistence } from "@legendapp/state/persist";
import { ObservablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";

// On web, AsyncStorage is backed by localStorage with the same keys as the old
// Vite app's ObservablePersistLocalStorage, so existing `nationalDexTracker` data
// continues to work without a separate migration step.

configureObservablePersistence({
	pluginLocal: ObservablePersistAsyncStorage,
	localOptions: {
		asyncStorage: {
			AsyncStorage,
		},
	},
});
