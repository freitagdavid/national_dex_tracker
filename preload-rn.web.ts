/**
 * Web: ensure react-native-web's FlatList is initialized before Reanimated loads.
 * Reanimated imports `FlatList` from `react-native`; on web the core RN FlatList path breaks.
 */
import { FlatList } from "react-native-web";

void FlatList;
