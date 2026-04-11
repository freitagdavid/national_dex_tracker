import { useSelector } from "@legendapp/state/react";
import { app } from "@/state";
import { GenerationSelect } from "./GenerationSelect";
import { RegionSelect } from "./RegionSelect";
import { SelectionReconcile } from "./SelectionReconcile";
import { TypeSelect } from "./TypeSelect";
import { Card, CardContent } from "./ui/card";
import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarMenu,
	MenubarRadioGroup,
	MenubarRadioItem,
	MenubarTrigger,
} from "./ui/menubar";
import { VersionSelect } from "./VersionSelect";

export const AppBar = () => {
	const layout = useSelector(() => app.state.ui.listLayout.get());
	const favoriteFilter = useSelector(() => app.state.ui.favoriteFilter.get());
	const includeCatchableAltForms = useSelector(() =>
		app.state.ui.includeCatchableNonDefaultForms.get(),
	);
	const catchableIdsReady = useSelector(
		() => app.state.query.catchableNonDefaultFormPokemonIds.get() != null,
	);

	return (
		<Card className="w-full rounded-none border-x-0 border-t border-b-0 shadow-none">
			<CardContent className="flex flex-wrap items-center gap-2 px-2 py-1">
				<SelectionReconcile />
				<Menubar className="border-0 bg-transparent p-0 shadow-none">
					<MenubarMenu>
						<MenubarTrigger>Layout</MenubarTrigger>
						<MenubarContent>
							<MenubarRadioGroup value={layout}>
								<MenubarRadioItem
									onClick={() => app.state.ui.listLayout.set("box")}
									value={"box"}
								>
									Box
								</MenubarRadioItem>
								<MenubarRadioItem
									onClick={() => app.state.ui.listLayout.set("grid")}
									value={"grid"}
								>
									Grid
								</MenubarRadioItem>
								<MenubarRadioItem
									onClick={() => app.state.ui.listLayout.set("list")}
									value={"list"}
								>
									List
								</MenubarRadioItem>
							</MenubarRadioGroup>
						</MenubarContent>
					</MenubarMenu>
					<MenubarMenu>
						<MenubarTrigger>Forms</MenubarTrigger>
						<MenubarContent>
							<MenubarCheckboxItem
								checked={includeCatchableAltForms}
								disabled={!catchableIdsReady}
								onCheckedChange={(v) =>
									app.state.ui.includeCatchableNonDefaultForms.set(v === true)
								}
							>
								Catchable alternate forms
							</MenubarCheckboxItem>
						</MenubarContent>
					</MenubarMenu>
					<MenubarMenu>
						<MenubarTrigger>Favorites</MenubarTrigger>
						<MenubarContent>
							<MenubarRadioGroup value={favoriteFilter}>
								<MenubarRadioItem
									onClick={() => app.state.ui.favoriteFilter.set("all")}
									value="all"
								>
									All Pokémon
								</MenubarRadioItem>
								<MenubarRadioItem
									onClick={() => app.state.ui.favoriteFilter.set("favorites")}
									value="favorites"
								>
									Favorites only
								</MenubarRadioItem>
								<MenubarRadioItem
									onClick={() => app.state.ui.favoriteFilter.set("unfavorites")}
									value="unfavorites"
								>
									Not favorited
								</MenubarRadioItem>
							</MenubarRadioGroup>
						</MenubarContent>
					</MenubarMenu>
				</Menubar>
				<VersionSelect />
				<RegionSelect />
				<TypeSelect />
				<GenerationSelect />
			</CardContent>
		</Card>
	);
};
