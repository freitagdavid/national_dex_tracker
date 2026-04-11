import { useSelector } from "@legendapp/state/react";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import Svg, { Circle, Defs, Mask, Path } from "react-native-svg";
import {
	type Pokemon,
	app,
	openPokemonInfo,
	setPokemonCaught,
	setPokemonFavorite,
} from "@/state";
import { useListDexDisplayLabel } from "@/hooks/useListDexDisplayLabel";
import { usePokemonListImageTheme } from "@/hooks/usePokemonListImageTheme";
import { usePokemonSpriteUrl } from "@/hooks/usePokemonSpriteUrl";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";

function CaughtCutoutDisc({
	fill,
	maskId,
}: {
	fill: string;
	maskId: string;
}) {
	return (
		<Svg width={20} height={20} viewBox="0 0 28 28" accessibilityLabel="Caught">
			<Defs>
				<Mask id={maskId} maskUnits="userSpaceOnUse">
					<Circle cx="14" cy="14" r="12" fill="white" />
					<Path
						d="M8.5 14.25 L12.75 18.5 L19.5 10"
						fill="none"
						stroke="black"
						strokeWidth="2.75"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</Mask>
			</Defs>
			<Circle cx="14" cy="14" r="12" fill={fill} mask={`url(#${maskId})`} />
		</Svg>
	);
}

export const PokemonListItem = ({ poke }: { poke: Pokemon }) => {
	const caught = useSelector(() => app.state.ui.caughtById[poke.id].get() ?? false);
	const favorite = useSelector(
		() => app.state.ui.favoriteById[poke.speciesId].get() ?? false,
	);

	const primaryType = poke.types.find(Boolean);
	const dexLabel = useListDexDisplayLabel(poke);
	const { url: spriteUrl, colorCacheKey } = usePokemonSpriteUrl(poke);
	const { theme } = usePokemonListImageTheme(spriteUrl, primaryType, colorCacheKey);
	const typeLabels = poke.types.filter((t): t is string => Boolean(t));

	return (
		<Pressable
			onPress={() => openPokemonInfo(poke.speciesId, poke.id)}
			accessibilityRole="button"
		>
			<Card
				className="relative mb-3 min-h-[104px] flex-row overflow-hidden rounded-[1.35rem] border-0 py-0 pl-4 pr-0 shadow-md"
				style={{ backgroundColor: theme.cardBg }}
			>
				<Box className="relative z-10 min-w-0 flex-1 flex-col justify-center gap-2 py-3 pr-1">
					<Box className="min-w-0 flex-row items-center gap-2">
						<Box className="min-w-0 flex-1 flex-row items-baseline gap-2">
							<Text
								className="shrink-0 font-mono text-base font-semibold tabular-nums text-foreground"
								style={{ color: theme.text }}
							>
								{dexLabel}
							</Text>
							<Text
								className="min-w-0 flex-1 text-lg font-bold text-foreground"
								style={{ color: theme.text }}
								numberOfLines={2}
							>
								{poke.displayName}
							</Text>
						</Box>
						<Box className="shrink-0 flex-row items-center gap-0.5 pr-1">
							<Pressable
								accessibilityLabel={
									favorite ? "Remove favorite" : "Add favorite"
								}
								onPress={(e) => {
									e?.stopPropagation?.();
									setPokemonFavorite(poke.speciesId, !favorite);
								}}
								className="rounded-full p-1.5"
							>
								<MaterialIcons
									name={favorite ? "star" : "star-border"}
									size={22}
									color={theme.text}
								/>
							</Pressable>
							<Pressable
								accessibilityLabel={caught ? "Mark uncaught" : "Mark caught"}
								onPress={(e) => {
									e?.stopPropagation?.();
									setPokemonCaught(poke.id, !caught);
								}}
								className="rounded-full p-1.5"
							>
								{caught ? (
									<CaughtCutoutDisc
										fill={theme.text}
										maskId={`list-caught-cutout-${poke.id}`}
									/>
								) : (
									<MaterialIcons
										name="radio-button-unchecked"
										size={22}
										color={theme.text}
									/>
								)}
							</Pressable>
						</Box>
					</Box>
					<Box className="flex-row flex-wrap gap-1.5">
						{typeLabels.map((t) => (
							<Box
								key={t}
								className="rounded-full border px-2.5 py-0.5"
								style={{
									backgroundColor: theme.pillBg,
									borderColor: theme.pillBorder,
								}}
							>
								<Text
									className="text-[10px] font-bold uppercase tracking-wider"
									style={{ color: theme.text }}
								>
									{t}
								</Text>
							</Box>
						))}
					</Box>
				</Box>

				<Box className="relative w-[34%] max-w-[136px] min-w-[100px] shrink-0 items-center justify-center self-stretch">
					<Box
						className="absolute bottom-0 right-0 top-0 w-[92%] rounded-l-full"
						style={{ backgroundColor: theme.artBlob }}
					/>
					<Image
						key={`${poke.id}-${colorCacheKey}`}
						source={{ uri: spriteUrl }}
						style={{ width: 104, height: 104 }}
						contentFit="contain"
						className="relative z-10"
					/>
				</Box>
			</Card>
		</Pressable>
	);
};

export function PokemonListItemSkeleton() {
	return (
		<Card className="relative mb-3 min-h-[104px] flex-row overflow-hidden rounded-[1.35rem] border-0 bg-muted/40 py-0 pl-4 pr-0 shadow-md">
			<Box className="relative z-10 min-w-0 flex-1 flex-col justify-center gap-2 py-3 pr-1">
				<Box className="min-w-0 flex-row items-center gap-2">
					<Box className="min-w-0 flex-1 flex-row items-baseline gap-2">
						<Skeleton className="h-5 w-11 shrink-0 rounded" />
						<Skeleton className="h-6 min-w-0 max-w-[12rem] flex-1 rounded-md" />
					</Box>
					<Box className="shrink-0 flex-row items-center gap-0.5 pr-1">
						<Skeleton className="h-9 w-9 shrink-0 rounded-full" />
						<Skeleton className="h-9 w-9 shrink-0 rounded-full" />
					</Box>
				</Box>
				<Box className="flex-row flex-wrap gap-1.5">
					<Skeleton className="h-5 w-14 rounded-full" />
					<Skeleton className="h-5 w-16 rounded-full" />
				</Box>
			</Box>
			<Box className="relative w-[34%] max-w-[136px] min-w-[100px] shrink-0 items-center justify-center self-stretch">
				<Skeleton className="h-26 w-26 shrink-0 rounded-lg" />
			</Box>
		</Card>
	);
}
