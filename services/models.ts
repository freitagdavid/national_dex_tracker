import type { Pokemon_V2_Type } from 'api';
import type { GetTypesResponse, GetVersionGroupsResponse } from './pokemon';

export function transformVersionGroups(data: any) {
    return data.map((item: Pokemon_V2_Versiongroup) => {
        return {
            name: item.name,
            groupId: item.id,
            readableName: item.pokemon_v2_versions
                .map((item) => item.pokemon_v2_versionnames[0].name)
                .join(' / '),
        };
    });
}

export function transformTypes(data: Pokemon_V2_Type[]) {
    return data.map((item: Pokemon_V2_Type) => {
        return {
            name: item.name,
            typeId: item.id,
        };
    });
}
