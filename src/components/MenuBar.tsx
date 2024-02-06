import { listTypeAtom, rawToProcessedVersionListAtom, selectedGameAtom, selectedRegionAtom } from "@/state/atoms";
import { Menubar, MenubarContent, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarTrigger } from "./ui/menubar";
import { useAtom } from "jotai";
import { Pokemon_V2_Versionname } from "@/gql/graphql";

export const AppBar = () => {
    const [layout, setLayout] = useAtom(listTypeAtom);
    const [selectedRegion, setSelectedRegion] = useAtom(selectedRegionAtom);
    const [selectedGame, setSelectedGame] = useAtom(selectedGameAtom);
    const versions = useAtom(rawToProcessedVersionListAtom);

    return (
        <Menubar>
            <MenubarMenu>
                <MenubarTrigger>Layout</MenubarTrigger>
                <MenubarContent>
                    <MenubarRadioGroup value={layout}>
                        <MenubarRadioItem onClick={() => setLayout('box')} value={'box'}>
                            Box
                        </MenubarRadioItem>
                        <MenubarRadioItem onClick={() => setLayout('grid')} value={'grid'}>
                            Grid
                        </MenubarRadioItem>
                        <MenubarRadioItem onClick={() => setLayout('list')} value={'list'}>
                            List
                        </MenubarRadioItem>
                    </MenubarRadioGroup>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Region</MenubarTrigger>
                <MenubarContent>
                    <MenubarRadioGroup value={selectedRegion}>
                        <MenubarRadioItem onClick={() => setSelectedRegion('national')} value={"national"}>
                            National
                        </MenubarRadioItem>
                        <MenubarRadioItem onClick={() => setSelectedRegion('kanto')} value={"kanto"}>
                            Kanto
                        </MenubarRadioItem>
                        <MenubarRadioItem onClick={() => setSelectedRegion('johto')} value={"johto"}>
                            Johto
                        </MenubarRadioItem>
                    </MenubarRadioGroup>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Game Version</MenubarTrigger>
                <MenubarContent>
                    <MenubarRadioGroup value={selectedGame.toString()}>
                        {
                            versions[0].map((version: Pokemon_V2_Versionname) => {
                                return (
                                    // <div>{JSON.stringify(version.name)}</div>
                                    <MenubarRadioItem onClick={() => setSelectedGame(version.version_id || 0)} value={version.version_id?.toString() || ""}>
                                        {version.name}
                                    </MenubarRadioItem>
                                )
                            })
                        }
                    </MenubarRadioGroup>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
};