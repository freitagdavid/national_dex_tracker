import { Image } from "expo-image";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useChromaKeyedSpriteUrl } from "@/hooks/usePokemonSpriteUrl";
import type { SpriteVariationEntry } from "@/lib/pokeSpriteUrl";

function VariationTile({
	entry,
	artBlob,
	themeText,
}: {
	entry: SpriteVariationEntry;
	artBlob: string;
	themeText: string;
}) {
	const { displayUrl } = useChromaKeyedSpriteUrl(entry.url);
	if (!displayUrl) return null;
	return (
		<Box className="w-24 flex-col items-center gap-1.5">
			<Box
				className="flex h-[88px] w-[88px] items-center justify-center rounded-xl"
				style={{ backgroundColor: artBlob }}
			>
				<Image
					source={{ uri: displayUrl }}
					style={{ width: 64, height: 64 }}
					contentFit="contain"
				/>
			</Box>
			<Text
				className="max-w-24 text-center text-[11px] leading-tight opacity-85"
				style={{ color: themeText }}
				numberOfLines={3}
			>
				{entry.label}
			</Text>
		</Box>
	);
}

export function InfoModalSpriteVariations({
	entries,
	artBlob,
	themeText,
}: {
	entries: SpriteVariationEntry[];
	artBlob: string;
	themeText: string;
}) {
	if (entries.length <= 1) return null;
	return (
		<Box className="gap-2">
			<Text className="text-sm font-semibold" style={{ color: themeText }}>
				Sprite variations
			</Text>
			<Text className="text-xs opacity-75" style={{ color: themeText }}>
				Shiny and gender-specific fronts for this game selection (PokéAPI).
			</Text>
			<Box className="flex-row flex-wrap justify-center gap-4 sm:justify-start">
				{entries.map((e) => (
					<VariationTile
						key={e.key}
						entry={e}
						artBlob={artBlob}
						themeText={themeText}
					/>
				))}
			</Box>
		</Box>
	);
}
