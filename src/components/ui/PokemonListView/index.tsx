import { Box as PokemonBox } from "@/components/Box";
import { Pokemon } from "@/state";
import { PokemonListItem } from "@/components/PokemonListItem";
import { PokemonCard } from "@/components/PokemonCard";
import { useMemo } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LegendList } from "@legendapp/list";

/** Grid column width target — `numColumns = max(1, floor(usableWidth / this))`. */
const GRID_TARGET_COLUMN_WIDTH = 180;

interface PokemonListViewProps {
  listStyle: 'grid' | 'list' | 'box';
  boxes: Pokemon[][];
  pokemon: Pokemon[];
}

/**
 * Extra draw ahead/behind the viewport (px). FlashList uses this for the "engaged" window; web defaults
 * are conservative (`PlatformHelper.web`: 500px) and fast flings can outpace measurement unless this is large.
 */
function useListDrawDistance() {
  const { height: windowHeight } = useWindowDimensions();
  return useMemo(() => {
    const isWeb = Platform.OS === "web";
    const mult = isWeb ? 4 : 3;
    const floor = isWeb ? 1600 : 1200;
    return Math.max(floor, Math.round(windowHeight * mult));
  }, [windowHeight]);
}

/** MVCP helps chat feeds; for a static dex list it can add layout churn (noticeable as brief gaps on web). */
const NO_MAINTAIN_VISIBLE_POSITION = { disabled: true } as const;

const listStyleFlex = { flex: 1, minHeight: 0 as const };

export const PokemonListView = ({listStyle, boxes = [], pokemon = []}: PokemonListViewProps) => {
  const { width } = useWindowDimensions();
  const drawDistance = useListDrawDistance();
  const gridNumColumns = useMemo(
    () => Math.max(1, Math.floor(width / GRID_TARGET_COLUMN_WIDTH)),
    [width],
  );
  if (listStyle === 'box') {
    return (
      <FlashList
        style={listStyleFlex}
        drawDistance={drawDistance}
        // maintainVisibleContentPosition={NO_MAINTAIN_VISIBLE_POSITION}
        data={boxes}
        renderItem={({item, index}) => (
          <PokemonBox
            box={item}
            boxNum={index}
          />
        )}
        numColumns={2}
        keyExtractor={(item) => item[0].id.toString()}
        masonry
      />
    )
  }
  if (listStyle === 'list') {
    return (
      <FlashList
        style={listStyleFlex}
        drawDistance={drawDistance}
        // maintainVisibleContentPosition={NO_MAINTAIN_VISIBLE_POSITION}
        data={pokemon}
        renderItem={({item}) => (
          <PokemonListItem poke={item} />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={1}
      />
    )
  }
  if (listStyle === 'grid') {
    return (
      <FlashList
        style={listStyleFlex}
        drawDistance={drawDistance}
        maintainVisibleContentPosition={NO_MAINTAIN_VISIBLE_POSITION}
        data={pokemon}
        renderItem={({item, index}) => (
          <PokemonCard poke={item} boxNum={Math.floor(index / 30)} />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={gridNumColumns}
      />
    )
  }
  return null;
}