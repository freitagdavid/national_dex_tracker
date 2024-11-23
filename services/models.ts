import type { Pokemon_V2_Type } from 'api';
import type {
    GetPokemonResponse,
    GetTypesResponse,
    GetVersionGroupsResponse,
    Pokemon_V2_Versiongroup,
    Pokemon_V2_Versionnames,
} from './pokemon';
import type { Pokemon_V2_Version } from '@/api';

export interface TransformVersionGroupsReturn {
    name: string;
    groupId: number;
    readableName: string;
}

export function transformVersionGroups(
    data: GetVersionGroupsResponse,
): TransformVersionGroupsReturn[] {
    return data.pokemon_v2_versiongroup.map((item: Pokemon_V2_Versiongroup) => {
        return {
            name: item.name,
            groupId: item.id,
            readableName: item.pokemon_v2_versionnames
                .map((name: Pokemon_V2_Versionnames) => name.name)
                .join(' / '),
        };
    });
}

export function transformTypes(data: GetTypesResponse) {
    return data.pokemon_v2_type.map((item: Pokemon_V2_Type) => {
        return {
            name: item.name,
            typeId: item.id,
        };
    });
}

export function transformPokemon(data: GetPokemonResponse) {
    return data.pokemon_v2_pokemonspecies.map((item) => {
        return {
            name: item.name,
        };
    });
}
