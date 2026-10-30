import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, CircleCheck, X } from "lucide-react";

const ToastContext = createContext(() => {});

// A counter, not crypto.randomUUID(): that only exists on HTTPS/localhost, so toasts
// would crash when testing from a phone over http://<LAN-IP>.
let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (message, type = "success") => {
      const id = ++nextId;
      setToasts((list) => [...list.slice(-2), { id, message, type }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:top-20 sm:right-6 sm:bottom-auto sm:left-auto sm:items-end"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              role={t.type === "error" ? "alert" : "status"}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-neutral-200 bg-white/95 px-4 py-3 text-sm shadow-lift backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95"
            >
              {t.type === "error" ? (
                <CircleAlert className="mt-0.5 size-5 shrink-0 text-brand-500" />
              ) : (
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-500" />
              )}
              <p className="flex-1 font-medium">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-full p-0.5 text-neutral-400 transition hover:text-neutral-900 dark:hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
