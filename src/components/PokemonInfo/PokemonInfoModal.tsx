import { LazyLoadImage } from 'react-lazy-load-image-component';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { cn } from '@/lib/utils';
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
import { useMemo, useRef } from 'react';
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
  const { theme, onArtLoad } = usePokemonListImageTheme(spriteUrl, primaryType, spriteColorKey);

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
    flavorPick?.pokemon_v2_version?.pokemon_v2_versionnames[0]?.name ??
    (effFlavorVid != null ? `Version ${effFlavorVid}` : null);

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

  const dialogTitleRef = useRef<HTMLHeadingElement>(null);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) closePokemonInfo();
        }}
      >
        <DialogContent
          className={cn(
            'pokemon-info-modal-scroll max-h-[92vh] max-w-lg gap-0 overflow-y-auto border-0 p-0 sm:max-w-xl',
            'data-[state=open]:animate-in',
            '[&>button]:z-30 [&>button]:text-inherit [&>button]:opacity-80 hover:[&>button]:opacity-100',
          )}
          style={{
            backgroundColor: theme.cardBg,
            color: theme.text,
            ['--pim-scroll-track' as string]: theme.artBlob,
            ['--pim-scroll-thumb' as string]: theme.text,
            scrollbarColor: `${theme.text} ${theme.artBlob}`,
          }}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            dialogTitleRef.current?.focus();
          }}
        >
          <DialogHeader
            className="sticky top-0 z-20 space-y-2 border-b px-6 py-4 pr-14 text-left"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: `${theme.text}22`,
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <DialogTitle
                    ref={dialogTitleRef}
                    tabIndex={-1}
                    className="text-xl font-bold tracking-tight outline-none"
                    style={{ color: theme.text }}
                  >
                    {speciesDisplayName}
                  </DialogTitle>
                  {detailQuery.isLoading && speciesId != null ? (
                    <span
                      className="font-mono text-sm font-normal tabular-nums opacity-75"
                      style={{ color: theme.text }}
                    >
                      {formatDexListLabel(speciesId)}
                    </span>
                  ) : speciesRow ? (
                    <div
                      className="flex flex-col items-end gap-0.5 text-right font-mono text-sm font-normal tabular-nums opacity-75"
                      style={{ color: theme.text }}
                    >
                      {selectedVersionId === 0 ? (
                        <span title="National Pokédex">
                          {formatDexListLabel(modalDex.national)}
                        </span>
                      ) : modalDex.local != null && modalDex.regionLabel != null ? (
                        <>
                          <span title={`${modalDex.regionLabel} Pokédex`}>
                            {modalDex.regionLabel} {formatDexListLabel(modalDex.local)}
                          </span>
                          <span className="text-xs opacity-70" title="National Pokédex">
                            National {formatDexListLabel(modalDex.national)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="max-w-40 text-xs leading-snug opacity-90">
                            No regional # for{' '}
                            {modalDex.versionLabel ?? `version ${selectedVersionId}`}
                          </span>
                          <span className="text-xs opacity-70" title="National Pokédex">
                            National {formatDexListLabel(modalDex.national)}
                          </span>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
                <div className="min-h-5 space-y-2">
                  {detailQuery.isLoading ? (
                    <Skeleton className="mt-0.5 h-4 w-40 max-w-full bg-black/20 dark:bg-white/25" />
                  ) : genus ? (
                    <p className="text-sm opacity-90" style={{ color: theme.text }}>
                      {genus}
                    </p>
                  ) : null}
                  {!detailQuery.isLoading && speciesClassificationTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {speciesClassificationTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                          style={{
                            borderColor: theme.pillBorder,
                            backgroundColor: theme.pillBg,
                            color: theme.text,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-2 sm:w-56">
                <InfoModalVersionSelect />
              </div>
            </div>
          </DialogHeader>

          <div className="relative z-0 flex flex-col gap-4 px-6 py-4">
            {detailQuery.isLoading && <PokemonInfoModalBodySkeleton pillBg={theme.pillBg} />}

            {detailQuery.isError && (
              <p className="text-sm opacity-90" style={{ color: theme.text }}>
                {(detailQuery.error as Error)?.message ?? 'Could not load details.'}
              </p>
            )}

            {detailQuery.isSuccess && speciesRow && (
              <>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                  <div
                    className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: theme.artBlob }}
                  >
                    <LazyLoadImage
                      src={spriteUrl}
                      alt={speciesDisplayName}
                      width={144}
                      height={144}
                      crossOrigin="anonymous"
                      className="relative z-0 h-32 w-32 object-contain drop-shadow-md"
                      onLoad={(e) => onArtLoad(e.currentTarget)}
                      placeholder={<Skeleton className="h-32 w-32 rounded-lg opacity-30" />}
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    {defaultMon && (
                      <div className="flex flex-wrap gap-2">
                        {defaultMon.pokemon_v2_pokemontypes.map((t) => {
                          const name = t.pokemon_v2_type?.name;
                          if (!name) return null;
                          return (
                            <span
                              key={`${t.slot}-${name}`}
                              className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                              style={{
                                backgroundColor: theme.pillBg,
                                borderColor: theme.pillBorder,
                                color: theme.text,
                              }}
                            >
                              {name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm opacity-95">
                      <dt className="opacity-75">Height</dt>
                      <dd>{displayHeightDm(defaultMon?.height)}</dd>
                      <dt className="opacity-75">Weight</dt>
                      <dd>{displayWeightHg(defaultMon?.weight)}</dd>
                      <dt className="opacity-75">Capture rate</dt>
                      <dd>{speciesRow.capture_rate ?? '—'}</dd>
                      <dt className="opacity-75">Base happiness</dt>
                      <dd>{speciesRow.base_happiness ?? '—'}</dd>
                      <dt className="opacity-75">Hatch cycles</dt>
                      <dd>{speciesRow.hatch_counter ?? '—'}</dd>
                      <dt className="opacity-75">Gender</dt>
                      <dd>{genderRateLabel(speciesRow.gender_rate)}</dd>
                      <dt className="opacity-75">Growth</dt>
                      <dd className="capitalize">{speciesRow.pokemon_v2_growthrate?.name ?? '—'}</dd>
                      <dt className="opacity-75">Generation</dt>
                      <dd>
                        {speciesRow.pokemon_v2_generation?.pokemon_v2_generationnames[0]?.name ??
                          (speciesRow.pokemon_v2_generation?.id != null
                            ? String(speciesRow.pokemon_v2_generation.id)
                            : '—')}
                      </dd>
                    </dl>
                  </div>
                </div>

                <InfoModalSpriteVariations
                  entries={spriteVariationEntries}
                  artBlob={theme.artBlob}
                  themeText={theme.text}
                />

                <section className="space-y-2 rounded-xl px-3 py-3" style={{ backgroundColor: theme.pillBg }}>
                  <h3 className="text-sm font-semibold" style={{ color: theme.text }}>
                    Pokédex
                    {flavorGameLabel ? (
                      <span className="ml-2 font-normal opacity-80">({flavorGameLabel})</span>
                    ) : null}
                  </h3>
                  {flavorText ? (
                    <p className="text-sm leading-relaxed opacity-95" style={{ color: theme.text }}>
                      {flavorText}
                    </p>
                  ) : (
                    <p className="text-sm opacity-80" style={{ color: theme.text }}>
                      No English Pokédex entry for this game selection.
                    </p>
                  )}
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-semibold" style={{ color: theme.text }}>
                    Cry
                  </h3>
                  <div className="min-h-9">
                    {cryQuery.isLoading && (
                      <Skeleton className="h-9 w-full max-w-md rounded-md bg-black/20 dark:bg-white/25" />
                    )}
                    {cryQuery.isError && (
                      <p className="text-sm opacity-80" style={{ color: theme.text }}>
                        {(cryQuery.error as Error)?.message ?? 'Could not load cry.'}
                      </p>
                    )}
                    {cryQuery.isSuccess && cryAudioSrc ? (
                      <>
                        {/* Cry is audio-only from PokéAPI; no caption source exists. */}
                        {/* biome-ignore lint/a11y/useMediaCaption: no captions available for game cry assets */}
                        <audio
                          key={`${cryGameGen ?? 'na'}|${cryAudioSrc}`}
                          controls
                          className="h-9 w-full max-w-md"
                          src={cryAudioSrc}
                        />
                      </>
                    ) : null}
                    {cryQuery.isSuccess && !cryAudioSrc && !cryQuery.isLoading ? (
                      <p className="text-sm opacity-80" style={{ color: theme.text }}>
                        No cry audio for this Pokémon.
                      </p>
                    ) : null}
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-semibold" style={{ color: theme.text }}>
                    Habitat &amp; appearance
                  </h3>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm opacity-95">
                    <dt className="opacity-75">Color</dt>
                    <dd className="capitalize">{speciesRow.pokemon_v2_pokemoncolor?.name ?? '—'}</dd>
                    <dt className="opacity-75">Habitat</dt>
                    <dd className="capitalize">{speciesRow.pokemon_v2_pokemonhabitat?.name ?? '—'}</dd>
                    <dt className="opacity-75">Shape</dt>
                    <dd className="capitalize">{speciesRow.pokemon_v2_pokemonshape?.name ?? '—'}</dd>
                    <dt className="opacity-75">Gender sprites</dt>
                    <dd>
                      {speciesRow.has_gender_differences === true
                        ? 'Different male / female artwork'
                        : '—'}
                    </dd>
                  </dl>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-semibold" style={{ color: theme.text }}>
                    Egg groups
                  </h3>
                  <p className="text-sm capitalize opacity-95" style={{ color: theme.text }}>
                    {speciesRow.pokemon_v2_pokemonegggroups
                      .map((g) => g.pokemon_v2_egggroup?.name)
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </p>
                </section>

                {((selectedVersionId === 0 &&
                  (dexTableRows.length > 0 || speciesRow.order != null)) ||
                  selectedVersionId !== 0) && (
                  <section className="space-y-2">
                    <h3 className="text-sm font-semibold" style={{ color: theme.text }}>
                      Pokédex numbers
                    </h3>
                    {selectedVersionId === 0 ? (
                      <>
                        {showNationalDexTable && (
                          <>
                            <p className="text-xs opacity-75" style={{ color: theme.text }}>
                              Main-series Pokédex listings (PokéAPI). The national dex row is
                              highlighted.
                            </p>
                            <div
                              className="overflow-x-auto rounded-lg border text-sm"
                              style={{ borderColor: theme.pillBorder }}
                            >
                              <table className="w-full min-w-70 border-collapse">
                                <thead>
                                  <tr
                                    className="border-b text-left text-xs uppercase tracking-wide opacity-75"
                                    style={{ borderColor: `${theme.text}22` }}
                                  >
                                    <th className="px-2 py-1.5 font-medium">Region</th>
                                    <th className="px-2 py-1.5 font-medium">Pokédex</th>
                                    <th className="px-2 py-1.5 text-right font-medium">#</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {dexTableRows.map((row) => {
                                    const highlight = row.dexName === 'national';
                                    return (
                                      <tr
                                        key={row.key}
                                        className="border-b last:border-0"
                                        style={{
                                          borderColor: `${theme.text}18`,
                                          ...(highlight ? { backgroundColor: theme.pillBg } : {}),
                                        }}
                                      >
                                        <td className="px-2 py-1.5">{row.regionLabel}</td>
                                        <td className="px-2 py-1.5 font-mono text-xs opacity-90">
                                          {row.dexName}
                                        </td>
                                        <td className="px-2 py-1.5 text-right tabular-nums">
                                          {row.num}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}
                        {speciesRow.order != null && (
                          <p className="text-xs opacity-75" style={{ color: theme.text }}>
                            Internal Pokédex sort order: {speciesRow.order}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm opacity-95" style={{ color: theme.text }}>
                          {modalDex.local != null && modalDex.regionLabel != null ? (
                            <span className="font-mono tabular-nums">
                              {modalDex.regionLabel} {formatDexListLabel(modalDex.local)}
                            </span>
                          ) : (
                            <span className="opacity-90">
                              No main-series regional number for this game&apos;s region in PokéAPI
                              {modalDex.versionLabel != null ? ` (${modalDex.versionLabel})` : ''}.
                            </span>
                          )}
                        </p>
                        <p className="text-xs opacity-75" style={{ color: theme.text }}>
                          Local number uses only the game selected in this modal (
                          {modalDex.versionLabel ?? `version ${selectedVersionId}`}), not the list
                          Region or Game filters.
                        </p>
                        {speciesRow.order != null && (
                          <p className="text-xs opacity-75" style={{ color: theme.text }}>
                            Internal Pokédex sort order: {speciesRow.order}
                          </p>
                        )}
                      </>
                    )}
                  </section>
                )}

                {(speciesRestQuery.isLoading ||
                  speciesRestQuery.isError ||
                  speciesNoteParagraphs.length > 0) && (
                  <section className="space-y-2">
                    <h3 className="text-sm font-semibold" style={{ color: theme.text }}>
                      Species &amp; form notes
                    </h3>
                    {speciesRestQuery.isLoading && speciesNoteParagraphs.length === 0 && (
                      <Skeleton className="h-16 w-full max-w-md rounded-md bg-black/20 dark:bg-white/25" />
                    )}
                    {speciesRestQuery.isError && (
                      <p className="text-sm opacity-80" style={{ color: theme.text }}>
                        {(speciesRestQuery.error as Error)?.message ?? 'Could not load form notes.'}
                      </p>
                    )}
                    {speciesNoteParagraphs.map((para, i) => (
                      <p
                        key={`${i}-${para.slice(0, 48)}`}
                        className="text-sm leading-relaxed opacity-95"
                        style={{ color: theme.text }}
                      >
                        {para}
                      </p>
                    ))}
                  </section>
                )}

                {heldItemsAggregated.length > 0 && (
                  <section className="space-y-2">
                    <h3 className="text-sm font-semibold" style={{ color: theme.text }}>
                      Wild held items
                    </h3>
                    <p className="text-xs opacity-75" style={{ color: theme.text }}>
                      Default form; rarity is the approximate hold chance in games (PokéAPI, %).
                    </p>
                    <ul className="space-y-1 text-sm opacity-95">
                      {heldItemsAggregated.map((it) => (
                        <li key={it.itemSlug}>
                          <span className="font-medium">{it.displayName}</span>
                          <span className="ml-2 font-mono text-xs opacity-80">
                            {it.minRarity === it.maxRarity
                              ? `${it.minRarity}%`
                              : `${it.minRarity}%–${it.maxRarity}%`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {(speciesRow.pokemon_v2_palparks ?? []).length > 0 && (
                  <section className="space-y-2">
                    <h3 className="text-sm font-semibold" style={{ color: theme.text }}>
                      Pal Park
                    </h3>
                    <ul className="space-y-1.5 text-sm opacity-95">
                      {(speciesRow.pokemon_v2_palparks ?? []).map((p, i) => {
                        const area =
                          p.pokemon_v2_palparkarea?.pokemon_v2_palparkareanames[0]?.name ?? 'Area';
                        return (
                          <li key={`${area}-${i}-${p.base_score}-${p.rate}`}>
                            <span className="font-medium">{area}</span>
                            <span className="ml-2 text-xs opacity-80">
                              score {p.base_score ?? '—'} · catch rate {p.rate ?? '—'}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}

                {evolvesFrom != null && (
                  <section className="space-y-2">
                    <h3 className="text-sm font-semibold" style={{ color: theme.text }}>
                      Evolves from
                    </h3>
                    <button
                      type="button"
                      className="cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-opacity hover:opacity-90 focus:outline-none focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-2"
                      style={{
                        borderColor: theme.pillBorder,
                        backgroundColor: 'transparent',
                        color: theme.text,
                      }}
                      onClick={() => openPokemonInfo(evolvesFrom.id)}
                    >
                      {evolvesFrom.pokemon_v2_pokemonspeciesnames[0]?.name ??
                        displaySpeciesName(evolvesFrom.name)}
                    </button>
                  </section>
                )}

                {speciesRow.pokemon_v2_evolutionchain &&
                  speciesRow.pokemon_v2_evolutionchain.pokemon_v2_pokemonspecies.length > 1 && (
                    <section className="space-y-2">
                      <h3 className="text-sm font-semibold" style={{ color: theme.text }}>
                        Evolution
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {speciesRow.pokemon_v2_evolutionchain.pokemon_v2_pokemonspecies.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            className="cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-opacity hover:opacity-90 focus:outline-none focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-2"
                            style={{
                              borderColor: theme.pillBorder,
                              backgroundColor: s.id === speciesRow.id ? theme.pillBg : 'transparent',
                              color: theme.text,
                            }}
                            onClick={() => openPokemonInfo(s.id)}
                          >
                            {displaySpeciesName(s.name)}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                {possibleAbilities.length > 0 && (
                  <section className="space-y-2">
                    <h3 className="text-sm font-semibold" style={{ color: theme.text }}>
                      Possible abilities
                    </h3>
                    <ul className="space-y-2 text-sm opacity-95">
                      {possibleAbilities.map((a) => (
                        <li key={a.abilityId}>
                          <span className="font-medium">{a.displayName}</span>
                          {a.hiddenOnAny ? (
                            <span className="ml-2 text-xs opacity-80">
                              {hasAltForms ? '(hidden on some forms)' : '(hidden)'}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="space-y-2">
                  <h3 className="text-sm font-semibold" style={{ color: theme.text }}>
                    Wild encounters
                    {encounterGameLabel ? (
                      <span className="ml-2 font-normal opacity-80">({encounterGameLabel})</span>
                    ) : null}
                  </h3>
                  <div className="min-h-10">
                    {effFlavorVid == null && (
                      <p className="text-sm opacity-80" style={{ color: theme.text }}>
                        Select a specific game in the picker to load encounter locations for that
                        version.
                      </p>
                    )}
                    {effFlavorVid != null && encQuery.isLoading && (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }, (_, i) => (
                          <div key={i} className="space-y-1.5">
                            <Skeleton className="h-3.5 w-48 max-w-full bg-black/20 dark:bg-white/25" />
                            <Skeleton className="h-3 w-full max-w-md bg-black/20 dark:bg-white/25" />
                            <Skeleton className="h-3 w-[85%] max-w-sm bg-black/20 dark:bg-white/25" />
                          </div>
                        ))}
                      </div>
                    )}
                    {effFlavorVid != null && encQuery.isError && (
                      <p className="text-sm opacity-90" style={{ color: theme.text }}>
                        {(encQuery.error as Error)?.message ?? 'Could not load encounters.'}
                      </p>
                    )}
                    {effFlavorVid != null && encQuery.isSuccess && encounterGroups.length === 0 && (
                      <p className="text-sm opacity-80" style={{ color: theme.text }}>
                        No wild encounters in PokéAPI for this species in this game version (it may be
                        gift-only, evolved only, or data may be incomplete).
                      </p>
                    )}
                    {effFlavorVid != null && encQuery.isSuccess && encounterGroups.length > 0 && (
                      <ul className="space-y-3 text-sm opacity-95">
                        {encounterGroups.map((g) => (
                          <li key={g.place}>
                            <div className="font-medium" style={{ color: theme.text }}>
                              {g.place}
                            </div>
                            <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs opacity-90">
                              {g.lines.map((line, i) => (
                                <li key={`${g.place}-${i}-${line}`}>{line}</li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>

                {defaultMon && defaultMon.pokemon_v2_pokemonstats.length > 0 && (
                  <section className="space-y-2">
                    <h3 className="text-sm font-semibold" style={{ color: theme.text }}>
                      Base stats
                    </h3>
                    <div className="space-y-1.5">
                      {defaultMon.pokemon_v2_pokemonstats.map((s) => (
                        <div
                          key={s.pokemon_v2_stat?.name ?? String(s.base_stat)}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="w-28 shrink-0 font-mono text-xs uppercase opacity-80">
                            {s.pokemon_v2_stat?.name?.replace(/-/g, ' ') ?? '—'}
                          </span>
                          <div className="h-2 min-w-0 flex-1 rounded-full bg-black/10">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${Math.min(100, (s.base_stat / 255) * 100)}%`,
                                backgroundColor: theme.text,
                                opacity: 0.55,
                              }}
                            />
                          </div>
                          <span className="w-8 text-right font-mono tabular-nums">{s.base_stat}</span>
                        </div>
                      ))}
                    </div>
                    {defaultMon.base_experience != null && (
                      <p className="text-muted-foreground text-xs opacity-90" style={{ color: theme.text }}>
                        Base experience (defeat): {defaultMon.base_experience}
                      </p>
                    )}
                  </section>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    className="font-medium"
                    style={{
                      backgroundColor: theme.pillBg,
                      color: theme.text,
                      borderColor: theme.pillBorder,
                    }}
                    disabled={defaultMon == null || versionGroupForMoves == null}
                    onClick={() => setPokemonMovesModalOpen(true)}
                  >
                    Moves in this game
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PokemonMovesModal pokemonId={defaultMon?.id ?? null} versionGroupId={versionGroupForMoves} />
    </>
  );
}
