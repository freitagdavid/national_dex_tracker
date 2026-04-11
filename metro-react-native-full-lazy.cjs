/**
 * Web shim for `react-native` and react-native-web package main. Metro dedupes by file path; one
 * module must supply every RN-web export. Each export is loaded on first access via static
 * `require("react-native-web/dist/cjs/exports/…")` (Metro forbids dynamic require paths).
 * `TurboModuleRegistry` is included for worklets.
 */
"use strict";

/** @type {Record<string, () => unknown>} */
const factories = {
	AccessibilityInfo: () => require("react-native-web/dist/cjs/exports/AccessibilityInfo"),
	ActivityIndicator: () => require("react-native-web/dist/cjs/exports/ActivityIndicator"),
	Alert: () => require("react-native-web/dist/cjs/exports/Alert"),
	Animated: () => require("react-native-web/dist/cjs/exports/Animated"),
	AppRegistry: () => require("react-native-web/dist/cjs/exports/AppRegistry"),
	AppState: () => require("react-native-web/dist/cjs/exports/AppState"),
	Appearance: () => require("react-native-web/dist/cjs/exports/Appearance"),
	BackHandler: () => require("react-native-web/dist/cjs/exports/BackHandler"),
	Button: () => require("react-native-web/dist/cjs/exports/Button"),
	CheckBox: () => require("react-native-web/dist/cjs/exports/CheckBox"),
	Clipboard: () => require("react-native-web/dist/cjs/exports/Clipboard"),
	DeviceEventEmitter: () => require("react-native-web/dist/cjs/exports/DeviceEventEmitter"),
	Dimensions: () => require("react-native-web/dist/cjs/exports/Dimensions"),
	Easing: () => require("react-native-web/dist/cjs/exports/Easing"),
	FlatList: () => require("react-native-web/dist/cjs/exports/FlatList"),
	I18nManager: () => require("react-native-web/dist/cjs/exports/I18nManager"),
	Image: () => require("react-native-web/dist/cjs/exports/Image"),
	ImageBackground: () => require("react-native-web/dist/cjs/exports/ImageBackground"),
	InputAccessoryView: () => require("react-native-web/dist/cjs/exports/InputAccessoryView"),
	InteractionManager: () => require("react-native-web/dist/cjs/exports/InteractionManager"),
	Keyboard: () => require("react-native-web/dist/cjs/exports/Keyboard"),
	KeyboardAvoidingView: () => require("react-native-web/dist/cjs/exports/KeyboardAvoidingView"),
	LayoutAnimation: () => require("react-native-web/dist/cjs/exports/LayoutAnimation"),
	Linking: () => require("react-native-web/dist/cjs/exports/Linking"),
	LogBox: () => require("react-native-web/dist/cjs/exports/LogBox"),
	Modal: () => require("react-native-web/dist/cjs/exports/Modal"),
	NativeEventEmitter: () => require("react-native-web/dist/cjs/exports/NativeEventEmitter"),
	NativeModules: () => require("react-native-web/dist/cjs/exports/NativeModules"),
	PanResponder: () => require("react-native-web/dist/cjs/exports/PanResponder"),
	Picker: () => require("react-native-web/dist/cjs/exports/Picker"),
	PixelRatio: () => require("react-native-web/dist/cjs/exports/PixelRatio"),
	Platform: () => require("react-native-web/dist/cjs/exports/Platform"),
	Pressable: () => require("react-native-web/dist/cjs/exports/Pressable"),
	ProgressBar: () => require("react-native-web/dist/cjs/exports/ProgressBar"),
	RefreshControl: () => require("react-native-web/dist/cjs/exports/RefreshControl"),
	SafeAreaView: () => require("react-native-web/dist/cjs/exports/SafeAreaView"),
	ScrollView: () => require("react-native-web/dist/cjs/exports/ScrollView"),
	SectionList: () => require("react-native-web/dist/cjs/exports/SectionList"),
	Share: () => require("react-native-web/dist/cjs/exports/Share"),
	StatusBar: () => require("react-native-web/dist/cjs/exports/StatusBar"),
	StyleSheet: () => require("react-native-web/dist/cjs/exports/StyleSheet"),
	Switch: () => require("react-native-web/dist/cjs/exports/Switch"),
	Text: () => require("react-native-web/dist/cjs/exports/Text"),
	TextInput: () => require("react-native-web/dist/cjs/exports/TextInput"),
	Touchable: () => require("react-native-web/dist/cjs/exports/Touchable"),
	TouchableHighlight: () => require("react-native-web/dist/cjs/exports/TouchableHighlight"),
	TouchableNativeFeedback: () => require("react-native-web/dist/cjs/exports/TouchableNativeFeedback"),
	TouchableOpacity: () => require("react-native-web/dist/cjs/exports/TouchableOpacity"),
	TouchableWithoutFeedback: () => require("react-native-web/dist/cjs/exports/TouchableWithoutFeedback"),
	UIManager: () => require("react-native-web/dist/cjs/exports/UIManager"),
	Vibration: () => require("react-native-web/dist/cjs/exports/Vibration"),
	View: () => require("react-native-web/dist/cjs/exports/View"),
	VirtualizedList: () => require("react-native-web/dist/cjs/exports/VirtualizedList"),
	YellowBox: () => require("react-native-web/dist/cjs/exports/YellowBox"),
	createElement: () => require("react-native-web/dist/cjs/exports/createElement"),
	findNodeHandle: () => require("react-native-web/dist/cjs/exports/findNodeHandle"),
	processColor: () => require("react-native-web/dist/cjs/exports/processColor"),
	render: () => require("react-native-web/dist/cjs/exports/render"),
	unmountComponentAtNode: () => require("react-native-web/dist/cjs/exports/unmountComponentAtNode"),
	useColorScheme: () => require("react-native-web/dist/cjs/exports/useColorScheme"),
	useLocaleContext: () => require("react-native-web/dist/cjs/exports/useLocaleContext"),
	useWindowDimensions: () => require("react-native-web/dist/cjs/exports/useWindowDimensions"),
};

/** Names on the public barrel that map to a different export folder. */
const ALIASES = {
	unstable_createElement: "createElement",
};

const TurboModuleRegistry = {
	get() {
		return null;
	},
	getEnforcing(name) {
		const m = TurboModuleRegistry.get(name);
		if (m == null) {
			throw new Error(
				`TurboModuleRegistry.getEnforcing(...): '${name}' could not be found. ` +
					"Verify that a module by this name is registered in the native binary.",
			);
		}
		return m;
	},
};

const cache = Object.create(null);

function loadNamed(name) {
	const key = ALIASES[name] ?? name;
	const factory = factories[key];
	if (!factory) {
		return undefined;
	}
	if (cache[name] !== undefined) {
		return cache[name];
	}
	const m = factory();
	cache[name] = m != null && m.default != null ? m.default : m;
	return cache[name];
}

function hasExport(name) {
	if (typeof name !== "string") return false;
	if (Object.prototype.hasOwnProperty.call(ALIASES, name)) return true;
	return Object.prototype.hasOwnProperty.call(factories, ALIASES[name] ?? name);
}

const sticky = {
	__esModule: true,
	TurboModuleRegistry,
};

const proxy = new Proxy(sticky, {
	get(_target, prop, receiver) {
		if (prop === "default") {
			return receiver;
		}
		if (Object.prototype.hasOwnProperty.call(sticky, prop)) {
			return sticky[prop];
		}
		if (typeof prop !== "string") {
			return undefined;
		}
		return loadNamed(prop);
	},
	has(_target, prop) {
		if (typeof prop !== "string") return false;
		if (Object.prototype.hasOwnProperty.call(sticky, prop)) return true;
		return hasExport(prop);
	},
});

module.exports = proxy;
