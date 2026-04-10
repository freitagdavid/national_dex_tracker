import { app } from '@/state';
import { useSelector } from '@legendapp/state/react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { Check, X } from 'lucide-react';
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

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'] as const;

type GenOption = { value: string; label: string; isClear?: boolean };

const GEN_OPTIONS: GenOption[] = ROMAN.slice(1).map((r, i) => ({
  value: String(i + 1),
  label: `Generation ${r}`,
}));

const ALL_ROW: GenOption = { value: '__all__', label: 'All generations', isClear: true };

const STATIC_OPTIONS: GenOption[] = [ALL_ROW, ...GEN_OPTIONS];

function normalizeGenIds(ids: number[]): number[] {
  return [...new Set(ids)].filter((n) => n >= 1 && n <= 9).sort((a, b) => a - b);
}

function formatGenSummary(ids: number[]): string {
  if (ids.length === 0) return 'All generations';
  const sorted = [...ids].sort((a, b) => a - b);
  if (sorted.length === 1) {
    const r = ROMAN[sorted[0]];
    return r ? `Generation ${r}` : `Generation ${sorted[0]}`;
  }
  if (sorted.length <= 4) {
    return sorted.map((id) => (ROMAN[id] ? `Gen ${ROMAN[id]}` : String(id))).join(', ');
  }
  return `${sorted.length} generations`;
}

export function GenerationSelect() {
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = useSelector(() => app.state.ui.selectedGenerations.get());
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);

  const options = useMemo(() => STATIC_OPTIONS, []);

  const selectedLabel = useMemo(() => formatGenSummary(selected), [selected]);

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!needle) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(needle) || o.value.includes(needle),
    );
  }, [options, needle]);

  useEffect(() => {
    setHighlightIndex((i) => Math.min(i, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  const displayValue = open ? query : selectedLabel;

  function clearAll() {
    app.state.ui.selectedGenerations.set([]);
  }

  function toggleGen(id: number) {
    const cur = app.state.ui.selectedGenerations.peek();
    const has = cur.includes(id);
    const next = has ? cur.filter((x) => x !== id) : [...cur, id];
    app.state.ui.selectedGenerations.set(normalizeGenIds(next));
  }

  function applyOption(opt: GenOption) {
    if (opt.isClear) {
      clearAll();
      return;
    }
    const id = Number.parseInt(opt.value, 10);
    if (id >= 1 && id <= 9) toggleGen(id);
  }

  function resetToAll(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    clearAll();
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
      if (opt) applyOption(opt);
    }
  }

  const activeId =
    filtered.length > 0 ? `gen-opt-${filtered[highlightIndex]?.value}` : undefined;

  function isOptionSelected(opt: GenOption): boolean {
    if (opt.isClear) return selected.length === 0;
    const id = Number.parseInt(opt.value, 10);
    return selected.includes(id);
  }

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
            aria-controls="generation-listbox"
            aria-activedescendant={activeId}
            placeholder="Generations…"
            autoComplete="off"
            className={cn(
              'h-9 min-w-0 flex-1 border-0 bg-transparent px-3 py-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
            )}
            value={displayValue}
            onChange={(e) => {
              const v = e.target.value;
              if (!open) setOpen(true);
              setQuery(v);
              setHighlightIndex(0);
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
          {selected.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              tabIndex={-1}
              aria-label="Reset to all generations"
              title="All generations"
              className="mr-1 h-7 w-7 shrink-0 text-muted-foreground"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.preventDefault()}
              onClick={resetToAll}
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        id="generation-listbox"
        role="listbox"
        aria-label="Generations"
        aria-multiselectable
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
              <CommandEmpty>No generations match.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filtered.map((opt, i) => (
                  <CommandItem
                    key={opt.value}
                    id={`gen-opt-${opt.value}`}
                    role="option"
                    aria-selected={isOptionSelected(opt)}
                    value={opt.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setHighlightIndex(i)}
                    onSelect={() => applyOption(opt)}
                    className={cn(
                      'flex items-center gap-2',
                      i === highlightIndex && 'bg-accent text-accent-foreground',
                      isOptionSelected(opt) && i !== highlightIndex && 'bg-accent/40',
                    )}
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                      {opt.isClear ? (
                        selected.length === 0 ? (
                          <Check className="h-4 w-4" strokeWidth={2} />
                        ) : null
                      ) : isOptionSelected(opt) ? (
                        <Check className="h-4 w-4" strokeWidth={2} />
                      ) : null}
                    </span>
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
