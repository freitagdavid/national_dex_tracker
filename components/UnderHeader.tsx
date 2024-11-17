import {
    View,
    Text,
    type TamaguiComponent,
    type TamaguiElement,
    type ViewProps,
} from 'tamagui';
import { Menu } from '@tamagui/lucide-icons';
import { AppBarSelect } from './AppBarDropdown';
import { useGetVersionGroupsQuery } from 'services/pokemon';

export default function UnderHeader(props: ViewProps) {
    const { data, error, isLoading } = useGetVersionGroupsQuery();
    console.log(data);
    return <View {...props}>{data && <AppBarSelect items={data} />}</View>;
}
