import { useGetAllPokemonQuery } from 'api';
import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { View, Text } from 'tamagui';

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
        <View>
            <Text>Pokedex</Text>
        </View>
    );
}
