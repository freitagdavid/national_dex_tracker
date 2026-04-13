import { Image } from 'expo-image';
import { Platform, Pressable, ScrollView } from 'react-native';
import {
  Modal,
  ModalBackdrop,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
} from '@/components/ui/modal';
import { Button, ButtonText } from '@/components/ui/button';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { CryPlayer } from '@/components/CryPlayer';
import {
  app,
  closePokemonInfo,
  openPokemonInfo,
  type Pokemon,
  setPokemonMovesModalOpen,
} from '@/state';
import { useSelector } from '@legendapp/state/react';
import { useQuery } from '@tanstack/react-query';
import { graphqlRequest } from '@/state/graphqlFetch';
import type { PokemonSpeciesDetailQuery, PokemonSpeciesEncountersQuery } from '@/gql/operation-types';
import {
  POKEMON_SPECIES_DETAIL_QUERY,
  POKEMON_SPECIES_ENCOUNTERS_QUERY,
} from '@/components/PokemonInfo/detailQueries';
import { usePokemonListImageTheme } from '@/hooks/usePokemonListImageTheme';
import { useModalPokemonSpriteUrl } from '@/hooks/useModalPokemonSpriteUrl';
import { InfoModalSpriteVariations } from '@/components/PokemonInfo/InfoModalSpriteVariations';
import { InfoModalVersionSelect } from '@/components/PokemonInfo/InfoModalVersionSelect';
import { PokemonInfoModalBodySkeleton } from '@/components/PokemonInfo/PokemonInfoModalSkeleton';
import { PokemonMovesModal } from '@/components/PokemonInfo/PokemonMovesModal';
import {
  aggregateDefaultPokemonHeldItems,
  aggregatePossibleAbilities,
  formatVarietyLabel,
  groupEncountersForDisplay,
  speciesHasMultipleForms,
} from '@/components/PokemonInfo/infoModalAggregations';
import {
  buildMainSeriesDexTableRows,
  pickModalDexDisplay,
} from '@/components/PokemonInfo/infoModalDex';
import { fetchSpeciesFormDescriptionsEn } from '@/components/PokemonInfo/infoModalSpeciesRest';
import {
  displayHeightDm,
  displayWeightHg,
  effectiveCryGameGenerationId,
  effectiveFlavorVersionId,
  effectiveVersionGroupIdForMoves,
  flavorRowForVersion,
  formatFlavorText,
  genderRateLabel,
  pickPokemonCryUrl,
} from '@/components/PokemonInfo/infoModalUtils';
import { formatDexListLabel } from '@/lib/dexDisplayNumber';
import { useMemo } from 'react';
import {
  getOfficialArtworkShinyUrl,
  getOfficialArtworkUrl,
  listSpriteVariationsForVersion,
} from '@/lib/pokeSpriteUrl';

function displaySpeciesName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function pickPokemonFromList(
  list: Pokemon[],
  speciesId: number | null,
  listRowPokemonId: number | null,
): Pokemon | undefined {
  if (speciesId == null) return undefined;
  if (listRowPokemonId != null) {
    const hit = list.find((p) => p.id === listRowPokemonId && p.speciesId === speciesId);
    if (hit) return hit;
  }
  return (
    list.find((p) => p.speciesId === speciesId && p.id === speciesId) ?? list.find((p) => p.speciesId === speciesId)
  );
}

export function PokemonInfoModal() {
  const open = useSelector(() => app.state.infoModal.open.get());
  const speciesId = useSelector(() => app.state.infoModal.speciesId.get());
  const listContextPokemonId = useSelector(() => app.state.infoModal.listContextPokemonId.get());
  const selectedVersionId = useSelector(() => app.state.infoModal.selectedVersionId.get());
  const processedList = useSelector(() => app.processedPokemonList.get() ?? []);

  const listPoke = useMemo(
    () => pickPokemonFromList(processedList, speciesId, listContextPokemonId),
    [processedList, speciesId, listContextPokemonId],
  );

  const detailQuery = useQuery({
    queryKey: ['pokemonSpeciesDetail', speciesId],
    queryFn: () => {
      if (speciesId == null) throw new Error('Missing species id');
      return graphqlRequest<PokemonSpeciesDetailQuery>(POKEMON_SPECIES_DETAIL_QUERY, {
        id: speciesId,
      });
    },
    enabled: open && speciesId != null,
    staleTime: 60 * 60 * 1000,
  });

  const speciesRestQuery = useQuery({
    queryKey: ['pokemonSpeciesFormDescriptions', speciesId],
    queryFn: () => {
      if (speciesId == null) throw new Error('Missing species id');
      return fetchSpeciesFormDescriptionsEn(speciesId);
    },
    enabled: open && speciesId != null,
    staleTime: 60 * 60 * 1000,
  });

  const speciesRow = detailQuery.data?.pokemon_v2_pokemonspecies?.[0];
  const defaultMon = speciesRow?.default_pokemon?.[0];
  const varieties = speciesRow?.pokemon_varieties ?? [];
  const flavorRows = speciesRow?.pokemon_v2_pokemonspeciesflavortexts ?? [];

  const pokeForSprite = useMemo((): Pokemon | undefined => {
    if (listPoke) return listPoke;
    if (!speciesRow || !defaultMon) return undefined;
    const spritesRoot = defaultMon.pokemon_v2_pokemonsprites?.[0]?.sprites;
    const official = getOfficialArtworkUrl(spritesRoot);
    if (!official) return undefined;
    const genId = speciesRow.pokemon_v2_generation?.id ?? 1;
    return {
      speciesId: speciesRow.id,
      id: speciesRow.id,
      name: speciesRow.name,
      displayName: displaySpeciesName(speciesRow.name),
      spritesJson: spritesRoot,
      sprites: {
        front_default: official,
        front_shiny: getOfficialArtworkShinyUrl(spritesRoot) ?? official,
      },
      types: defaultMon.pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type?.name ?? undefined),
      dexRegions: [],
      dexNumberByRegion: {},
      versionGroupIds: [],
      generationId: genId,
    };
  }, [listPoke, speciesRow, defaultMon]);

  /** Match list/grid default: version `0` → official artwork (national / “all versions” sprites). */
  const modalSpriteVersionId = useMemo(() => {
    if (selectedVersionId === 0) return 0;
    return selectedVersionId;
  }, [selectedVersionId]);

  const { url: spriteUrl, colorCacheKey: spriteColorKey } = useModalPokemonSpriteUrl(
    pokeForSprite,
    modalSpriteVersionId,
  );
  const primaryType = pokeForSprite?.types.find(Boolean);
  const { theme } = usePokemonListImageTheme(spriteUrl, primaryType, spriteColorKey);

  const cryPokemonId = defaultMon?.id;

  const cryQuery = useQuery({
    queryKey: ['pokemonCry', cryPokemonId],
    queryFn: async () => {
      if (cryPokemonId == null) throw new Error('Missing Pokémon id for cry');
      const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${cryPokemonId}/`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = (await r.json()) as { cries?: { latest?: string; legacy?: string } };
      return {
        latest: j.cries?.latest ?? null,
        legacy: j.cries?.legacy ?? null,
      };
    },
    enabled: open && cryPokemonId != null,
    staleTime: Infinity,
  });

  const versionRows = useSelector(() => app.state.query.versionRows.get());
  const gqlRegionRows = useSelector(() => app.state.query.regionRows.get());

  const cryGameGen = useMemo(
    () => effectiveCryGameGenerationId(selectedVersionId, flavorRows, versionRows),
    [selectedVersionId, flavorRows, versionRows],
  );

  const cryAudioSrc = useMemo(
    () => pickPokemonCryUrl(cryQuery.data, cryGameGen),
    [cryQuery.data, cryGameGen],
  );

  const spritesRootDefault = defaultMon?.pokemon_v2_pokemonsprites?.[0]?.sprites;
  const spriteVariationEntries = useMemo(
    () =>
      listSpriteVariationsForVersion(spritesRootDefault, modalSpriteVersionId, versionRows),
    [spritesRootDefault, modalSpriteVersionId, versionRows],
  );

  const effFlavorVid = effectiveFlavorVersionId(selectedVersionId, flavorRows);

  const varietyIds = useMemo(
    () => varieties.map((v) => v.id),
    [varieties],
  );

  const varietyIdToLabel = useMemo(() => {
    const m = new Map<number, string>();
    if (!speciesRow) return m;
    for (const v of speciesRow.pokemon_varieties ?? []) {
      m.set(v.id, formatVarietyLabel(v, speciesRow.name));
    }
    return m;
  }, [speciesRow]);

  const possibleAbilities = useMemo(() => aggregatePossibleAbilities(varieties), [varieties]);

  const hasAltForms = useMemo(() => speciesHasMultipleForms(varieties), [varieties]);

  const encounterGameLabel = useMemo(() => {
    if (effFlavorVid == null) return null;
    const r = (versionRows ?? []).find((x) => x.version_id === effFlavorVid);
    return r?.name ?? `Version ${effFlavorVid}`;
  }, [effFlavorVid, versionRows]);

  const encQuery = useQuery({
    queryKey: ['pokemonEncounters', varietyIds, effFlavorVid],
    queryFn: () => {
      if (effFlavorVid == null) throw new Error('Missing version for encounters');
      return graphqlRequest<PokemonSpeciesEncountersQuery>(POKEMON_SPECIES_ENCOUNTERS_QUERY, {
        pokemonIds: varietyIds,
        versionId: effFlavorVid,
      });
    },
    enabled:
      open &&
      detailQuery.isSuccess &&
      speciesRow != null &&
      varietyIds.length > 0 &&
      effFlavorVid != null,
    staleTime: 60 * 60 * 1000,
  });

  const encounterGroups = useMemo(
    () => groupEncountersForDisplay(encQuery.data?.pokemon_v2_encounter ?? [], varietyIdToLabel),
    [encQuery.data?.pokemon_v2_encounter, varietyIdToLabel],
  );
  const flavorPick = flavorRowForVersion(flavorRows, effFlavorVid);
  const flavorText = flavorPick ? formatFlavorText(flavorPick.flavor_text) : null;
  const flavorGameLabel =
    effFlavorVid != null
      ? ((versionRows ?? []).find((x) => x.version_id === effFlavorVid)?.name ??
        `Version ${effFlavorVid}`)
      : null;

  const versionGroupForMoves = effectiveVersionGroupIdForMoves(
    selectedVersionId,
    flavorRows,
    versionRows,
  );

  const speciesDisplayName =
    speciesRow?.pokemon_v2_pokemonspeciesnames[0]?.name ??
    (speciesRow?.name ? displaySpeciesName(speciesRow.name) : listPoke?.name ? displaySpeciesName(listPoke.name) : 'Pokémon');

  const genus = speciesRow?.pokemon_v2_pokemonspeciesnames[0]?.genus;

  const dexTableRows = useMemo(
    () => buildMainSeriesDexTableRows(speciesRow?.pokemon_v2_pokemondexnumbers, gqlRegionRows),
    [speciesRow?.pokemon_v2_pokemondexnumbers, gqlRegionRows],
  );

  const modalDex = useMemo(
    () =>
      pickModalDexDisplay(
        speciesRow?.pokemon_v2_pokemondexnumbers,
        versionRows,
        gqlRegionRows,
        selectedVersionId,
        speciesRow?.id ?? speciesId ?? 0,
      ),
    [
      speciesRow?.pokemon_v2_pokemondexnumbers,
      speciesRow?.id,
      speciesId,
      versionRows,
      gqlRegionRows,
      selectedVersionId,
    ],
  );

  const showNationalDexTable = selectedVersionId === 0 && dexTableRows.length > 0;

  const heldItemsAggregated = useMemo(
    () => aggregateDefaultPokemonHeldItems(defaultMon?.pokemon_v2_pokemonitems),
    [defaultMon?.pokemon_v2_pokemonitems],
  );

  const speciesNoteParagraphs = useMemo(() => {
    const fromGql = (speciesRow?.pokemon_v2_pokemonspeciesdescriptions ?? [])
      .map((d) => formatFlavorText(d.description))
      .filter(Boolean);
    const fromRest = speciesRestQuery.data ?? [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of [...fromGql, ...fromRest]) {
      if (seen.has(p)) continue;
      seen.add(p);
      out.push(p);
    }
    return out;
  }, [speciesRow?.pokemon_v2_pokemonspeciesdescriptions, speciesRestQuery.data]);

  const speciesClassificationTags = useMemo(() => {
    if (!speciesRow) return [];
    const tags: string[] = [];
    if (speciesRow.is_baby) tags.push('Baby');
    if (speciesRow.is_legendary) tags.push('Legendary');
    if (speciesRow.is_mythical) tags.push('Mythical');
    if (speciesRow.forms_switchable) tags.push('Multiform');
    return tags;
  }, [speciesRow]);

  const evolvesFrom = speciesRow?.evolves_from;

  return (
    <>
      <Modal
        isOpen={open}
        onClose={closePokemonInfo}
        size="lg"
        useRNModal
      >
        <ModalBackdrop />
        <ModalContent
          className="max-h-[92vh] max-w-xl gap-0 border-0 p-0 sm:max-w-xl"
          style={{
            backgroundColor: theme.cardBg,
          }}
        >
          <ModalHeader
            className="z-20 flex-col gap-2 border-b px-6 py-4 pr-14"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: `${theme.text}22`,
            }}
          >
            <ModalCloseButton className="absolute right-3 top-3 z-30" />
            <Box className="flex w-full flex-row flex-wrap items-start justify-between gap-3">
              <Box className="min-w-0 flex-1 gap-1">
                <Box className="flex w-full flex-row flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <Heading
                    size="xl"
                    className="font-bold tracking-tight text-foreground"
                    style={{ color: theme.text }}
                  >
                    {speciesDisplayName}
                  </Heading>
                  {detailQuery.isLoading && speciesId != null ? (
                    <Text
                      className="font-mono text-sm font-normal tabular-nums opacity-75"
                      style={{ color: theme.text }}
                    >
                      {formatDexListLabel(speciesId)}
                    </Text>
                  ) : speciesRow ? (
                    <Box className="flex flex-col items-end gap-0.5 text-right font-mono text-sm font-normal tabular-nums opacity-75">
                      {selectedVersionId === 0 ? (
                        <Text style={{ color: theme.text }}>
                          {formatDexListLabel(modalDex.national)}
                        </Text>
                      ) : modalDex.local != null && modalDex.regionLabel != null ? (
                        <>
                          <Text style={{ color: theme.text }}>
                            {modalDex.regionLabel}{" "}
                            {formatDexListLabel(modalDex.local)}
                          </Text>
                          <Text
                            className="text-xs opacity-70"
                            style={{ color: theme.text }}
                          >
                            National {formatDexListLabel(modalDex.national)}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text
                            className="max-w-40 text-xs leading-snug opacity-90"
                            style={{ color: theme.text }}
                          >
                            No regional # for{" "}
                            {modalDex.versionLabel ?? `version ${selectedVersionId}`}
                          </Text>
                          <Text
                            className="text-xs opacity-70"
                            style={{ color: theme.text }}
                          >
                            National {formatDexListLabel(modalDex.national)}
                          </Text>
                        </>
                      )}
                    </Box>
                  ) : null}
                </Box>
                <Box className="min-h-5 gap-2">
                  {detailQuery.isLoading ? (
                    <Skeleton className="mt-0.5 h-4 w-40 max-w-full bg-black/20 dark:bg-white/25" />
                  ) : genus ? (
                    <Text className="text-sm opacity-90" style={{ color: theme.text }}>
                      {genus}
                    </Text>
                  ) : null}
                  {!detailQuery.isLoading && speciesClassificationTags.length > 0 && (
                    <Box className="flex flex-row flex-wrap gap-1.5">
                      {speciesClassificationTags.map((tag) => (
                        <Text
                          key={tag}
                          className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                          style={{
                            borderColor: theme.pillBorder,
                            backgroundColor: theme.pillBg,
                            color: theme.text,
                          }}
                        >
                          {tag}
                        </Text>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
              <Box className="w-full shrink-0 gap-2 sm:w-56">
                <InfoModalVersionSelect />
              </Box>
            </Box>
          </ModalHeader>

          <ScrollView
            className={
              Platform.OS === 'web'
                ? 'max-h-[70vh] pokemon-info-modal-scroll'
                : 'max-h-[70vh]'
            }
            contentContainerStyle={{ gap: 16, paddingHorizontal: 24, paddingVertical: 16 }}
            style={{
              backgroundColor: theme.cardBg,
              ...(Platform.OS === "web"
                ? ({
                    ["--pokemon-info-scroll-track" as string]: theme.cardBg,
                    ["--pokemon-info-scroll-thumb" as string]: theme.pillBorder,
                    ["--pokemon-info-scrollbar-pair" as string]: `${theme.pillBorder} ${theme.cardBg}`,
                  } as Record<string, string>)
                : {}),
            }}
          >
          <Box className="relative z-0 flex-col gap-4">
            {detailQuery.isLoading && <PokemonInfoModalBodySkeleton pillBg={theme.pillBg} />}

            {detailQuery.isError && (
              <Text className="text-sm opacity-90" style={{ color: theme.text }}>
                {(detailQuery.error as Error)?.message ?? "Could not load details."}
              </Text>
            )}

            {detailQuery.isSuccess && speciesRow && (
              <>
                <Box className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                  <Box
                    className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: theme.artBlob }}
                  >
                    <Image
                      source={{ uri: spriteUrl }}
                      style={{ width: 128, height: 128 }}
                      contentFit="contain"
                    />
                  </Box>
                  <Box className="min-w-0 flex-1 gap-2">
                    {defaultMon && (
                      <Box className="flex flex-row flex-wrap gap-2">
                        {defaultMon.pokemon_v2_pokemontypes.map((t) => {
                          const name = t.pokemon_v2_type?.name;
                          if (!name) return null;
                          return (
                            <Text
                              key={`${t.slot}-${name}`}
                              className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                              style={{
                                backgroundColor: theme.pillBg,
                                borderColor: theme.pillBorder,
                                color: theme.text,
                              }}
                            >
                              {name}
                            </Text>
                          );
                        })}
                      </Box>
                    )}
                    <Box className="gap-1 text-sm opacity-95">
                      {(
                        [
                          ["Height", displayHeightDm(defaultMon?.height)],
                          ["Weight", displayWeightHg(defaultMon?.weight)],
                          ["Capture rate", String(speciesRow.capture_rate ?? "—")],
                          ["Base happiness", String(speciesRow.base_happiness ?? "—")],
                          ["Hatch cycles", String(speciesRow.hatch_counter ?? "—")],
                          ["Gender", genderRateLabel(speciesRow.gender_rate)],
                          [
                            "Growth",
                            speciesRow.pokemon_v2_growthrate?.name ?? "—",
                          ],
                          [
                            "Generation",
                            speciesRow.pokemon_v2_generation?.pokemon_v2_generationnames[0]
                              ?.name ??
                              (speciesRow.pokemon_v2_generation?.id != null
                                ? String(speciesRow.pokemon_v2_generation.id)
                                : "—"),
                          ],
                        ] as const
                      ).map(([k, v]) => (
                        <Box
                          key={k}
                          className="w-full flex-row justify-between gap-3 py-0.5"
                        >
                          <Text className="opacity-75">{k}</Text>
                          <Text className="max-w-[60%] text-right capitalize">
                            {v}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>

                <InfoModalSpriteVariations
                  entries={spriteVariationEntries}
                  artBlob={theme.artBlob}
                  themeText={theme.text}
                />

                <Box
                  className="gap-2 rounded-xl px-3 py-3"
                  style={{ backgroundColor: theme.pillBg }}
                >
                  <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                    Pokédex
                    {flavorGameLabel ? (
                      <Text className="ml-2 font-normal opacity-80">
                        {" "}
                        ({flavorGameLabel})
                      </Text>
                    ) : null}
                  </Text>
                  {flavorText ? (
                    <Text
                      className="text-sm leading-relaxed opacity-95"
                      style={{ color: theme.text }}
                    >
                      {flavorText}
                    </Text>
                  ) : (
                    <Text className="text-sm opacity-80" style={{ color: theme.text }}>
                      No English Pokédex entry for this game selection.
                    </Text>
                  )}
                </Box>

                <Box className="gap-2">
                  <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                    Cry
                  </Text>
                  <Box className="min-h-9">
                    {cryQuery.isLoading && (
                      <Skeleton className="h-9 w-full max-w-md rounded-md bg-black/20 dark:bg-white/25" />
                    )}
                    {cryQuery.isError && (
                      <Text className="text-sm opacity-80" style={{ color: theme.text }}>
                        {(cryQuery.error as Error)?.message ?? "Could not load cry."}
                      </Text>
                    )}
                    {cryQuery.isSuccess && cryAudioSrc ? (
                      <CryPlayer
                        key={`${cryGameGen ?? "na"}|${cryAudioSrc}`}
                        src={cryAudioSrc}
                      />
                    ) : null}
                    {cryQuery.isSuccess && !cryAudioSrc && !cryQuery.isLoading ? (
                      <Text className="text-sm opacity-80" style={{ color: theme.text }}>
                        No cry audio for this Pokémon.
                      </Text>
                    ) : null}
                  </Box>
                </Box>

                <Box className="gap-2">
                  <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                    Habitat & appearance
                  </Text>
                  <Box className="gap-1 text-sm opacity-95">
                    {(
                      [
                        ["Color", speciesRow.pokemon_v2_pokemoncolor?.name ?? "—"],
                        ["Habitat", speciesRow.pokemon_v2_pokemonhabitat?.name ?? "—"],
                        ["Shape", speciesRow.pokemon_v2_pokemonshape?.name ?? "—"],
                        [
                          "Gender sprites",
                          speciesRow.has_gender_differences === true
                            ? "Different male / female artwork"
                            : "—",
                        ],
                      ] as const
                    ).map(([k, v]) => (
                      <Box
                        key={k}
                        className="w-full flex-row justify-between gap-3 py-0.5"
                      >
                        <Text className="opacity-75">{k}</Text>
                        <Text className="max-w-[60%] text-right capitalize">{v}</Text>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box className="gap-2">
                  <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                    Egg groups
                  </Text>
                  <Text
                    className="text-sm capitalize opacity-95"
                    style={{ color: theme.text }}
                  >
                    {speciesRow.pokemon_v2_pokemonegggroups
                      .map((g) => g.pokemon_v2_egggroup?.name)
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </Text>
                </Box>

                {((selectedVersionId === 0 &&
                  (dexTableRows.length > 0 || speciesRow.order != null)) ||
                  selectedVersionId !== 0) && (
                  <Box className="gap-2">
                    <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                      Pokédex numbers
                    </Text>
                    {selectedVersionId === 0 ? (
                      <>
                        {showNationalDexTable && (
                          <>
                            <Text className="text-xs opacity-75" style={{ color: theme.text }}>
                              Main-series Pokédex listings (PokéAPI). The national dex row is
                              highlighted.
                            </Text>
                            <Box
                              className="rounded-lg border p-2 text-sm"
                              style={{ borderColor: theme.pillBorder }}
                            >
                              <Box className="mb-1 flex-row border-b pb-1">
                                <Text
                                  className="flex-1 text-xs font-medium uppercase opacity-75"
                                  style={{ color: theme.text }}
                                >
                                  Region
                                </Text>
                                <Text
                                  className="w-24 text-xs font-medium uppercase opacity-75"
                                  style={{ color: theme.text }}
                                >
                                  Dex
                                </Text>
                                <Text
                                  className="w-10 text-right text-xs font-medium uppercase opacity-75"
                                  style={{ color: theme.text }}
                                >
                                  #
                                </Text>
                              </Box>
                              {dexTableRows.map((row) => {
                                const highlight = row.dexName === "national";
                                return (
                                  <Box
                                    key={row.key}
                                    className="flex-row border-b border-border/20 py-1.5"
                                    style={
                                      highlight
                                        ? { backgroundColor: theme.pillBg }
                                        : undefined
                                    }
                                  >
                                    <Text className="flex-1 text-sm" style={{ color: theme.text }}>
                                      {row.regionLabel}
                                    </Text>
                                    <Text
                                      className="w-24 font-mono text-xs opacity-90"
                                      style={{ color: theme.text }}
                                    >
                                      {row.dexName}
                                    </Text>
                                    <Text
                                      className="w-10 text-right text-sm tabular-nums"
                                      style={{ color: theme.text }}
                                    >
                                      {row.num}
                                    </Text>
                                  </Box>
                                );
                              })}
                            </Box>
                          </>
                        )}
                        {speciesRow.order != null && (
                          <Text className="text-xs opacity-75" style={{ color: theme.text }}>
                            Internal Pokédex sort order: {speciesRow.order}
                          </Text>
                        )}
                      </>
                    ) : (
                      <>
                        <Text className="text-sm opacity-95" style={{ color: theme.text }}>
                          {modalDex.local != null && modalDex.regionLabel != null ? (
                            <Text className="font-mono tabular-nums">
                              {modalDex.regionLabel}{" "}
                              {formatDexListLabel(modalDex.local)}
                            </Text>
                          ) : (
                            <Text className="opacity-90">
                              No main-series regional number for this game&apos;s region in
                              PokéAPI
                              {modalDex.versionLabel != null
                                ? ` (${modalDex.versionLabel})`
                                : ""}
                              .
                            </Text>
                          )}
                        </Text>
                        <Text className="text-xs opacity-75" style={{ color: theme.text }}>
                          Local number uses only the game selected in this modal (
                          {modalDex.versionLabel ?? `version ${selectedVersionId}`}), not the
                          list Region or Game filters.
                        </Text>
                        {speciesRow.order != null && (
                          <Text className="text-xs opacity-75" style={{ color: theme.text }}>
                            Internal Pokédex sort order: {speciesRow.order}
                          </Text>
                        )}
                      </>
                    )}
                  </Box>
                )}

                {(speciesRestQuery.isLoading ||
                  speciesRestQuery.isError ||
                  speciesNoteParagraphs.length > 0) && (
                  <Box className="gap-2">
                    <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                      Species & form notes
                    </Text>
                    {speciesRestQuery.isLoading && speciesNoteParagraphs.length === 0 && (
                      <Skeleton className="h-16 w-full max-w-md rounded-md bg-black/20 dark:bg-white/25" />
                    )}
                    {speciesRestQuery.isError && (
                      <Text className="text-sm opacity-80" style={{ color: theme.text }}>
                        {(speciesRestQuery.error as Error)?.message ??
                          "Could not load form notes."}
                      </Text>
                    )}
                    {speciesNoteParagraphs.map((para, i) => (
                      <Text
                        key={`${i}-${para.slice(0, 48)}`}
                        className="text-sm leading-relaxed opacity-95"
                        style={{ color: theme.text }}
                      >
                        {para}
                      </Text>
                    ))}
                  </Box>
                )}

                {heldItemsAggregated.length > 0 && (
                  <Box className="gap-2">
                    <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                      Wild held items
                    </Text>
                    <Text className="text-xs opacity-75" style={{ color: theme.text }}>
                      Default form; rarity is the approximate hold chance in games (PokéAPI, %).
                    </Text>
                    <Box className="gap-1 text-sm opacity-95">
                      {heldItemsAggregated.map((it) => (
                        <Text key={it.itemSlug} style={{ color: theme.text }}>
                          <Text className="font-medium">{it.displayName}</Text>
                          <Text className="ml-2 font-mono text-xs opacity-80">
                            {it.minRarity === it.maxRarity
                              ? `${it.minRarity}%`
                              : `${it.minRarity}%–${it.maxRarity}%`}
                          </Text>
                        </Text>
                      ))}
                    </Box>
                  </Box>
                )}

                {(speciesRow.pokemon_v2_palparks ?? []).length > 0 && (
                  <Box className="gap-2">
                    <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                      Pal Park
                    </Text>
                    <Box className="gap-1.5 text-sm opacity-95">
                      {(speciesRow.pokemon_v2_palparks ?? []).map((p, i) => {
                        const area =
                          p.pokemon_v2_palparkarea?.pokemon_v2_palparkareanames[0]?.name ??
                          "Area";
                        return (
                          <Text
                            key={`${area}-${i}-${p.base_score}-${p.rate}`}
                            style={{ color: theme.text }}
                          >
                            <Text className="font-medium">{area}</Text>
                            <Text className="ml-2 text-xs opacity-80">
                              score {p.base_score ?? "—"} · catch rate {p.rate ?? "—"}
                            </Text>
                          </Text>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {evolvesFrom != null && (
                  <Box className="gap-2">
                    <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                      Evolves from
                    </Text>
                    <Pressable
                      className="self-start rounded-full border px-2.5 py-1"
                      style={{
                        borderColor: theme.pillBorder,
                        backgroundColor: "transparent",
                      }}
                      onPress={() => openPokemonInfo(evolvesFrom.id)}
                    >
                      <Text
                        className="text-xs font-medium capitalize"
                        style={{ color: theme.text }}
                      >
                        {evolvesFrom.pokemon_v2_pokemonspeciesnames[0]?.name ??
                          displaySpeciesName(evolvesFrom.name)}
                      </Text>
                    </Pressable>
                  </Box>
                )}

                {speciesRow.pokemon_v2_evolutionchain &&
                  speciesRow.pokemon_v2_evolutionchain.pokemon_v2_pokemonspecies.length > 1 && (
                    <Box className="gap-2">
                      <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                        Evolution
                      </Text>
                      <Box className="flex-row flex-wrap gap-2">
                        {speciesRow.pokemon_v2_evolutionchain.pokemon_v2_pokemonspecies.map(
                          (s) => (
                            <Pressable
                              key={s.id}
                              className="rounded-full border px-2.5 py-1"
                              style={{
                                borderColor: theme.pillBorder,
                                backgroundColor:
                                  s.id === speciesRow.id ? theme.pillBg : "transparent",
                              }}
                              onPress={() => openPokemonInfo(s.id)}
                            >
                              <Text
                                className="text-xs font-medium capitalize"
                                style={{ color: theme.text }}
                              >
                                {displaySpeciesName(s.name)}
                              </Text>
                            </Pressable>
                          ),
                        )}
                      </Box>
                    </Box>
                  )}

                {possibleAbilities.length > 0 && (
                  <Box className="gap-2">
                    <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                      Possible abilities
                    </Text>
                    <Box className="gap-2 text-sm opacity-95">
                      {possibleAbilities.map((a) => (
                        <Text key={a.abilityId} style={{ color: theme.text }}>
                          <Text className="font-medium">{a.displayName}</Text>
                          {a.hiddenOnAny ? (
                            <Text className="ml-2 text-xs opacity-80">
                              {hasAltForms ? "(hidden on some forms)" : "(hidden)"}
                            </Text>
                          ) : null}
                        </Text>
                      ))}
                    </Box>
                  </Box>
                )}

                <Box className="gap-2">
                  <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                    Wild encounters
                    {encounterGameLabel ? (
                      <Text className="ml-2 font-normal opacity-80">
                        {" "}
                        ({encounterGameLabel})
                      </Text>
                    ) : null}
                  </Text>
                  <Box className="min-h-10">
                    {effFlavorVid == null && (
                      <Text className="text-sm opacity-80" style={{ color: theme.text }}>
                        Select a specific game in the picker to load encounter locations for that
                        version.
                      </Text>
                    )}
                    {effFlavorVid != null && encQuery.isLoading && (
                      <Box className="gap-3">
                        {Array.from({ length: 3 }, (_, i) => (
                          <Box key={i} className="gap-1.5">
                            <Skeleton className="h-3.5 w-48 max-w-full bg-black/20 dark:bg-white/25" />
                            <Skeleton className="h-3 w-full max-w-md bg-black/20 dark:bg-white/25" />
                            <Skeleton className="h-3 w-[85%] max-w-sm bg-black/20 dark:bg-white/25" />
                          </Box>
                        ))}
                      </Box>
                    )}
                    {effFlavorVid != null && encQuery.isError && (
                      <Text className="text-sm opacity-90" style={{ color: theme.text }}>
                        {(encQuery.error as Error)?.message ?? "Could not load encounters."}
                      </Text>
                    )}
                    {effFlavorVid != null &&
                      encQuery.isSuccess &&
                      encounterGroups.length === 0 && (
                        <Text className="text-sm opacity-80" style={{ color: theme.text }}>
                          No wild encounters in PokéAPI for this species in this game version (it
                          may be gift-only, evolved only, or data may be incomplete).
                        </Text>
                      )}
                    {effFlavorVid != null &&
                      encQuery.isSuccess &&
                      encounterGroups.length > 0 && (
                        <Box className="gap-3 text-sm opacity-95">
                          {encounterGroups.map((g) => (
                            <Box key={g.place}>
                              <Text className="font-medium" style={{ color: theme.text }}>
                                {g.place}
                              </Text>
                              <Box className="mt-1 gap-0.5 pl-2">
                                {g.lines.map((line, i) => (
                                  <Text
                                    key={`${g.place}-${i}-${line}`}
                                    className="text-xs opacity-90"
                                    style={{ color: theme.text }}
                                  >
                                    • {line}
                                  </Text>
                                ))}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                  </Box>
                </Box>

                {defaultMon && defaultMon.pokemon_v2_pokemonstats.length > 0 && (
                  <Box className="gap-2">
                    <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                      Base stats
                    </Text>
                    <Box className="gap-1.5">
                      {defaultMon.pokemon_v2_pokemonstats.map((s) => (
                        <Box
                          key={s.pokemon_v2_stat?.name ?? String(s.base_stat)}
                          className="flex-row items-center gap-2 text-sm"
                        >
                          <Text
                            className="w-28 shrink-0 font-mono text-xs uppercase opacity-80"
                            style={{ color: theme.text }}
                          >
                            {s.pokemon_v2_stat?.name?.replace(/-/g, " ") ?? "—"}
                          </Text>
                          <Box className="h-2 min-w-0 flex-1 rounded-full bg-black/10">
                            <Box
                              className="h-2 rounded-full"
                              style={{
                                width: `${Math.min(100, (s.base_stat / 255) * 100)}%`,
                                backgroundColor: theme.text,
                                opacity: 0.55,
                              }}
                            />
                          </Box>
                          <Text
                            className="w-8 text-right font-mono tabular-nums"
                            style={{ color: theme.text }}
                          >
                            {s.base_stat}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                    {defaultMon.base_experience != null && (
                      <Text className="text-xs opacity-90" style={{ color: theme.text }}>
                        Base experience (defeat): {defaultMon.base_experience}
                      </Text>
                    )}
                  </Box>
                )}

                <Box className="flex-row flex-wrap gap-2 pt-1">
                  <Button
                    variant="secondary"
                    className="font-medium"
                    style={{
                      backgroundColor: theme.pillBg,
                      borderColor: theme.pillBorder,
                    }}
                    disabled={defaultMon == null || versionGroupForMoves == null}
                    onPress={() => setPokemonMovesModalOpen(true)}
                  >
                    <ButtonText className="text-foreground">Moves in this game</ButtonText>
                  </Button>
                </Box>
              </>
            )}
          </Box>
          </ScrollView>
        </ModalContent>
      </Modal>

      <PokemonMovesModal pokemonId={defaultMon?.id ?? null} versionGroupId={versionGroupForMoves} />
    </>
  );
}
