
import { Box } from '../../Box';
import {Text} from '@/components/ui/text';
import { Box as PokemonBox } from '../../../components/Box';
import React from 'react';
import {View} from 'react-native';

interface PokemonListViewProps {
  listStyle: 'grid' | 'list' | 'box';
}

export const PokemonListView = ({listStyle}: PokemonListViewProps) => {
  if (listStyle === 'grid') {
    return (
      <Box className="w-full flex-row flex-wrap justify-around px-2 py-2">
							{boxes.map((box, boxIndex) => (
								<PokemonBox
									box={box}
									boxNum={boxIndex}
									key={boxIndex}
								/>
							))}
						</Box>
    )
  }
  if (listStyle === 'list') {
    return (
      <View>
        <Text>List</Text>
      </View>
    )
  }
  if (listStyle === 'box') {
    return (
      <View>
        <Text>Box</Text>
      </View>
    )
  }
}