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
import type { PokemonSpeciesDetailQuery } from '@/gql/operation-types';
import { POKEMON_SPECIES_DETAIL_QUERY } from '@/components/PokemonInfo/detailQueries';
import { usePokemonListImageTheme } from '@/hooks/usePokemonListImageTheme';
import { useModalPokemonSpriteUrl } from '@/hooks/useModalPokemonSpriteUrl';
import { cn } from '@/lib/utils';
import { InfoModalVersionSelect } from '@/components/PokemonInfo/InfoModalVersionSelect';
import { PokemonInfoModalBodySkeleton } from '@/components/PokemonInfo/PokemonInfoModalSkeleton';
import { PokemonMovesModal } from '@/components/PokemonInfo/PokemonMovesModal';
import {
  displayHeightDm,
  displayWeightHg,
  effectiveFlavorVersionId,
  effectiveVersionGroupIdForMoves,
  flavorRowForVersion,
  formatFlavorText,
  genderRateLabel,
} from '@/components/PokemonInfo/infoModalUtils';
import { useMemo, useRef } from 'react';
import { getOfficialArtworkShinyUrl, getOfficialArtworkUrl } from '@/lib/pokeSpriteUrl';

function displaySpeciesName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function pickPokemonFromList(list: Pokemon[], speciesId: number | null): Pokemon | undefined {
  if (speciesId == null) return undefined;
  return list.find((p) => p.id === speciesId);
}

export function PokemonInfoModal() {
  const open = useSelector(() => app.state.infoModal.open.get());
  const speciesId = useSelector(() => app.state.infoModal.speciesId.get());
  const selectedVersionId = useSelector(() => app.state.infoModal.selectedVersionId.get());
  const processedList = useSelector(() => app.processedPokemonList.get() ?? []);

  const listPoke = useMemo(
    () => pickPokemonFromList(processedList, speciesId),
    [processedList, speciesId],
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

  const speciesRow = detailQuery.data?.pokemon_v2_pokemonspecies?.[0];
  const defaultMon = speciesRow?.pokemon_v2_pokemons?.[0];
  const flavorRows = speciesRow?.pokemon_v2_pokemonspeciesflavortexts ?? [];

  const pokeForSprite = useMemo((): Pokemon | undefined => {
    if (listPoke) return listPoke;
    if (!speciesRow || !defaultMon) return undefined;
    const spritesRoot = defaultMon.pokemon_v2_pokemonsprites?.[0]?.sprites;
    const official = getOfficialArtworkUrl(spritesRoot);
    if (!official) return undefined;
    const genId = speciesRow.pokemon_v2_generation?.id ?? 1;
    return {
      name: speciesRow.name,
      id: speciesRow.id,
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
      return j.cries?.latest ?? j.cries?.legacy ?? null;
    },
    enabled: open && cryPokemonId != null,
    staleTime: Infinity,
  });

  const versionRows = useSelector(() => app.state.query.versionRows.get());
  const effFlavorVid = effectiveFlavorVersionId(selectedVersionId, flavorRows);
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
            'max-h-[92vh] max-w-lg gap-0 overflow-y-auto border-0 p-0 sm:max-w-xl',
            'data-[state=open]:animate-in',
            '[&>button]:text-inherit [&>button]:opacity-80 hover:[&>button]:opacity-100',
          )}
          style={{
            backgroundColor: theme.cardBg,
            color: theme.text,
          }}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            dialogTitleRef.current?.focus();
          }}
        >
          <DialogHeader
            className="sticky top-0 z-10 space-y-2 border-b px-6 py-4 pr-14 text-left"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: `${theme.text}22`,
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <DialogTitle
                  ref={dialogTitleRef}
                  tabIndex={-1}
                  className="text-xl font-bold tracking-tight outline-none"
                  style={{ color: theme.text }}
                >
                  {speciesDisplayName}
                </DialogTitle>
                <div className="min-h-5">
                  {detailQuery.isLoading ? (
                    <Skeleton className="mt-0.5 h-4 w-40 max-w-full bg-black/20 dark:bg-white/25" />
                  ) : genus ? (
                    <p className="text-sm opacity-90" style={{ color: theme.text }}>
                      {genus}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-2 sm:w-56">
                <InfoModalVersionSelect />
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-4 px-6 py-4">
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
                      className="relative z-10 h-32 w-32 object-contain drop-shadow-md"
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
                    {cryQuery.data ? (
                      <>
                        {/* Cry is audio-only from PokéAPI; no caption source exists. */}
                        {/* biome-ignore lint/a11y/useMediaCaption: no captions available for game cry assets */}
                        <audio controls className="h-9 w-full max-w-md" src={cryQuery.data} />
                      </>
                    ) : null}
                    {cryQuery.isSuccess && !cryQuery.data && !cryQuery.isLoading ? (
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

                {defaultMon && defaultMon.pokemon_v2_pokemonabilities.length > 0 && (
                  <section className="space-y-2">
                    <h3 className="text-sm font-semibold" style={{ color: theme.text }}>
                      Abilities
                    </h3>
                    <ul className="space-y-1 text-sm opacity-95">
                      {defaultMon.pokemon_v2_pokemonabilities.map((a) => {
                        const label =
                          a.pokemon_v2_ability?.pokemon_v2_abilitynames[0]?.name ??
                          a.pokemon_v2_ability?.name ??
                          '—';
                        return (
                          <li key={`${a.slot}-${label}`}>
                            {label}
                            {a.is_hidden ? (
                              <span className="ml-2 text-xs opacity-75">(hidden)</span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}

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
