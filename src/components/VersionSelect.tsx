import { app } from '@/state';
import { useSelector } from '@legendapp/state/react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { versionNameRowMatchesRegionSlug } from '@/state/versionRegionFilter';

type VersionOption = { versionId: number; label: string; rowKey: number };

export function VersionSelect() {
  const inputRef = useRef<HTMLInputElement>(null);
  const versionRows = useSelector(() => app.state.query.versionRows.get());
  const selectedRegion = useSelector(() => app.state.ui.selectedRegion.get());
  const selectedGame = useSelector(() => app.state.ui.selectedGame.get());
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);

  const options = useMemo((): VersionOption[] => {
    const all: VersionOption[] = [{ versionId: 0, label: 'All versions', rowKey: -1 }];
    const rows = versionRows ?? [];
    const filteredRows =
      selectedRegion === 'national'
        ? rows
        : rows.filter((r) => versionNameRowMatchesRegionSlug(r, selectedRegion));
    for (const r of filteredRows) {
      const vid = r.version_id;
      if (vid == null) continue;
      all.push({ versionId: vid, label: r.name, rowKey: r.id });
    }
    return all;
  }, [versionRows, selectedRegion]);

  const selectedLabel = useMemo(() => {
    if (selectedGame === 0) return 'All versions';
    const r = (versionRows ?? []).find((x) => x.version_id === selectedGame);
    return r?.name ?? `Version ${selectedGame}`;
  }, [selectedGame, versionRows]);

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!needle) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(needle) || String(o.versionId).includes(needle),
    );
  }, [options, needle]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [needle]);

  useEffect(() => {
    setHighlightIndex((i) => Math.min(i, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  const displayValue = open ? query : selectedLabel;

  function selectOption(versionId: number) {
    app.state.ui.selectedGame.set(versionId);
    setOpen(false);
    setQuery('');
    setHighlightIndex(0);
  }

  function resetToAll(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    selectOption(0);
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
      if (opt) selectOption(opt.versionId);
    }
  }

  const activeId =
    filtered.length > 0 ? `version-opt-${filtered[highlightIndex]?.rowKey}` : undefined;

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
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="version-listbox"
            aria-activedescendant={activeId}
            placeholder="Game version…"
            autoComplete="off"
            className={cn(
              'min-w-0 flex-1 border-0 bg-transparent px-3 py-1 outline-none',
              'placeholder:text-muted-foreground',
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
          {selectedGame !== 0 && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Reset to all versions"
              title="All versions"
              className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.preventDefault()}
              onClick={resetToAll}
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        id="version-listbox"
        role="listbox"
        aria-label="Game versions"
        className="min-w-[220px] max-w-[min(100vw-2rem,320px)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.blur();
        }}
      >
        <ScrollArea className="h-64">
          <ul className="p-1">
            {filtered.length === 0 ? (
              <li className="px-2 py-2 text-sm text-muted-foreground">No versions match.</li>
            ) : (
              filtered.map((opt, i) => {
                const highlighted = i === highlightIndex;
                return (
                  <li key={opt.rowKey}>
                    <button
                      type="button"
                      id={`version-opt-${opt.rowKey}`}
                      role="option"
                      aria-selected={opt.versionId === selectedGame}
                      className={cn(
                        'flex w-full cursor-default select-none rounded-sm px-2 py-1.5 text-left text-sm outline-none',
                        'hover:bg-accent hover:text-accent-foreground',
                        highlighted && 'bg-accent text-accent-foreground',
                        !highlighted && opt.versionId === selectedGame && 'bg-accent/40',
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setHighlightIndex(i)}
                      onClick={() => selectOption(opt.versionId)}
                    >
                      {opt.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
