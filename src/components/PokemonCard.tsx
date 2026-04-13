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
import { memo } from "react";
import { pokemonRowPropsEqual } from "@/lib/pokemonRowMemo";

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

const PokemonCardInner = ({
	poke,
	boxNum,
	caught,
}: {
	poke: Pokemon;
	boxNum: number;
	caught: boolean;
}) => {
	const { url: spriteUrl } = usePokemonSpriteUrl(poke);

	const handleCaught = () => {
		setPokemonCaught(poke.id, !caught, boxNum);
	};

	return (
		<Pressable onPress={handleCaught}>
			<Card className="relative mt-3 aspect-square w-44 flex-col px-1 py-2">
				<Box className="flex flex-row justify-center items-center w-full">
					<Text className="text-center text-base font-semibold text-card-foreground">
						{poke.displayName}
					</Text>
					<Pressable
						accessibilityLabel={`${poke.displayName} details`}
						onPress={() => openPokemonInfo(poke.speciesId, poke.id)}
						className="z-10 h-7 w-7 items-center justify-center rounded-full border border-border bg-background align-self-end absolute right-0"
					>
						<MaterialIcons name="info-outline" size={18} color="#333" />
					</Pressable>
				</Box>
				<Box className="items-center px-0 pb-0">
					<Image
						source={{ uri: spriteUrl }}
						style={{ width: 100, height: 100 }}
						contentFit="contain"
						cachePolicy="memory-disk"
						priority="high"
						recyclingKey={String(poke.id)}
						transition={0}
					/>
				</Box>
				<Box
					className={`w-full px-4`}
				>
					<Text className={`py-2 text-center text-sm font-medium text-white ${caught ? "bg-green-500" : "bg-red-500"}`}>
						{caught ? "Caught" : "Uncaught"}
					</Text>
				</Box>
			</Card>
		</Pressable>
	);
};

const PokemonCardMemo = memo(PokemonCardInner, (prev, next) => {
	return (
		prev.caught === next.caught &&
		prev.boxNum === next.boxNum &&
		pokemonRowPropsEqual(prev.poke, next.poke)
	);
});

export function PokemonCard({ poke, boxNum }: { poke: Pokemon; boxNum: number }) {
	const caught = useSelector(() => app.state.ui.caughtById[poke.id].get() ?? false);
	return <PokemonCardMemo poke={poke} boxNum={boxNum} caught={caught} />;
}