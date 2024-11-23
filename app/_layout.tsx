import React from 'react';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '../global.css';
import { Slot, Stack } from 'expo-router';
import Header from '@/components/Header';
import { Provider } from 'react-redux';
import { store } from '@/store';

export default function RootLayout() {
    return (
        <Provider store={store}>
            <GluestackUIProvider mode='dark'>
                <Stack
                    screenOptions={{
                        header: (props) => <Header {...props} />,
                    }}
                >
                    <Stack.Screen name='index' options={{ title: 'Pokedex' }} />
                    <Stack.Screen name='about' options={{ title: 'About' }} />
                </Stack>
            </GluestackUIProvider>
        </Provider>
    );
}
