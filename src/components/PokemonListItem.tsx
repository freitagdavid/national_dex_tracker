import { useCallback, useRef } from "react";
import { useSelector } from "@legendapp/state/react";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ReanimatedSwipeable, {
	type SwipeableMethods,
	SwipeDirection,
} from "react-native-gesture-handler/ReanimatedSwipeable";
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
import { Text as UIText } from "@/components/ui/text";

const SWIPE_ACTION_WIDTH = 120;
const CARD_RADIUS = 22;
/** Pulls each underlay slightly under the card so a subpixel seam doesn’t show at the inner edge (tune per platform). */
const UNDERLAY_EDGE_NUDGE = 20;

function CaughtSwipePanel({ caught }: { caught: boolean }) {
	const bg = caught ? "#15803d" : "#22c55e";
	return (
		<View
			pointerEvents="none"
			style={[
				styles.actionUnderlay,
				{
					width: SWIPE_ACTION_WIDTH,
					backgroundColor: bg,
					marginRight: -UNDERLAY_EDGE_NUDGE,
				},
			]}
			accessibilityElementsHidden
			importantForAccessibility="no-hide-descendants"
		>
			<MaterialIcons
				name={caught ? "undo" : "check-circle"}
				color="#fff"
				size={26}
			/>
			<Text style={styles.swipeLabel}>
				{caught ? "Uncaught" : "Caught"}
			</Text>
		</View>
	);
}

function FavoriteSwipePanel({ favorite }: { favorite: boolean }) {
	const bg = favorite ? "#b45309" : "#d97706";
	return (
		<View
			pointerEvents="none"
			style={[
				styles.actionUnderlay,
				{
					width: SWIPE_ACTION_WIDTH,
					backgroundColor: bg,
					marginLeft: -UNDERLAY_EDGE_NUDGE,
				},
			]}
			accessibilityElementsHidden
			importantForAccessibility="no-hide-descendants"
		>
			<MaterialIcons
				name={favorite ? "star-border" : "star"}
				color="#fff"
				size={26}
			/>
			<Text style={styles.swipeLabel}>
				{favorite ? "Unfavorite" : "Favorite"}
			</Text>
		</View>
	);
}

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

	const swipeRef = useRef<SwipeableMethods | null>(null);
	/** True while a horizontal swipe gesture is active or until the row has settled closed. */
	const blockRowPressRef = useRef(false);

	const primaryType = poke.types.find(Boolean);
	const dexLabel = useListDexDisplayLabel(poke);
	const { url: spriteUrl, colorCacheKey } = usePokemonSpriteUrl(poke);
	const { theme } = usePokemonListImageTheme(spriteUrl, primaryType, colorCacheKey);
	const typeLabels = poke.types.filter((t): t is string => Boolean(t));

	const handleSwipeOpen = useCallback(
		(direction: SwipeDirection) => {
			if (direction === SwipeDirection.RIGHT) {
				const cur = app.state.ui.caughtById[poke.id].peek() ?? false;
				setPokemonCaught(poke.id, !cur);
			} else {
				const cur = app.state.ui.favoriteById[poke.speciesId].peek() ?? false;
				setPokemonFavorite(poke.speciesId, !cur);
			}
			queueMicrotask(() => {
				swipeRef.current?.close();
			});
		},
		[poke.id, poke.speciesId],
	);

	const card = (
		<Pressable
			style={{ width: "100%" }}
			onPress={() => {
				if (blockRowPressRef.current) {
					return;
				}
				openPokemonInfo(poke.speciesId, poke.id);
			}}
			accessibilityRole="button"
			accessibilityHint="Swipe right to toggle caught, swipe left to toggle favorite."
		>
			<Card
				className="relative min-h-[104px] flex-row overflow-hidden rounded-[1.35rem] border-0 py-0 pl-4 pr-0 shadow-md"
				style={{ backgroundColor: theme.cardBg }}
			>
				<Box className="relative z-10 min-w-0 flex-1 flex-col justify-center gap-2 py-3 pr-1">
					<Box className="min-w-0 flex-row items-center gap-2">
						<Box className="min-w-0 flex-1 flex-row items-baseline gap-2">
							<UIText
								className="shrink-0 font-mono text-base font-semibold tabular-nums text-foreground"
								style={{ color: theme.text }}
							>
								{dexLabel}
							</UIText>
							<UIText
								className="min-w-0 flex-1 text-lg font-bold text-foreground"
								style={{ color: theme.text }}
								numberOfLines={2}
							>
								{poke.displayName}
							</UIText>
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
								<UIText
									className="text-[10px] font-bold uppercase tracking-wider"
									style={{ color: theme.text }}
								>
									{t}
								</UIText>
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

	return (
		<View className="mb-3" style={styles.rowWrap}>
			<ReanimatedSwipeable
				ref={swipeRef}
				overshootLeft={false}
				overshootRight={false}
				friction={1.75}
				containerStyle={styles.swipeContainer}
				childrenContainerStyle={styles.swipeChild}
				onSwipeableOpenStartDrag={() => {
					blockRowPressRef.current = true;
				}}
				onSwipeableClose={() => {
					blockRowPressRef.current = false;
				}}
				onSwipeableOpen={handleSwipeOpen}
				renderLeftActions={() => <CaughtSwipePanel caught={caught} />}
				renderRightActions={() => <FavoriteSwipePanel favorite={favorite} />}
			>
				{card}
			</ReanimatedSwipeable>
		</View>
	);
};

const styles = StyleSheet.create({
	rowWrap: {
		overflow: "visible",
	},
	swipeContainer: {
		borderRadius: CARD_RADIUS,
		overflow: "hidden",
	},
	/** Card + pan layer sit above the colored underlays (drawn first in the swipe container). */
	swipeChild: {
		backgroundColor: "transparent",
		zIndex: 2,
		elevation: 3,
	},
	actionUnderlay: {
		zIndex: 0,
		elevation: 0,
		alignSelf: "stretch",
		justifyContent: "center",
		alignItems: "center",
		gap: 4,
		paddingHorizontal: 4,
	},
	swipeLabel: {
		color: "#fff",
		fontSize: 10,
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 0.3,
		textAlign: "center",
	},
});

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
