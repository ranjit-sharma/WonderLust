import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Search, X } from "lucide-react";

export default function SearchableSelect({
  id,
  value = "",
  onChange,
  options = [],
  placeholder = "Select an option",
  required = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close when clicking outside
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

  // Focus search input on open and reset query
  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = query.trim()
    ? options.filter((opt) => opt.toLowerCase().includes(query.toLowerCase().trim()))
    : options;

  const handleSelect = (opt) => {
    onChange(opt);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden input for HTML5 required form validation */}
      <input
        type="text"
        id={id}
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
        className={`field flex items-center justify-between gap-2 text-left select-none ${
          !value ? "text-neutral-400 dark:text-neutral-500" : "text-neutral-900 dark:text-neutral-100 font-medium"
        }`}
      >
        <span className="truncate">{value || placeholder}</span>
        <div className="flex items-center gap-1.5 shrink-0 text-neutral-400">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              title="Clear selection"
              className="grid size-5 place-items-center rounded-full hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X className="size-3.5" />
            </span>
          )}
          <ChevronDown className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
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
            className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lift backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900"
          >
            {/* Search Input */}
            <div className="flex items-center gap-2 border-b border-neutral-100 px-3.5 py-2.5 dark:border-neutral-800">
              <Search className="size-4 shrink-0 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country..."
                className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="grid size-5 shrink-0 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Options List */}
            <ul role="listbox" className="no-scrollbar max-h-60 overflow-y-auto p-1.5 text-sm">
              {filtered.length === 0 ? (
                <li className="px-3 py-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
                  No country found matching "{query}"
                </li>
              ) : (
                filtered.map((opt) => {
                  const isSelected = opt === value;
                  return (
                    <li
                      key={opt}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 transition-colors ${
                        isSelected
                          ? "bg-brand-50 font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                          : "text-neutral-800 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800/80"
                      }`}
                    >
                      <span>{opt}</span>
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
