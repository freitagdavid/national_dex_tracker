/**
 * Native: preload RN FlatList before Reanimated (avoids init race with lazy getters).
 */
import { FlatList, View } from "react-native";

void View;
void FlatList;
