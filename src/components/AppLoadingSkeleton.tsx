import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { SkeletonCard } from "@/components/PokemonCard";
import { PokemonListItemSkeleton } from "@/components/PokemonListItem";

const LIST_PLACEHOLDER_COUNT = 10;
const GRID_PLACEHOLDER_COUNT = 24;

export function AppLoadingSkeleton({
	layout,
}: {
	layout: "box" | "grid" | "list";
}) {
	if (layout === "list") {
		return (
			<Box className="w-full flex-col gap-3 px-3 py-4">
				{Array.from({ length: LIST_PLACEHOLDER_COUNT }, (_, i) => (
					<PokemonListItemSkeleton key={i} />
				))}
			</Box>
		);
	}

	if (layout === "grid") {
		return (
			<Box className="w-full flex-row flex-wrap justify-around px-2 py-2">
				{Array.from({ length: GRID_PLACEHOLDER_COUNT }, (_, i) => (
					<SkeletonCard key={i} />
				))}
			</Box>
		);
	}

	const boxSlice = Array.from({ length: 30 }, (_, i) => i);
	return (
		<Box className="w-full flex-row flex-wrap justify-around px-2 py-2">
			<Card className="mb-8 mt-8 w-[92%] max-w-[76rem] overflow-hidden p-0 shadow-md">
				<Box className="h-14 w-full bg-accent/80" />
				<Box className="flex-row flex-wrap justify-evenly py-2">
					{boxSlice.map((i) => (
						<SkeletonCard key={i} />
					))}
				</Box>
			</Card>
		</Box>
	);
}
