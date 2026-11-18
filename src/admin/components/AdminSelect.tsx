import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

interface AdminSelectProps {
  label: string;
  icon?: ReactNode;
  variant?: 'compact' | 'field';
  highlight?: boolean;
  value: string;
  choices: { value: string; label: string; disabled?: boolean }[];
  onChange: (value: string) => void;
  search?: { label: string; empty: string; locale: string };
}

export function AdminSelect({ label, icon, value, choices, onChange, search, variant = 'compact', highlight = false }: AdminSelectProps) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement & { showPopover(options?: { source: HTMLElement }): void }>(null);
  const input = useRef<HTMLInputElement>(null);
  const wasOpenOnPointerDown = useRef(false);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const normalize = (text: string) => text.toLocaleLowerCase(search?.locale).normalize('NFD').replace(/\p{M}/gu, '');
  const visible = choices.filter(choice => normalize(choice.label).includes(normalize(query.trim())));
  const selected = choices.find(choice => choice.value === value) ?? choices[0];

  useEffect(() => {
    if (!open) return;
    function dismiss(event: Event) {
      const popup = panel.current;
      if (popup?.matches(':popover-open') && !(event.target instanceof Node && popup.contains(event.target))) {
        popup.hidePopover();
      }
    }
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);
    return () => {
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
    };
  }, [open]);

  function options() {
    return Array.from(panel.current?.querySelectorAll<HTMLButtonElement>('[role="option"]:not(:disabled)') ?? []);
  }

  function show() {
    const button = trigger.current!;
    const popup = panel.current!;
    if (popup.matches(':popover-open')) {
      popup.hidePopover();
      return;
    }
    const rect = button.getBoundingClientRect();
    const width = Math.min(search ? 256 : Math.max(192, rect.width), window.innerWidth - 24);
    const below = window.innerHeight - rect.bottom - 16;
    const above = rect.top - 16;
    const flip = below < (search ? 290 : 145) && above > below;
    popup.style.width = width + 'px';
    popup.style.left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)) + 'px';
    popup.style.top = flip ? 'auto' : rect.bottom + 6 + 'px';
    popup.style.bottom = flip ? window.innerHeight - rect.top + 6 + 'px' : 'auto';
    popup.style.maxHeight = Math.min(search ? 324 : 180, Math.max(0, flip ? above : below)) + 'px';
    popup.showPopover({ source: button });
    const currentOption = options().find(option => option.getAttribute('aria-selected') === 'true');
    if (input.current && currentOption) {
      const list = currentOption.parentElement!;
      list.scrollTop = currentOption.offsetTop - list.offsetTop - list.clientHeight / 2;
    }
    (input.current ?? currentOption ?? options()[0])?.focus({ preventScroll: true });
  }

  function navigate(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      panel.current?.hidePopover();
      trigger.current?.focus();
      return;
    }
    const items = options();
    const current = items.findIndex(option => option === document.activeElement);
    if (event.key === 'Enter' && event.target === input.current && items.length) {
      event.preventDefault();
      items[0].click();
      return;
    }
    if (!items.length) return;
    const next = {
      ArrowDown: Math.min(current + 1, items.length - 1),
      ArrowUp: current < 0 ? items.length - 1 : Math.max(0, current - 1),
      Home: 0,
      End: items.length - 1,
    }[event.key];
    if (next === undefined || (current < 0 && ['Home', 'End'].includes(event.key))) return;
    event.preventDefault();
    if (event.key === 'ArrowUp' && current === 0 && input.current) input.current.focus();
    else items[next].focus();
  }

  return (
    <div className="ca-admin-select" data-variant={variant}>
      <button ref={trigger} type="button" className="ca-admin-select-trigger"
        aria-label={label + ': ' + selected.label} aria-haspopup="listbox" aria-expanded={open}
        aria-controls={id} data-filtered={highlight && value !== ''}
        onPointerDown={() => {
          wasOpenOnPointerDown.current = panel.current?.matches(':popover-open') ?? false;
        }}
        onClick={event => {
          if (event.detail > 0 && wasOpenOnPointerDown.current) {
            if (panel.current?.matches(':popover-open')) panel.current.hidePopover();
            return;
          }
          show();
        }}
        onKeyDown={event => {
          if (!open && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault();
            show();
          }
        }}>
        {icon}<span>{selected.label}</span><ChevronDown size={14} aria-hidden="true" />
      </button>
      <div ref={panel} popover="auto" className="ca-admin-select-popup" onKeyDown={navigate}
        onToggle={event => {
          setOpen(event.newState === 'open');
          if (event.newState === 'closed') setQuery('');
        }}
        onBlur={event => {
          if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)
            && event.relatedTarget !== trigger.current) panel.current?.hidePopover();
        }}>
        {search && (
          <label className="ca-admin-select-search">
            <Search size={15} aria-hidden="true" />
            <input ref={input} type="search" aria-label={search.label} placeholder={search.label}
              value={query} onChange={event => setQuery(event.target.value)} />
          </label>
        )}
        <div id={id} role="listbox" aria-label={label} className="ca-admin-select-options">
          {visible.map(choice => (
            <button key={choice.value} type="button" role="option" tabIndex={-1} disabled={choice.disabled}
              aria-selected={choice.value === value}
              onClick={() => {
                onChange(choice.value);
                panel.current?.hidePopover();
                trigger.current?.focus();
              }}>
              <span>{choice.label}</span>
              {choice.value === value && <Check size={15} aria-hidden="true" />}
            </button>
          ))}
          {visible.length === 0 && <div className="ca-admin-select-empty" role="status">{search?.empty}</div>}
        </div>
      </div>
    </div>
  );
}
