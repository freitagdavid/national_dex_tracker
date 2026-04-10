import { app } from '@/state';
import { Menubar, MenubarContent, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarTrigger } from './ui/menubar';
import { useSelector } from '@legendapp/state/react';
import { RegionSelect } from './RegionSelect';
import { SelectionReconcile } from './SelectionReconcile';
import { VersionSelect } from './VersionSelect';

export const AppBar = () => {
  const layout = useSelector(() => app.state.ui.listLayout.get());

  return (
    <div className="flex flex-wrap items-center gap-2 px-2 py-1">
      <SelectionReconcile />
      <Menubar className="border-0 bg-transparent p-0 shadow-none">
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
      </Menubar>
      <VersionSelect />
      <RegionSelect />
    </div>
  );
};
