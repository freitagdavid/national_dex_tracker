import { app } from '@/state';
import { Menubar, MenubarContent, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarTrigger } from './ui/menubar';
import { useSelector } from '@legendapp/state/react';
import { Pokemon_V2_Versionname } from '@/gql/graphql';

export const AppBar = () => {
  const layout = useSelector(() => app.state.ui.listLayout.get());
  const selectedRegion = useSelector(() => app.state.ui.selectedRegion.get());
  const selectedGame = useSelector(() => app.state.ui.selectedGame.get());
  const versionList = useSelector(() => app.state.query.versionRows.get());

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Layout</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value={layout}>
            <MenubarRadioItem onClick={() => app.state.ui.listLayout.set('box')} value={'box'}>
              Box
            </MenubarRadioItem>
            <MenubarRadioItem onClick={() => app.state.ui.listLayout.set('grid')} value={'grid'}>
              Grid
            </MenubarRadioItem>
            <MenubarRadioItem onClick={() => app.state.ui.listLayout.set('list')} value={'list'}>
              List
            </MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Region</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value={selectedRegion}>
            <MenubarRadioItem onClick={() => app.state.ui.selectedRegion.set('national')} value={'national'}>
              National
            </MenubarRadioItem>
            <MenubarRadioItem onClick={() => app.state.ui.selectedRegion.set('kanto')} value={'kanto'}>
              Kanto
            </MenubarRadioItem>
            <MenubarRadioItem onClick={() => app.state.ui.selectedRegion.set('johto')} value={'johto'}>
              Johto
            </MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Game Version</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value={selectedGame.toString()}>
            {(versionList ?? []).map((version: Pokemon_V2_Versionname) => (
              <MenubarRadioItem
                onClick={() => app.state.ui.selectedGame.set(version.version_id ?? 0)}
                value={version.version_id?.toString() ?? ''}
                key={version.id}
              >
                {version.name}
              </MenubarRadioItem>
            ))}
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
