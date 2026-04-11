import { app, setInfoModalVersion } from '@/state';
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
import { getVersionGroupGenerationId, type VersionNameRow } from '@/state/versionRegionFilter';

type Option = { versionId: number; label: string; rowKey: number };

function sortVersionRows(rows: VersionNameRow[]): VersionNameRow[] {
  return [...rows].sort((a, b) => {
    const ga = getVersionGroupGenerationId(a) ?? 999;
    const gb = getVersionGroupGenerationId(b) ?? 999;
    if (ga !== gb) return ga - gb;
    const va = a.version_id ?? 0;
    const vb = b.version_id ?? 0;
    return va - vb;
  });
}

export function InfoModalVersionSelect() {
  const inputRef = useRef<HTMLInputElement>(null);
  const versionRows = useSelector(() => app.state.query.versionRows.get());
  const selectedVersionId = useSelector(() => app.state.infoModal.selectedVersionId.get());
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);

  const options = useMemo((): Option[] => {
    const base: Option[] = [{ versionId: 0, label: 'National · latest Pokédex', rowKey: -1 }];
    const rows = versionRows ?? [];
    for (const r of sortVersionRows(rows)) {
      const vid = r.version_id;
      if (vid == null) continue;
      base.push({ versionId: vid, label: r.name, rowKey: r.id });
    }
    return base;
  }, [versionRows]);

  const selectedLabel = useMemo(() => {
    if (selectedVersionId === 0) return 'National · latest Pokédex';
    const r = (versionRows ?? []).find((x) => x.version_id === selectedVersionId);
    return r?.name ?? `Version ${selectedVersionId}`;
  }, [selectedVersionId, versionRows]);

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

  function selectOption(versionId: number) {
    setInfoModalVersion(versionId);
    setOpen(false);
    setQuery('');
    setHighlightIndex(0);
  }

  function resetLatest(e: MouseEvent) {
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
    filtered.length > 0 ? `info-version-opt-${filtered[highlightIndex]?.rowKey}` : undefined;

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
            'flex h-9 w-full min-w-0 items-center gap-0 rounded-md border border-input bg-background/80 text-sm shadow-sm backdrop-blur-sm',
            'outline-none focus-within:ring-2 focus-within:ring-ring',
          )}
        >
          <Input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="info-version-listbox"
            aria-activedescendant={activeId}
            placeholder="National / game for Pokédex & moves…"
            autoComplete="off"
            className={cn(
              'h-9 min-w-0 flex-1 border-0 bg-transparent px-3 py-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
            )}
            value={open ? query : selectedLabel}
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
          {selectedVersionId !== 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              tabIndex={-1}
              aria-label="Reset to national default"
              title="National · latest Pokédex"
              className="mr-1 h-7 w-7 shrink-0 text-muted-foreground"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.preventDefault()}
              onClick={resetLatest}
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        id="info-version-listbox"
        role="listbox"
        aria-label="Game versions for details"
        className={cn(
          'z-[200] flex max-h-[min(22rem,55dvh)] flex-col overflow-hidden p-0',
          'w-[var(--radix-popover-trigger-width)] min-w-[220px] max-w-[min(100vw-2rem,360px)]',
        )}
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.blur();
        }}
        onWheel={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false} className="flex max-h-full min-h-0 flex-1 flex-col overflow-hidden">
          <CommandList className="max-h-full min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            {filtered.length === 0 ? (
              <CommandEmpty>No versions match.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filtered.map((opt, i) => (
                  <CommandItem
                    key={opt.rowKey}
                    id={`info-version-opt-${opt.rowKey}`}
                    role="option"
                    aria-selected={opt.versionId === selectedVersionId}
                    value={`k${opt.rowKey}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setHighlightIndex(i)}
                    onSelect={() => selectOption(opt.versionId)}
                    className={cn(
                      i === highlightIndex && 'bg-accent text-accent-foreground',
                      opt.versionId === selectedVersionId && i !== highlightIndex && 'bg-accent/40',
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
