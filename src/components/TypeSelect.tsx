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

type TypeOption = { value: string; label: string };

export function TypeSelect() {
  const inputRef = useRef<HTMLInputElement>(null);
  const typeSlugs = useSelector(() => app.availableTypeSlugs.get());
  const selected = useSelector(() => app.state.ui.selectedTypeFilter.get());
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);

  const options = useMemo((): TypeOption[] => {
    const rows: TypeOption[] = [{ value: 'all', label: 'All types' }];
    for (const slug of typeSlugs) {
      rows.push({
        value: slug,
        label: slug.charAt(0).toUpperCase() + slug.slice(1),
      });
    }
    return rows;
  }, [typeSlugs]);

  const selectedLabel = useMemo(() => {
    if (selected === 'all') return 'All types';
    return selected.charAt(0).toUpperCase() + selected.slice(1);
  }, [selected]);

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!needle) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(needle) || o.value.toLowerCase().includes(needle),
    );
  }, [options, needle]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [needle]);

  useEffect(() => {
    setHighlightIndex((i) => Math.min(i, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  const displayValue = open ? query : selectedLabel;

  function selectOption(value: string) {
    app.state.ui.selectedTypeFilter.set(value === 'all' ? 'all' : value.toLowerCase());
    setOpen(false);
    setQuery('');
    setHighlightIndex(0);
  }

  function resetToAll(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    selectOption('all');
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
      if (opt) selectOption(opt.value);
    }
  }

  const activeId =
    filtered.length > 0 ? `type-opt-${filtered[highlightIndex]?.value}` : undefined;

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
            aria-controls="type-listbox"
            aria-activedescendant={activeId}
            placeholder="Pokémon type…"
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
          {selected !== 'all' && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              tabIndex={-1}
              aria-label="Reset to all types"
              title="All types"
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
        id="type-listbox"
        role="listbox"
        aria-label="Pokémon types"
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
              <CommandEmpty>No types match.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filtered.map((opt, i) => (
                  <CommandItem
                    key={opt.value}
                    id={`type-opt-${opt.value}`}
                    role="option"
                    aria-selected={opt.value === selected}
                    value={opt.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setHighlightIndex(i)}
                    onSelect={() => selectOption(opt.value)}
                    className={cn(
                      i === highlightIndex && 'bg-accent text-accent-foreground',
                      opt.value === selected && i !== highlightIndex && 'bg-accent/40',
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
