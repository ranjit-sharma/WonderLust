import { useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Accessibility,
  ArrowRight,
  CalendarCheck,
  CalendarX,
  ChevronDown,
  CircleHelp,
  Compass,
  FileText,
  Handshake,
  Heart,
  House,
  LifeBuoy,
  ListChecks,
  Lock,
  MessageSquareText,
  MessagesSquare,
  SearchCheck,
  ShieldCheck,
  Star,
  TriangleAlert,
  Umbrella,
  UserPlus,
  Users,
} from "lucide-react";
import { api } from "../lib/api.js";
import { accents } from "../lib/categories.js";
import { useToast } from "../lib/toast.jsx";
import { Reveal, Spinner, ease } from "../components/ui.jsx";

function Hero({ icon: Icon, eyebrow, title, text }) {
  return (
    <section className="relative overflow-hidden rounded-card bg-linear-to-br from-brand-50 via-violet-50 to-sky-50 px-6 py-14 text-center sm:px-12 sm:py-20 dark:from-brand-500/10 dark:via-violet-500/5 dark:to-sky-500/10">
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-brand-500/10 blur-2xl will-change-transform"
      />
      <motion.span
        initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="mx-auto grid size-16 place-items-center rounded-2xl bg-white text-brand-500 shadow-card dark:bg-neutral-900"
      >
        <Icon className="size-8" />
      </motion.span>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease }}>
        <p className="mt-6 text-sm font-semibold tracking-wide text-brand-500 uppercase">{eyebrow}</p>
        <h1 className="mx-auto mt-2 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-neutral-600 sm:text-lg dark:text-neutral-400">{text}</p>
      </motion.div>
    </section>
  );
}

function Page({ children }) {
  return <div className="container-page max-w-5xl space-y-8 py-8 sm:py-12">{children}</div>;
}

function Topic({ icon: Icon, title, text, link, delay, accent }) {
  return (
    <Reveal delay={delay} className="card group p-6 transition duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift">
      <span className={`grid size-12 place-items-center rounded-2xl transition duration-300 ease-smooth group-hover:scale-110 ${accent.tint} ${accent.text}`}>
        <Icon className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-bold">{title}</h2>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">{text}</p>
      {link && (
        <Link to={link[0]} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
          {link[1]} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </Link>
      )}
    </Reveal>
  );
}

function TopicGrid({ topics, cols = "md:grid-cols-2" }) {
  return (
    <div className={`grid gap-4 ${cols}`}>
      {topics.map((t, i) => <Topic key={t.title} {...t} delay={(i % 3) * 0.08} accent={accents[i % accents.length]} />)}
    </div>
  );
}

function Story({ eyebrow, title, paragraphs, cta }) {
  return (
    <Reveal className="card grid gap-6 p-8 sm:p-10 md:grid-cols-[1fr_1.4fr]">
      <div>
        <p className="text-sm font-semibold tracking-wide text-brand-500 uppercase">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      <div className="space-y-4 text-neutral-600 dark:text-neutral-400">
        {paragraphs.map((p) => <p key={p}>{p}</p>)}
        {cta && <Link to={cta[0]} className="btn-primary mt-2">{cta[1]}</Link>}
      </div>
    </Reveal>
  );
}

function Prose({ sections }) {
  return (
    <Reveal className="card space-y-8 p-8 sm:p-10">
      {sections.map(([heading, text]) => (
        <div key={heading}>
          <h2 className="text-xl font-bold">{heading}</h2>
          <p className="mt-2 leading-relaxed text-neutral-600 dark:text-neutral-400">{text}</p>
        </div>
      ))}
    </Reveal>
  );
}

export function About() {
  return (
    <Page>
      <Hero icon={Compass} eyebrow="Find somewhere memorable" title="About WonderLust" text="A simple way to discover welcoming stays, share special places, and plan your next escape." />
      <Story
        eyebrow="Our idea"
        title="Travel should feel personal."
        paragraphs={[
          "WonderLust brings guests and hosts together through a focused, easy-to-use experience. Browse inspiring places, compare the details that matter, save favorites, and reserve a stay that feels right for you.",
          "Whether you are planning a quiet weekend, a mountain adventure, or a city escape, WonderLust helps you move from curiosity to a place worth remembering.",
        ]}
        cta={["/listings", "Start exploring"]}
      />
      <TopicGrid
        cols="md:grid-cols-3"
        topics={[
          { icon: Compass, title: "Explore freely", text: "Discover stays across distinctive categories and destinations." },
          { icon: Handshake, title: "Host confidently", text: "Share your space with clear tools for listings and reservations." },
          { icon: Star, title: "Choose thoughtfully", text: "Use reviews, ratings, details, and maps to make informed choices." },
        ]}
      />
    </Page>
  );
}

export function CoHosts() {
  return (
    <Page>
      <Hero icon={Users} eyebrow="Host with confidence" title="Find a co-host" text="Get support from someone who can help you manage your WonderLust listing and create a great guest experience." />
      <Story
        eyebrow="A little extra support"
        title="Share the hosting journey."
        paragraphs={["A co-host can help with guest communication, listing updates, check-in coordination, and keeping your place ready. Choose someone you trust and agree on responsibilities before sharing access."]}
        cta={["/listings/new", "Create a listing"]}
      />
      <TopicGrid
        topics={[
          { icon: MessagesSquare, title: "Stay connected", text: "Work together on guest questions, arrival details, and thoughtful communication." },
          { icon: ListChecks, title: "Divide responsibilities", text: "Share practical tasks such as updates, preparation, and reservation support." },
          { icon: Lock, title: "Choose carefully", text: "Only work with someone you know and trust. Keep account credentials private and discuss access clearly." },
          { icon: CircleHelp, title: "Need guidance?", text: "Visit the Help Center for more information about hosting and managing your listing.", link: ["/help", "Open Help Center"] },
        ]}
      />
    </Page>
  );
}

export function ReferHost() {
  return (
    <Page>
      <Hero icon={UserPlus} eyebrow="Share the WonderLust experience" title="Refer a host" text="Know someone with a memorable place to share? Invite them to become part of the WonderLust hosting community." />
      <Story
        eyebrow="Help a great place get discovered"
        title="Every stay starts with a recommendation."
        paragraphs={["Tell a friend, family member, or local host about WonderLust. They can create a listing, share their space, and welcome guests looking for their next memorable stay."]}
        cta={["/listings/new", "Become a host"]}
      />
    </Page>
  );
}

export function Help() {
  return (
    <Page>
      <Hero icon={LifeBuoy} eyebrow="We are here to help" title="Help Center" text="Find quick guidance for discovering stays, managing your listing, and handling reservations." />
      <TopicGrid
        topics={[
          { icon: SearchCheck, title: "Finding a stay", text: "Use the destination search, categories, price range, and rating filters on Explore to narrow your options.", link: ["/listings", "Explore listings"] },
          { icon: House, title: "Hosting your home", text: "Create a listing with clear photos, accurate details, a category, location, and price so guests know what to expect.", link: ["/listings/new", "Create a listing"] },
          { icon: CalendarCheck, title: "Bookings and cancellations", text: "Review reservations from your profile. Booking owners can cancel eligible reservations from the confirmation or profile page.", link: ["/profile", "View your profile"] },
          { icon: Heart, title: "Wishlist", text: "Save places you love with the heart icon and revisit them anytime from My Wishlist.", link: ["/wishlist", "Open wishlist"] },
        ]}
      />
      <Reveal className="card p-8 text-center">
        <h2 className="text-xl font-bold">Still need help?</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Check the <Link to="/questions" className="font-semibold text-brand-600 underline dark:text-brand-400">Q&amp;A page</Link> for common answers, or sign in to manage your account and bookings.
        </p>
      </Reveal>
    </Page>
  );
}

const faqs = [
  ["How do I search for a destination?", "Enter a location in the search bar and select Search. You can also use categories and the filters button to refine the results."],
  ["How do I create a listing?", "Sign in, choose Become a host from the navigation, complete the form, select a category, and upload a listing image."],
  ["Where can I see my bookings?", "Open your Profile while signed in. Your reservations appear in the bookings section with their current status."],
  ["Can I cancel a booking?", "Open the booking confirmation or your profile, then use the cancellation option when it is available for that reservation."],
  ["How do I save a listing?", "Select the heart icon on a listing card or listing detail page. Saved listings are available under My Wishlist."],
  ["How do I change the theme?", "Use the moon or sun icon in the navigation bar to switch between light and dark mode. Your preference is remembered on this device."],
];

export function Questions() {
  const [open, setOpen] = useState(0);
  return (
    <Page>
      <Hero icon={CircleHelp} eyebrow="Answers at a glance" title="Questions & answers" text="Common questions about using WonderLust as a guest or host." />
      <Reveal className="card divide-y divide-neutral-200 px-6 dark:divide-neutral-800">
        {faqs.map(([q, a], i) => (
          <div key={q}>
            <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 py-5 text-left font-semibold">
              {q}
              <motion.span animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown className="size-5 shrink-0" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease }}
                  className="overflow-hidden text-neutral-600 dark:text-neutral-400"
                >
                  <span className="block pb-5">{a}</span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </Reveal>
    </Page>
  );
}

export function Privacy() {
  return (
    <Page>
      <Hero icon={ShieldCheck} eyebrow="Your trust matters" title="Privacy at WonderLust" text="We collect and use information responsibly so you can discover stays with confidence." />
      <Prose
        sections={[
          ["What we collect", "When you create an account, list a property, make a booking, or contact us, we may collect details such as your name, email address, listing information, and booking preferences."],
          ["How we use your information", "We use this information to provide and improve WonderLust, process bookings, keep accounts secure, personalize your experience, and communicate important updates about the service."],
          ["Information sharing", "We only share information when it is needed to provide the service, comply with the law, protect our users, or operate trusted infrastructure. We do not sell your personal information."],
          ["Your choices", "You can review your account information, manage your listings and bookings, or contact us with questions about your data. We may update this policy as WonderLust grows."],
        ]}
      />
    </Page>
  );
}

export function Terms() {
  return (
    <Page>
      <Hero icon={FileText} eyebrow="Simple and transparent" title="Terms of service" text="These guidelines help keep WonderLust welcoming, reliable, and useful for everyone." />
      <Prose
        sections={[
          ["Using WonderLust", "You agree to provide accurate account information, keep your login details secure, and use the platform lawfully. You are responsible for activity carried out through your account."],
          ["Listings and bookings", "Hosts are responsible for accurate listing details, availability, pricing, and a safe guest experience. Guests are responsible for respecting the property and following the host's reasonable instructions."],
          ["Respectful conduct", "Do not misuse the platform, upload harmful or misleading content, interfere with other users, or attempt to access accounts or data that do not belong to you."],
          ["Changes and availability", "We may improve, update, or temporarily suspend parts of WonderLust. We will make reasonable efforts to keep the service available and communicate important changes."],
        ]}
      />
    </Page>
  );
}

const supportPages = {
  safety: {
    title: "Safety support",
    eyebrow: "Your safety matters",
    icon: ShieldCheck,
    summary: "If something feels unsafe during a stay or while using WonderLust, move to a safe place first and contact the appropriate local emergency service.",
    sections: [
      ["During an emergency", "Call your local emergency service immediately. WonderLust cannot replace local emergency responders."],
      ["After the immediate danger", "Keep relevant booking details, messages, and evidence. Contact the host or guest only when it is safe to do so."],
      ["Tell us what happened", "Use our neighbourhood concern form for a detailed report, or contact the WonderLust team through the Help Center."],
    ],
  },
  aircover: {
    title: "AirCover information",
    eyebrow: "Help for your stay",
    icon: Umbrella,
    summary: "WonderLust helps you understand your reservation details and connect with the right support when a stay does not go as expected.",
    sections: [
      ["Before you book", "Review the listing description, photos, amenities, location, reviews, and cancellation details carefully."],
      ["A problem during your stay", "Document the issue, contact the host through the available booking information, and keep communication clear."],
      ["Need help?", "Visit the Help Center and include your booking details when explaining the issue so it can be reviewed efficiently."],
    ],
  },
  discrimination: {
    title: "Anti-discrimination",
    eyebrow: "Everyone belongs here",
    icon: Users,
    summary: "WonderLust is committed to a respectful community where guests and hosts are treated fairly and with dignity.",
    sections: [
      ["Our expectation", "Users must not discriminate against another person based on protected characteristics or use hateful, threatening, or degrading language."],
      ["If you experience discrimination", "Write down what happened, save relevant messages, and report the concern so it can be reviewed."],
      ["Building a welcoming community", "Use accurate listing information, communicate respectfully, and make decisions based on the stay and the person’s conduct."],
    ],
  },
  accessibility: {
    title: "Disability support",
    eyebrow: "Designed for more people",
    icon: Accessibility,
    summary: "We want WonderLust to be easier to use for people with different access needs and welcome feedback that helps us improve.",
    sections: [
      ["Finding useful details", "Hosts should describe important access information accurately, including entrances, stairs, bathrooms, and other relevant features."],
      ["Ask before booking", "If you need a specific accommodation, contact the host before confirming so expectations are clear."],
      ["Share feedback", "Contact the WonderLust team through the Help Center if a page or listing creates an accessibility barrier."],
    ],
  },
  cancellation: {
    title: "Cancellation options",
    eyebrow: "Plans can change",
    icon: CalendarX,
    summary: "Cancellation availability depends on the reservation and the applicable booking terms.",
    sections: [
      ["Check your reservation", "Open your booking confirmation or Profile to review the reservation status and available cancellation action."],
      ["Before cancelling", "Review the dates, price details, and any applicable terms. Cancelled bookings no longer block those dates for future reservations."],
      ["Need help with a cancellation?", "Contact the host where appropriate and use the Help Center if you cannot resolve the issue."],
    ],
  },
};

export function SupportDetail() {
  const { slug } = useParams();
  const page = supportPages[slug];
  if (!page) return <Navigate to="/help" replace />;
  return (
    <Page>
      <Hero icon={page.icon} eyebrow={page.eyebrow} title={page.title} text={page.summary} />
      <Prose sections={page.sections} />
      <div className="text-center">
        <Link to="/help" className="btn-primary">Visit Help Center</Link>
      </div>
    </Page>
  );
}

function SupportForm({ endpoint, fields, submitLabel, successMessage }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    try {
      await api(endpoint, { method: "POST", body: Object.fromEntries(new FormData(form)) });
      toast(successMessage);
      form.reset();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Reveal>
      <form onSubmit={submit} className="card mx-auto grid max-w-2xl gap-5 p-6 sm:grid-cols-2 sm:p-10">
        <div>
          <label htmlFor="name" className="label">Your name</label>
          <input id="name" name="name" required className="field" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <input id="email" name="email" type="email" required className="field" autoComplete="email" />
        </div>
        {fields}
        <button className="btn-primary sm:col-span-2" disabled={busy}>
          {busy && <Spinner className="size-4" />} {submitLabel}
        </button>
      </form>
    </Reveal>
  );
}

export function Feedback() {
  return (
    <Page>
      <Hero icon={MessageSquareText} eyebrow="Help us improve" title="Share your feedback" text="Tell us what you enjoyed, what we can improve, or what would make your WonderLust experience better." />
      <SupportForm
        endpoint="/feedback"
        submitLabel="Send feedback"
        successMessage="Thank you for sharing your feedback with WonderLust."
        fields={
          <>
            <div className="sm:col-span-2">
              <label htmlFor="rating" className="label">How was your experience?</label>
              <select id="rating" name="rating" required defaultValue="" className="field">
                <option value="" disabled>Choose a rating</option>
                <option value="5">Excellent</option>
                <option value="4">Good</option>
                <option value="3">Okay</option>
                <option value="2">Needs improvement</option>
                <option value="1">Poor</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="message" className="label">Your feedback</label>
              <textarea id="message" name="message" rows={6} required placeholder="Share your thoughts..." className="field resize-y" />
            </div>
          </>
        }
      />
    </Page>
  );
}

export function NeighbourhoodConcern() {
  return (
    <Page>
      <Hero icon={TriangleAlert} eyebrow="Community support" title="Report a neighbourhood concern" text="Tell us about a serious issue connected to a WonderLust listing or stay. We will review the details you provide." />
      <SupportForm
        endpoint="/support/neighbourhood-concern"
        submitLabel="Submit concern"
        successMessage="Your neighbourhood concern has been submitted."
        fields={
          <>
            <div className="sm:col-span-2">
              <label htmlFor="reference" className="label">Listing or booking reference <span className="font-normal text-neutral-400">(optional)</span></label>
              <input id="reference" name="reference" className="field" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="concern" className="label">What happened?</label>
              <textarea id="concern" name="concern" rows={6} required className="field resize-y" />
            </div>
          </>
        }
      />
    </Page>
  );
}

export function NotFound() {
  return (
    <Page>
      <Hero icon={Compass} eyebrow="Error 404" title="Page Not Found!" text="The page you're looking for has wandered off. Let's get you back to exploring." />
      <div className="text-center">
        <Link to="/listings" className="btn-primary">Explore stays</Link>
      </div>
    </Page>
  );
}
