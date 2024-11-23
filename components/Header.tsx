// import { H2, View, XStack, YStack } from 'tamagui';
// import LeftHeader from './LeftHeader';
import React from 'react';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack/lib/typescript/src/types';
import { VStack } from './ui/vstack';
import { HStack } from './ui/hstack';
import { Heading } from './ui/heading';
import { Icon, MenuIcon } from './ui/icon';
import { View } from 'react-native';
// import RightHeader from './RightHeader';
// import UnderHeader from './UnderHeader';

export default function Header({ options }: NativeStackHeaderProps) {
    return (
        <VStack className='bg-background-100'>
            <HStack className={'justify-between items-center px-4 h-11'}>
                <Icon as={MenuIcon} />
                <Heading>{options.title}</Heading>
                <View />
            </HStack>
            {/* <UnderHeader /> */}
        </VStack>
    );
}
