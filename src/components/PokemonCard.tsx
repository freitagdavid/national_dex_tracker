import { useSelector } from "@legendapp/state/react";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import type { Pokemon } from "@/state";
import { app, openPokemonInfo, setPokemonCaught } from "@/state";
import { usePokemonSpriteUrl } from "@/hooks/usePokemonSpriteUrl";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";

export const SkeletonCard = () => {
	return (
		<Card className="mt-3 aspect-square w-44 flex-col justify-between">
			<Box className="py-2">
				<Skeleton className="h-6 w-full" />
			</Box>
			<Box className="items-center px-0 pb-0">
				<Skeleton className="h-[100px] w-[100px]" />
			</Box>
			<Box className="w-full items-center px-0 pb-0">
				<Skeleton className="h-9 w-full" />
			</Box>
		</Card>
	);
};

export const PokemonCard = ({
	poke,
	boxNum,
}: {
	poke: Pokemon;
	boxNum: number;
}) => {
	const caught = useSelector(() => app.state.ui.caughtById[poke.id].get() ?? false);
	const { url: spriteUrl } = usePokemonSpriteUrl(poke);

	const handleCaught = () => {
		setPokemonCaught(poke.id, !caught, boxNum);
	};

	return (
		<Pressable onPress={handleCaught}>
			<Card className="relative mt-3 aspect-square w-44 flex-col justify-between">
				<Pressable
					accessibilityLabel={`${poke.displayName} details`}
					onPress={() => openPokemonInfo(poke.speciesId, poke.id)}
					className="absolute right-1 top-1 z-10 h-7 w-7 items-center justify-center rounded-full border border-border bg-background"
				>
					<MaterialIcons name="info-outline" size={18} color="#333" />
				</Pressable>
				<Box className="py-2">
					<Text className="text-center text-base font-semibold text-card-foreground">
						{poke.displayName}
					</Text>
				</Box>
				<Box className="items-center px-0 pb-0">
					<Image
						source={{ uri: spriteUrl }}
						style={{ width: 100, height: 100 }}
						contentFit="contain"
						transition={200}
					/>
				</Box>
				<Box
					className={`w-full py-2 ${caught ? "bg-green-500" : "bg-red-500"}`}
				>
					<Text className="text-center text-sm font-medium text-white">
						{caught ? "Caught" : "Uncaught"}
					</Text>
				</Box>
			</Card>
		</Pressable>
	);
};
