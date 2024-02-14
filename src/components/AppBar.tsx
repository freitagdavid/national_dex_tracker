"use client"

import { DropdownMenu, DropdownTrigger, Navbar, NavbarBrand, NavbarContent, NavbarItem, Dropdown, Button, DropdownItem, Progress } from "@nextui-org/react";
import { FaChevronDown } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGetAllTypesQuery } from "@/features/pokemon/GetAllTypes.generated";
import { useGetAllVersionGroupsQuery } from "@/features/pokemon/GetAllVersionGroups.generated";
import { useGetAllGenerationsQuery } from "@/features/pokemon/GetAllGenerations.generated";
import { useGetFilteredPokemonQuery } from "@/features/pokemon/GetFilteredPokemon.generated";
import { setGenerationId, setVersionGroupId } from "@/features/pokemon/userSlice";
// import { useAppSelector } from "store/hooks";

export const AppBar = () => {
    const { data: types, isLoading: typesLoading, isFetching: typesFetching } = useGetAllTypesQuery();
    const { data: generations, isLoading: generationsLoading, isFetching: generationsFetching } = useGetAllGenerationsQuery();
    const { data: versionGroups, isLoading: versionGroupsLoading, isFetching: versionGroupsFetching } = useGetAllVersionGroupsQuery();
    const dispatch = useAppDispatch();
    // const { data, isLoading, isFetching } = useAllPokemonSpeciesWithSpritesQuery();
    const { data: pokemon, isLoading: pokemonIsLoading, isFetching: pokemonIsFetching } = useGetFilteredPokemonQuery();
    const caughtTotal = useAppSelector((state) => state.caughtTotal);
    const [caughtPercent, setCaughtPercent] = useState(0);

    useEffect(() => {
        if (pokemon && !pokemonIsLoading && !pokemonIsFetching) {
            setCaughtPercent(caughtTotal.value / pokemon.pokemon_v2_pokemonspecies.length * 100);
        }
    }, [caughtPercent, caughtTotal.value, pokemon, pokemonIsFetching, pokemonIsLoading])

    return (

        <Navbar isBordered>
            <NavbarBrand>
                <p className="font-bold text-inherit">Pokedex</p>
            </NavbarBrand>
            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <Dropdown>
                    <NavbarItem>
                        <DropdownTrigger>
                            <Button
                                disableRipple
                                className="p-0 bg-transparent data-[hover=true]:bg-transparent"
                                radius="sm"
                                variant="light"
                                endContent={<FaChevronDown />}
                            >
                                Layout
                            </Button>
                        </DropdownTrigger>
                    </NavbarItem>
                    <DropdownMenu itemClasses={{ base: "gap-4" }}>
                        <DropdownItem>
                            <Link to="/">
                                Box
                            </Link>
                        </DropdownItem>
                        <DropdownItem>
                            <Link to="/list">
                                List
                            </Link>
                        </DropdownItem>
                        <DropdownItem>
                            Grid
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                {!typesLoading && !typesFetching && types &&
                    <Dropdown>
                        <NavbarItem>
                            <DropdownTrigger>
                                <Button
                                    disableRipple
                                    className="p-0 bg-transparent data-[hover=true]:bg-transparent"
                                    radius="sm"
                                    variant="light"
                                    endContent={<FaChevronDown />}
                                >
                                    Type
                                </Button>
                            </DropdownTrigger>
                        </NavbarItem>
                        <DropdownMenu itemClasses={{ base: "gap-4" }}>
                            {types?.pokemon_v2_type.map((type) => {
                                return <DropdownItem key={type.id}>{type.name}</DropdownItem>
                            })}
                        </DropdownMenu>
                    </Dropdown>
                }
                {!versionGroupsLoading && !versionGroupsFetching && versionGroups &&
                    <Dropdown>
                        <NavbarItem>
                            <DropdownTrigger>
                                <Button
                                    disableRipple
                                    className="p-0 bg-transparent data-[hover=true]:bg-transparent"
                                    radius="sm"
                                    variant="light"
                                    endContent={<FaChevronDown />}
                                >
                                    Game Version
                                </Button>
                            </DropdownTrigger>
                        </NavbarItem>
                        <DropdownMenu itemClasses={{ base: "gap-4" }}>
                            {versionGroups?.pokemon_v2_versiongroup.map((version) => {
                                return <DropdownItem key={version.id} onClick={() => dispatch(setVersionGroupId(version.id))}>{version.name}</DropdownItem>
                            })}
                        </DropdownMenu>
                    </Dropdown>
                }
                {!generationsLoading && !generationsFetching && generations &&
                    <Dropdown>
                        <NavbarItem>
                            <DropdownTrigger>
                                <Button
                                    disableRipple
                                    className="p-0 bg-transparent data-[hover=true]:bg-transparent"
                                    radius="sm"
                                    variant="light"
                                    endContent={<FaChevronDown />}
                                >
                                    Generation
                                </Button>
                            </DropdownTrigger>
                        </NavbarItem>
                        <DropdownMenu itemClasses={{ base: "gap-4" }}>
                            {generations?.pokemon_v2_generation.map((generation) => {
                                return <DropdownItem key={generation.id} onClick={() => dispatch(setGenerationId(generation.id))}>{generation.name}</DropdownItem>
                            })}
                        </DropdownMenu>
                    </Dropdown>
                }
            </NavbarContent>
            <Progress value={caughtPercent} className="w-full" aria-label="Percent caught" />
        </Navbar>
    )
};