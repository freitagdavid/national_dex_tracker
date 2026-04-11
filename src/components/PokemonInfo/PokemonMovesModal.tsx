import { useSelector } from "@legendapp/state/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ScrollView } from "react-native";
import {
	Modal,
	ModalBackdrop,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
} from "@/components/ui/modal";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { POKEMON_SPECIES_MOVES_QUERY } from "@/components/PokemonInfo/detailQueries";
import type { PokemonSpeciesMovesQuery } from "@/gql/operation-types";
import { graphqlRequest } from "@/state/graphqlFetch";
import { app, setPokemonMovesModalOpen } from "@/state";

function displayMoveName(
	row: NonNullable<PokemonSpeciesMovesQuery["pokemon_v2_pokemonmove"]>[number],
) {
	return row.pokemon_v2_move?.pokemon_v2_movenames[0]?.name ?? "—";
}

function methodLabel(
	row: NonNullable<PokemonSpeciesMovesQuery["pokemon_v2_pokemonmove"]>[number],
): string {
	return (
		row.pokemon_v2_movelearnmethod?.name ??
		`method ${row.move_learn_method_id ?? "?"}`
	);
}

function PokemonMovesModalSkeleton() {
	return (
		<Box className="gap-6 pr-3" importantForAccessibility="no-hide-descendants">
			{Array.from({ length: 3 }, (_, g) => (
				<Box key={g}>
					<Skeleton className="mb-3 h-4 w-36" />
					<Box className="gap-2">
						{Array.from({ length: 8 }, (_, i) => (
							<Box
								key={i}
								className="flex-row justify-between gap-2 border-b border-border/30 py-1"
							>
								<Skeleton className="h-4 w-32 max-w-[55%]" />
								<Skeleton className="h-4 w-10 shrink-0" />
							</Box>
						))}
					</Box>
				</Box>
			))}
		</Box>
	);
}

export function PokemonMovesModal({
	pokemonId,
	versionGroupId,
}: {
	pokemonId: number | null;
	versionGroupId: number | undefined;
}) {
	const movesOpen = useSelector(() => app.state.infoModal.movesOpen.get());

	const movesQuery = useQuery({
		queryKey: ["pokemonSpeciesMoves", pokemonId, versionGroupId],
		queryFn: () => {
			if (pokemonId == null || versionGroupId == null) {
				throw new Error("Missing move query parameters");
			}
			return graphqlRequest<PokemonSpeciesMovesQuery>(
				POKEMON_SPECIES_MOVES_QUERY,
				{
					pokemonId,
					versionGroupId,
				},
			);
		},
		enabled: movesOpen && pokemonId != null && versionGroupId != null,
		staleTime: 60 * 60 * 1000,
	});

	const rows = movesQuery.data?.pokemon_v2_pokemonmove ?? [];

	const grouped = useMemo(() => {
		const map = new Map<string, typeof rows>();
		for (const r of rows) {
			const k = methodLabel(r);
			const cur = map.get(k) ?? [];
			cur.push(r);
			map.set(k, cur);
		}
		return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
	}, [rows]);

	return (
		<Modal
			isOpen={movesOpen}
			onClose={() => setPokemonMovesModalOpen(false)}
			size="lg"
			useRNModal
		>
			<ModalBackdrop />
			<ModalContent className="max-h-[85vh] max-w-lg gap-3 border-0 p-0">
				<ModalHeader className="flex-col gap-1 px-6 pt-6 pr-14">
					<ModalCloseButton className="absolute right-3 top-3" />
					<Heading size="lg">Moves in this version group</Heading>
					<Text className="text-left text-sm text-muted-foreground">
						Learnset for the selected game&apos;s version group (via PokéAPI).
					</Text>
				</ModalHeader>
				<ScrollView
					className="min-h-[280px] max-h-[60vh] px-6 pb-6"
					nestedScrollEnabled
				>
					{movesQuery.isLoading && <PokemonMovesModalSkeleton />}
					{!movesQuery.isLoading && movesQuery.isError && (
						<Text className="text-sm text-destructive">
							{(movesQuery.error as Error)?.message ?? "Failed to load moves."}
						</Text>
					)}
					{!movesQuery.isLoading &&
						movesQuery.isSuccess &&
						grouped.length === 0 && (
							<Text className="text-sm text-muted-foreground">
								No moves listed for this version group.
							</Text>
						)}
					{!movesQuery.isLoading && grouped.length > 0 && (
						<Box className="flex-col gap-4 pr-3">
							{grouped.map(([method, list]) => (
								<Box key={method}>
									<Text className="mb-2 text-sm font-semibold capitalize">
										{method.replace(/-/g, " ")}
									</Text>
									<Box className="gap-1.5 text-sm">
										{list.map((r) => (
											<Box
												key={r.id}
												className="flex-row justify-between gap-2 border-b border-border/40 py-1"
											>
												<Text className="font-medium text-foreground">
													{displayMoveName(r)}
												</Text>
												{r.move_learn_method_id === 1 &&
													r.level != null &&
													r.level > 0 && (
														<Text className="shrink-0 text-muted-foreground">
															Lv. {r.level}
														</Text>
													)}
												{r.move_learn_method_id === 1 &&
													(r.level === 0 || r.level == null) && (
														<Text className="shrink-0 text-muted-foreground">
															Evolve / start
														</Text>
													)}
											</Box>
										))}
									</Box>
								</Box>
							))}
						</Box>
					)}
				</ScrollView>
			</ModalContent>
		</Modal>
	);
}
