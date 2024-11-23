import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useGetAllPokemonQuery } from '@/services/pokemon';
import React from 'react';
import { FlatList } from 'react-native';

function renderItem({ item }) {
    return (
        <Card>
            <Heading>{item.name}</Heading>
        </Card>
    );
}

export default function Index() {
    const { data, error, isLoading } = useGetAllPokemonQuery();
    console.log(data);
    return (
        <Box className='bg-background-50 flex-1 items-center justify-center'>
            <Text>Home screen</Text>
            {isLoading && <Text>Loading...</Text>}
            {data && (
                <FlatList
                    scrollEnabled={true}
                    data={data.pokemon_v2_pokemon}
                    renderItem={renderItem}
                />
            )}
        </Box>
    );
}
