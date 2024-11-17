import { H2, View, XStack, YStack } from 'tamagui';
import LeftHeader from './LeftHeader';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack/lib/typescript/src/types';
import RightHeader from './RightHeader';
import UnderHeader from './UnderHeader';

export default function Header({ options }: NativeStackHeaderProps) {
    return (
        <YStack justifyContent='center' paddingHorizontal='$3'>
            <XStack
                height='$4'
                alignItems='center'
                justifyContent='space-between'
            >
                <LeftHeader />
                <H2>{options.title}</H2>
                <RightHeader />
            </XStack>
            <UnderHeader />
        </YStack>
    );
}
