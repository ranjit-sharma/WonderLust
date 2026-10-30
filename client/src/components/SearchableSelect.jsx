import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Search, X } from "lucide-react";

export default function SearchableSelect({
  id,
  name,
  value = "",
  onChange,
  options = [],
  getIcon,
  placeholder = "Select an option",
  searchPlaceholder,
  searchable,
  required = false,
  clearable = true,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Normalize options into a uniform array of { value, label, icon }
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "object" && opt !== null) {
        return {
          value: String(opt.value),
          label: opt.label ?? String(opt.value),
          icon: opt.icon ?? (getIcon ? getIcon(opt.value) : undefined),
        };
      }
      return {
        value: String(opt),
        label: String(opt),
        icon: getIcon ? getIcon(opt) : undefined,
      };
    });
  }, [options, getIcon]);

  // Determine if search bar should be displayed
  const showSearch = searchable !== undefined ? searchable : normalizedOptions.length > 5;

  // Selected option details
  const selectedOption = useMemo(
    () => normalizedOptions.find((o) => o.value === value),
    [normalizedOptions, value]
  );

  // Filtered options based on query
  const filtered = useMemo(() => {
    if (!query.trim()) return normalizedOptions;
    const q = query.toLowerCase().trim();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q)
    );
  }, [normalizedOptions, query]);

  // Derived search placeholder
  const effectiveSearchPlaceholder =
    searchPlaceholder ||
    `Search ${placeholder.toLowerCase().replace(/^(select|choose)\s*(a|an)?\s*/i, "")}...`;

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Reset query and set highlight on open
  useEffect(() => {
    if (open) {
      setQuery("");
      const initialIdx = filtered.findIndex((o) => o.value === value);
      setHighlightIndex(initialIdx >= 0 ? initialIdx : 0);
      if (showSearch) {
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } else {
      setHighlightIndex(-1);
    }
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (open && highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex];
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightIndex, open]);

  const handleSelect = (optValue) => {
    onChange?.(optValue);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.("");
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && filtered[highlightIndex]) {
        handleSelect(filtered[highlightIndex].value);
      }
    }
  };

  const SelectedIcon = selectedOption?.icon;

  return (
    <div ref={containerRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      {/* Hidden input for HTML5 form validation and FormData compatibility */}
      <input
        type="text"
        id={id}
        name={name || id}
        tabIndex={-1}
        required={required}
        value={value}
        onChange={() => {}}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`field flex items-center justify-between gap-2.5 text-left select-none cursor-pointer transition-all duration-200 ${
          open
            ? "border-brand-500 ring-4 ring-brand-500/15 dark:border-brand-500 dark:ring-brand-500/20"
            : "hover:border-neutral-400 dark:hover:border-neutral-600"
        } ${
          !value
            ? "text-neutral-400 dark:text-neutral-500"
            : "text-neutral-900 dark:text-neutral-100 font-medium"
        }`}
      >
        <span className="flex items-center gap-2.5 truncate">
          {SelectedIcon && (
            <SelectedIcon className="size-4 shrink-0 text-brand-500" strokeWidth={2.2} />
          )}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>

        <div className="flex items-center gap-1.5 shrink-0 text-neutral-400">
          {clearable && value && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              title="Clear selection"
              className="grid size-5 place-items-center rounded-full hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              <X className="size-3.5" />
            </span>
          )}
          <ChevronDown
            className={`size-4 text-brand-500 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-white/80 bg-[#ebf0f7] shadow-lift backdrop-blur-xl dark:border-white/5 dark:bg-[#181b25]"
          >
            {/* Search Input */}
            {showSearch && (
              <div className="flex items-center gap-2 border-b border-neutral-100 px-3.5 py-2.5 dark:border-neutral-800/80">
                <Search className="size-4 shrink-0 text-brand-500" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlightIndex(0);
                  }}
                  placeholder={effectiveSearchPlaceholder}
                  className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setHighlightIndex(0);
                    }}
                    className="grid size-5 shrink-0 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            )}

            {/* Options List */}
            <ul
              ref={listRef}
              role="listbox"
              className="no-scrollbar max-h-60 overflow-y-auto p-1.5 text-sm"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
                  No match found for "{query}"
                </li>
              ) : (
                filtered.map((opt, index) => {
                  const isSelected = opt.value === value;
                  const isHighlighted = index === highlightIndex;
                  const ItemIcon = opt.icon;

                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt.value)}
                      onMouseEnter={() => setHighlightIndex(index)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 transition-colors ${
                        isSelected
                          ? "bg-brand-50 font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                          : isHighlighted
                          ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                          : "text-neutral-800 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800/80"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        {ItemIcon && (
                          <ItemIcon
                            className={`size-4 shrink-0 ${
                              isSelected ? "text-brand-500" : "text-neutral-400 dark:text-neutral-500"
                            }`}
                            strokeWidth={2}
                          />
                        )}
                        <span className="truncate">{opt.label}</span>
                      </span>
                      {isSelected && <Check className="size-4 shrink-0 text-brand-500" />}
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
