import { app } from '@/state';
import { useSelector } from '@legendapp/state/react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getRegionSlugsForVersionId } from '@/state/versionRegionFilter';

type RegionOption = { slug: string; label: string };

export function RegionSelect() {
  const inputRef = useRef<HTMLInputElement>(null);
  const regionRows = useSelector(() => app.state.query.regionRows.get());
  const versionRows = useSelector(() => app.state.query.versionRows.get());
  const selectedGame = useSelector(() => app.state.ui.selectedGame.get());
  const selected = useSelector(() => app.state.ui.selectedRegion.get());
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);

  const options = useMemo((): RegionOption[] => {
    const national: RegionOption = { slug: 'national', label: 'National' };
    let rest = (regionRows ?? []).map((r) => ({
      slug: r.name,
      label: r.pokemon_v2_regionnames[0]?.name ?? r.name,
    }));
    if (selectedGame !== 0) {
      const allowed = getRegionSlugsForVersionId(versionRows, selectedGame);
      rest = rest.filter((r) => allowed.has(r.slug));
    }
    return [national, ...rest];
  }, [regionRows, versionRows, selectedGame]);

  const selectedLabel = useMemo(() => {
    if (selected === 'national') return 'National';
    const r = (regionRows ?? []).find((x) => x.name === selected);
    return r?.pokemon_v2_regionnames[0]?.name ?? selected;
  }, [selected, regionRows]);

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!needle) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(needle) || o.slug.toLowerCase().includes(needle),
    );
  }, [options, needle]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [needle]);

  useEffect(() => {
    setHighlightIndex((i) => Math.min(i, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  const displayValue = open ? query : selectedLabel;

  function selectOption(slug: string) {
    app.state.ui.selectedRegion.set(slug);
    setOpen(false);
    setQuery('');
    setHighlightIndex(0);
  }

  function resetToNational(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    selectOption('national');
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true);
        setQuery('');
        setHighlightIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
      e.preventDefault();
      return;
    }

    if (filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[highlightIndex];
      if (opt) selectOption(opt.slug);
    }
  }

  const activeId =
    filtered.length > 0 ? `region-opt-${filtered[highlightIndex]?.slug}` : undefined;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery('');
      }}
    >
      <PopoverTrigger asChild>
        <div
          className={cn(
            'flex h-9 w-[min(100%,260px)] min-w-[200px] items-center gap-0 rounded-md border border-input bg-background text-sm shadow-sm',
            'outline-none focus-within:ring-2 focus-within:ring-ring',
          )}
        >
          <Input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="region-listbox"
            aria-activedescendant={activeId}
            placeholder="Region…"
            autoComplete="off"
            className={cn(
              'h-9 min-w-0 flex-1 border-0 bg-transparent px-3 py-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
            )}
            value={displayValue}
            onChange={(e) => {
              const v = e.target.value;
              if (!open) setOpen(true);
              setQuery(v);
            }}
            onFocus={() => {
              setOpen(true);
              setQuery('');
              setHighlightIndex(0);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onInputKeyDown}
          />
          {selected !== 'national' && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              tabIndex={-1}
              aria-label="Reset to National dex"
              title="Reset to National"
              className="mr-1 h-7 w-7 shrink-0 text-muted-foreground"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.preventDefault()}
              onClick={resetToNational}
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        id="region-listbox"
        role="listbox"
        aria-label="Regions"
        className="w-[var(--radix-popover-trigger-width)] min-w-[220px] max-w-[min(100vw-2rem,320px)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.blur();
        }}
      >
        <Command shouldFilter={false}>
          <CommandList className="max-h-64">
            {filtered.length === 0 ? (
              <CommandEmpty>No regions match.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filtered.map((opt, i) => (
                  <CommandItem
                    key={opt.slug}
                    id={`region-opt-${opt.slug}`}
                    role="option"
                    aria-selected={opt.slug === selected}
                    value={opt.slug}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setHighlightIndex(i)}
                    onSelect={() => selectOption(opt.slug)}
                    className={cn(
                      i === highlightIndex && 'bg-accent text-accent-foreground',
                      opt.slug === selected && i !== highlightIndex && 'bg-accent/40',
                    )}
                  >
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
