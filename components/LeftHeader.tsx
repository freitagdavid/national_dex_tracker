import {
    View,
    Text,
    type TamaguiComponent,
    type TamaguiElement,
    type ViewProps,
} from 'tamagui';
import { Menu } from '@tamagui/lucide-icons';

export default function LeftHeader(props: ViewProps) {
    return (
        <View {...props}>
            <Menu />
        </View>
    );
}
