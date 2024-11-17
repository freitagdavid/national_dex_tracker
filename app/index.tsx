import type { Pokemon_V2_Pokemon } from 'api';
import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { FlatList } from 'react-native';
import { useGetAllPokemonQuery } from 'services/pokemon';
import { View, Text, ListItem, Card } from 'tamagui';

export default function Pokedex() {
    const navigation = useNavigation();
    const { data, error, isLoading } = useGetAllPokemonQuery('');
    useEffect(() => {
        navigation.setOptions({
            title: 'Pokedex',
        });
    });
    useEffect(() => {
        console.log(data);
    }, [data]);
    return (
        <View height='100%'>
            {isLoading && <Text>Loading...</Text>}
            {data && (
                <FlatList
                    scrollEnabled={true}
                    data={data.pokemon_v2_pokemon}
                    renderItem={({ item }) => (
                        <Card key={item.name}>
                            <Card.Header>
                                <Text>{item.name}</Text>
                            </Card.Header>
                        </Card>
                    )}
                />
            )}
        </View>
    );
}
