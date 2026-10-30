import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { Compass } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";
import { safeNext } from "../lib/format.js";
import { Spinner, ease } from "../components/ui.jsx";

const AUTH_IMAGE = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80";

function AuthLayout({ title, text, children, footer }) {
  return (
    <div className="container-page grid min-h-[calc(100dvh-12rem)] items-center gap-10 py-10 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease }}
        className="relative hidden h-full min-h-[560px] overflow-hidden rounded-card lg:block"
      >
        <motion.img
          src={AUTH_IMAGE}
          alt=""
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease }}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-10 bottom-10 text-white">
          <p className="text-3xl leading-tight font-extrabold">Some places you visit.<br />Some places you remember.</p>
          <p className="mt-3 max-w-sm text-white/80">Discover stays with character and hosts who make you feel at home.</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease }}
        className="mx-auto w-full max-w-md"
      >
        <div className="flex items-center gap-2 text-brand-500">
          <Compass className="size-7" />
          <span className="font-extrabold">WonderLust</span>
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{text}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">{footer}</p>
      </motion.div>
    </div>
  );
}

function useAuthForm(endpoint, successMessage) {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const next = safeNext(params.get("next"));

  const submit = async (body) => {
    setBusy(true);
    try {
      setUser(await api(endpoint, { method: "POST", body }));
      toast(successMessage);
      navigate(next, { replace: true });
    } catch (err) {
      toast(err.message, "error");
      setBusy(false);
    }
  };

  return { user, busy, submit, next, query: params.toString() };
}

function Field({ id, label, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} name={id} required className="field" {...props} />
    </div>
  );
}

export function Login() {
  const { user, busy, submit, next, query } = useAuthForm("/login", "Welcome back to WonderLust!");
  if (user && !busy) return <Navigate to={next} replace />;

  const onSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    submit({ username: form.get("username"), password: form.get("password") });
  };

  return (
    <AuthLayout
      title="Welcome back"
      text="Your next great adventure awaits. Log in to unlock exclusive stays and connect with hosts around the world."
      footer={<>New to WonderLust? <Link to={`/signup?${query}`} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">Create an account</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Field id="username" label="Username" autoComplete="username" />
        <Field id="password" label="Password" type="password" autoComplete="current-password" />
        <button className="btn-primary w-full py-3.5 text-base" disabled={busy}>
          {busy && <Spinner />} Log in
        </button>
      </form>
    </AuthLayout>
  );
}

export function Signup() {
  const { user, busy, submit, next, query } = useAuthForm("/signup", "Welcome to WonderLust");
  if (user && !busy) return <Navigate to={next} replace />;

  const onSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    submit({ username: form.get("username"), email: form.get("email"), password: form.get("password") });
  };

  return (
    <AuthLayout
      title="Join WonderLust"
      text="From quiet escapes to unforgettable adventures, create an account and find a place that feels like yours."
      footer={<>Already have an account? <Link to={`/login?${query}`} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">Log in</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Field id="username" label="Username" autoComplete="username" />
        <Field id="email" label="Email" type="email" autoComplete="email" />
        <Field id="password" label="Password" type="password" autoComplete="new-password" />
        <button className="btn-primary w-full py-3.5 text-base" disabled={busy}>
          {busy && <Spinner />} Create account
        </button>
      </form>
    </AuthLayout>
  );
}
