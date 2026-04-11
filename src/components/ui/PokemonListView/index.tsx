
import {Text} from '@/components/ui/text';
import {View} from 'react-native';

interface PokemonListViewProps {
  listStyle: 'grid' | 'list' | 'box';
}

export const PokemonListView = ({listStyle}: PokemonListViewProps) => {
  if (listStyle === 'grid') {
    return (
      <View>
        <Text>Grid</Text>
      </View>
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