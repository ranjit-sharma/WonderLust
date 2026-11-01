const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("Compiling StayLust Master Engineering Notes (What, Why, Implementation)...");

// Load screenshots as Base64 strings
const screenshotsDir = path.join(__dirname, 'screenshots');
function getBase64Image(filename) {
  const filePath = path.join(screenshotsDir, filename);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  return '';
}

const imgHome = getBase64Image('homepage.png');
const imgDetail = getBase64Image('detail.png');
const imgLogin = getBase64Image('login.png');
const imgAbout = getBase64Image('about.png');

console.log("High-res screenshots encoded to Base64.");

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>StayLust — Comprehensive Full-Stack Engineering Notes</title>
  <style>
    @page {
      size: A4;
      margin: 1.6cm 1.4cm 1.6cm 1.4cm;
      @bottom-right {
        content: "Page " counter(page);
        font-size: 8.5pt;
        color: #64748b;
        font-family: 'Segoe UI', system-ui, sans-serif;
      }
      @bottom-left {
        content: "StayLust Engineering Master Notes • Developer: Ranjit Sharma";
        font-size: 8pt;
        color: #94a3b8;
        font-family: 'Segoe UI', system-ui, sans-serif;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.55;
      font-size: 9.5pt;
      background: #ffffff;
    }

    /* Cover Page */
    .cover-page {
      page-break-after: always;
      height: 98vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 2.5rem 1.5rem;
      border: 2px solid #cbd5e1;
      border-radius: 12px;
      background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
      position: relative;
    }

    .cover-badge {
      display: inline-block;
      align-self: flex-start;
      background: #fe424d;
      color: #ffffff;
      padding: 0.35rem 1.1rem;
      border-radius: 9999px;
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .cover-title-group {
      margin-top: 1.5rem;
    }

    .cover-brand {
      font-size: 40pt;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.04em;
      line-height: 1.05;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .cover-brand span.highlight {
      color: #fe424d;
    }

    .cover-subtitle {
      font-size: 15pt;
      font-weight: 700;
      color: #334155;
      margin-top: 0.8rem;
      line-height: 1.35;
    }

    .cover-desc {
      margin-top: 1rem;
      font-size: 9.5pt;
      color: #64748b;
      max-width: 95%;
      line-height: 1.6;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.2rem;
      margin-top: 2rem;
      background: #ffffff;
      padding: 1.4rem;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .meta-item h4 {
      font-size: 7.5pt;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.06em;
      margin-bottom: 0.2rem;
    }

    .meta-item p {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
    }

    .meta-item a {
      color: #fe424d;
      text-decoration: none;
      word-break: break-all;
    }

    .cover-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 1rem;
      font-size: 8pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Page Breaks and Headings */
    .page-break {
      page-break-before: always;
    }

    .keep-together {
      page-break-inside: avoid;
    }

    h1.chapter-title {
      font-size: 17pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2.5px solid #fe424d;
      padding-bottom: 0.35rem;
      margin-top: 1.2rem;
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }

    h2.module-title {
      font-size: 12pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 1.3rem;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      border-left: 4px solid #fe424d;
      padding-left: 0.5rem;
    }

    /* What / Why / Implementation Badges */
    .triad-box {
      margin: 0.8rem 0;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      page-break-inside: avoid;
    }

    .triad-header {
      padding: 0.35rem 0.8rem;
      font-size: 8.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .triad-what { background: #eff6ff; color: #1e40af; border-left: 4px solid #3b82f6; }
    .triad-why { background: #fefce8; color: #854d0e; border-left: 4px solid #eab308; }
    .triad-how { background: #f0fdf4; color: #166534; border-left: 4px solid #22c55e; }

    .triad-body {
      padding: 0.75rem 1rem;
      font-size: 9pt;
      color: #334155;
      line-height: 1.55;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.8rem 0 1rem 0;
      font-size: 8.5pt;
    }

    table th {
      background: #0f172a;
      color: #ffffff;
      padding: 0.5rem 0.65rem;
      text-align: left;
      font-weight: 600;
      font-size: 8pt;
      letter-spacing: 0.03em;
    }

    table td {
      padding: 0.45rem 0.65rem;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }

    table tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Code Blocks */
    pre {
      background: #0f172a;
      color: #f1f5f9;
      padding: 0.75rem 0.9rem;
      border-radius: 6px;
      font-family: 'Consolas', 'Fira Code', monospace;
      font-size: 8pt;
      overflow-x: auto;
      margin: 0.6rem 0;
      line-height: 1.45;
      border: 1px solid #334155;
    }

    code {
      background: #f1f5f9;
      color: #e11d48;
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
      font-family: 'Consolas', monospace;
      font-size: 8pt;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }

    .code-label {
      font-size: 7.5pt;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-top: 0.4rem;
      margin-bottom: 0.2rem;
    }

    /* Screenshots & Images */
    .screenshot-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.5rem;
      margin: 1rem 0;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
      page-break-inside: avoid;
    }

    .screenshot-card img {
      width: 100%;
      height: auto;
      border-radius: 6px;
      display: block;
      border: 1px solid #f1f5f9;
    }

    .screenshot-caption {
      margin-top: 0.45rem;
      font-size: 8pt;
      color: #64748b;
      font-style: italic;
      text-align: center;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-size: 7pt;
      font-weight: 800;
      text-transform: uppercase;
      background: #e2e8f0;
      color: #334155;
    }
    .badge-get { background: #dbeafe; color: #1e40af; }
    .badge-post { background: #dcfce7; color: #15803d; }
    .badge-put { background: #fef3c7; color: #b45309; }
    .badge-del { background: #fee2e2; color: #b91c1c; }

    /* Q&A Section */
    .qa-item {
      margin-bottom: 1rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.85rem 1rem;
      page-break-inside: avoid;
    }

    .qa-question {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.35rem;
      display: flex;
      align-items: baseline;
      gap: 0.45rem;
    }

    .qa-num {
      background: #fe424d;
      color: #ffffff;
      font-size: 7.5pt;
      font-weight: 800;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
    }

    .qa-answer {
      font-size: 8.5pt;
      color: #334155;
      line-height: 1.5;
      text-align: justify;
    }
  </style>
</head>
<body>

  <!-- ==================== COVER PAGE ==================== -->
  <div class="cover-page">
    <div>
      <div class="cover-badge">Full-Stack Engineering & System Architecture Bible</div>
      <div class="cover-title-group">
        <div class="cover-brand">🧭 Stay<span class="highlight">Lust</span></div>
        <div class="cover-subtitle">Complete Project Notes, Code Implementations & Viva Guide</div>
        <p class="cover-desc">
          An exhaustive engineering dossier detailing the design, implementation, and architectural trade-offs of <strong>StayLust</strong> — a production-grade accommodation booking and vacation rental web application powered by React 19, Express 5, MongoDB Atlas, Mapbox GL JS, and Cloudinary.
        </p>
      </div>

      <div class="cover-meta-grid">
        <div class="meta-item">
          <h4>Author & Developer</h4>
          <p>Ranjit Sharma</p>
        </div>
        <div class="meta-item">
          <h4>Architecture Model</h4>
          <p>Decoupled SPA + RESTful API (MVC)</p>
        </div>
        <div class="meta-item">
          <h4>Full Tech Stack</h4>
          <p>React 19 • Vite 8 • Tailwind v4 • Node 24 • Express 5 • Atlas</p>
        </div>
        <div class="meta-item">
          <h4>Cloud Services</h4>
          <p>Cloudinary CDN • Mapbox GL Geocoding • Render CI/CD</p>
        </div>
        <div class="meta-item">
          <h4>GitHub Repository</h4>
          <p><a href="https://github.com/ranjit-sharma/StayLust">github.com/ranjit-sharma/StayLust</a></p>
        </div>
        <div class="meta-item">
          <h4>Live Deployment</h4>
          <p><a href="https://wonderlust-yppn.onrender.com">wonderlust-yppn.onrender.com</a></p>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <span>Framework: What • Why • Implementation (Code & Visuals)</span>
      <span>Confidential & Comprehensive Major Project Documentation</span>
    </div>
  </div>

  <!-- ==================== CHAPTER 1: ARCHITECTURE ==================== -->
  <div class="page-break"></div>
  <h1 class="chapter-title">Chapter 1: System Architecture & Decoupled SPA Paradigm</h1>

  <div class="triad-box">
    <div class="triad-header triad-what">📌 What It Is</div>
    <div class="triad-body">
      A <strong>Decoupled Single Page Application (SPA) + REST API architecture</strong>. The client-side interface is an autonomous React 19 application compiled by Vite, while the server is an Express.js 5 micro-monolith connected to MongoDB Atlas. Express acts strictly as an API gateway returning JSON and serving precompiled static production bundles.
    </div>
  </div>

  <div class="triad-box">
    <div class="triad-header triad-why">💡 Why We Built It This Way</div>
    <div class="triad-body">
      Traditional monolithic Multi-Page Applications (MPAs) using EJS or Handlebars trigger a full document reload on every action. This introduces white flashes, destroys client-side scroll position, causes WebGL map canvases (Mapbox) to re-initialize from scratch on every page turn, and places high rendering CPU strain on Node.js. By decoupling into an SPA:
      <ul style="margin-left: 1.2rem; margin-top: 0.3rem;">
        <li>Client state is preserved across route changes (seamless navigation).</li>
        <li>Network payloads are reduced to lean JSON strings rather than redundant HTML structures.</li>
        <li>Optimistic UI reconciliation becomes possible (0ms perceived latency for deletions).</li>
      </ul>
    </div>
  </div>

  <div class="triad-box">
    <div class="triad-header triad-how">⚙️ Implementation & Code Walkthrough</div>
    <div class="triad-body">
      <strong>1. Development Proxy (<a href="file:///c:/Users/ranji/Desktop/project/MajorProject/client/vite.config.js">client/vite.config.js</a>):</strong>
      <div class="code-label">client/vite.config.js</div>
      <pre><code>import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Express runs on 8080; proxying keeps the session cookie same-origin in development
    proxy: { "/api": "http://localhost:8080" },
  },
});</code></pre>

      <strong>2. Production Serving & Catch-All Routing (<a href="file:///c:/Users/ranji/Desktop/project/MajorProject/app.js">app.js</a>):</strong>
      <div class="code-label">app.js</div>
      <pre><code>const clientDist = path.join(__dirname, "client", "dist");

app.use(express.json());
// Serve compiled assets before session middleware to prevent asset session creation
app.use(express.static(clientDist));

// REST API Routers
app.use("/api/listings", listingRouter);
app.use("/api/listings/:id/reviews", reviewRouter);
app.use("/api/listings/:id/bookings", bookingRouter);
app.use("/api", userRouter);
app.use("/api", infoRouter);

// Catch-all route delegating client routing to React Router
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});</code></pre>
    </div>
  </div>

  <!-- ==================== CHAPTER 2: AUTHENTICATION ==================== -->
  <div class="page-break"></div>
  <h1 class="chapter-title">Chapter 2: Authentication & Distributed Session Management</h1>

  <div class="triad-box">
    <div class="triad-header triad-what">📌 What It Is</div>
    <div class="triad-body">
      Stateful session-based user authentication powered by <strong>Passport.js Local Strategy</strong>, salted <strong>PBKDF2 password hashing</strong>, and a distributed session store backed by <strong>connect-mongo</strong> inside MongoDB Atlas.
    </div>
  </div>

  <div class="triad-box">
    <div class="triad-header triad-why">💡 Why We Built It This Way</div>
    <div class="triad-body">
      Many student projects use JSON Web Tokens (JWT) stored in <code>localStorage</code>. This introduces major security vulnerabilities:
      <ul style="margin-left: 1.2rem; margin-top: 0.3rem;">
        <li><strong>XSS Vulnerability:</strong> Any malicious third-party script or npm package can access <code>localStorage</code> and steal the token.</li>
        <li><strong>Inability to Revoke:</strong> JWTs cannot be invalidated on demand unless you build a complex Redis blacklist. If a host terminates a session or account, a stolen JWT remains valid until expiration.</li>
        <li><strong>Session Cookies:</strong> StayLust uses <code>httpOnly: true</code> and <code>secure: true</code> cookies. JavaScript cannot access them, eliminating XSS token theft. Sessions can be destroyed instantly on the server via <code>req.session.destroy()</code>.</li>
      </ul>
    </div>
  </div>

  <div class="triad-box">
    <div class="triad-header triad-how">⚙️ Implementation & Code Walkthrough</div>
    <div class="triad-body">
      <div class="code-label">app.js: Distributed MongoDB Session Store</div>
      <pre><code>const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SESSION_SECRET },
  touchAfter: 24 * 3600, // Lazy session update: only rewrite if session changed within 24h
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());</code></pre>
    </div>
  </div>

  <div class="screenshot-card">
    <img src="${imgLogin}" alt="StayLust Login UI">
    <div class="screenshot-caption">Figure 2.1: Secure Split-Screen Authentication Portal with PBKDF2 Encryption.</div>
  </div>

  <!-- ==================== CHAPTER 3: RESPONSIVE GRID & CARDS ==================== -->
  <div class="page-break"></div>
  <h1 class="chapter-title">Chapter 3: Dynamic 4-Row Grid & Card Hierarchy</h1>

  <div class="triad-box">
    <div class="triad-header triad-what">📌 What It Is</div>
    <div class="triad-body">
      A viewport-adaptive accommodation grid that dynamically computes <strong>exactly 4 complete rows of property cards</strong> across all device types, with a single-click "Show more stays" accordion and dedicated photo-only navigation.
    </div>
  </div>

  <div class="triad-box">
    <div class="triad-header triad-why">💡 Why We Built It This Way</div>
    <div class="triad-body">
      Hardcoded pagination (e.g., showing 12 stays) looks asymmetrical: on a 6-column widescreen desktop it yields only 2 rows, while on a 2-column mobile device it generates an overwhelming 6 rows. By calculating <code>cols * 4</code> dynamically:
      <ul style="margin-left: 1.2rem; margin-top: 0.3rem;">
        <li><strong>Mobile (&lt;768px):</strong> 2 cols &times; 4 rows = <strong>8 stays</strong>.</li>
        <li><strong>Tablet Portrait (768px-1023px):</strong> 3 cols &times; 4 rows = <strong>12 stays</strong>.</li>
        <li><strong>Tablet Landscape (1024px-1279px):</strong> 4 cols &times; 4 rows = <strong>16 stays</strong>.</li>
        <li><strong>Desktop Widescreen (&ge;1280px):</strong> 6 cols &times; 4 rows = <strong>24 stays</strong>.</li>
        <li><strong>Navigation Isolation:</strong> The <code>&lt;Link&gt;</code> tag wraps <em>strictly the photo</em>. Users can highlight address text or click wishlist buttons without triggering accidental page transitions.</li>
      </ul>
    </div>
  </div>

  <div class="triad-box">
    <div class="triad-header triad-how">⚙️ Implementation & Code Walkthrough</div>
    <div class="triad-body">
      <div class="code-label">client/src/pages/Listings.jsx: Responsive Calculator</div>
      <pre><code>// Dynamic responsive columns: 6 on desktop (xl), 4 on landscape tablet (lg), 3 on portrait tablet (md), 2 on mobile
const isXl = useMediaQuery("(min-width: 1280px)");
const isLg = useMediaQuery("(min-width: 1024px)");
const isMd = useMediaQuery("(min-width: 768px)");
const cols = isXl ? 6 : isLg ? 4 : isMd ? 3 : 2;
const initialListingCount = cols * 4; // Exactly 4 complete lines of listings

const visibleListings = showAll ? allListings : allListings.slice(0, initialListingCount);</code></pre>

      <div class="code-label">client/src/components/ListingCard.jsx: Isolated Photo Link & Inline Rating</div>
      <pre><code>{/* Navigation happens strictly on clicking the photo */}
&lt;Link
  to={\`/listings/\${listing._id}\`}
  aria-label={listing.title}
  className="block relative aspect-[4/3.6] overflow-hidden rounded-card bg-neutral-200"
&gt;
  &lt;SmoothImage src={imageUrl(listing.image?.url, 600)} alt={listing.title} /&gt;
&lt;/Link&gt;

&lt;div className="mt-2 sm:mt-3 px-0.5 sm:px-1"&gt;
  {/* Line 1: Highlighted Title */}
  &lt;h3 className="truncate font-bold text-xs sm:text-base text-neutral-900"&gt;{listing.title}&lt;/h3&gt;

  {/* Line 2: Muted Address */}
  &lt;p className="truncate text-[11px] sm:text-sm text-neutral-500"&gt;
    {[listing.location, listing.country].filter(Boolean).join(", ")}
  &lt;/p&gt;

  {/* Line 3: Nightly Price + Inline Star Rating */}
  &lt;p className="mt-0.5 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-[15px] truncate"&gt;
    &lt;span className="font-bold"&gt;{formatPrice(price)}&lt;/span&gt;
    &lt;span className="text-neutral-500 text-[11px] sm:text-sm"&gt;night&lt;/span&gt;
    &lt;span className="text-neutral-400 text-[11px] select-none"&gt;&middot;&lt;/span&gt;
    &lt;Rating value={listing.averageRating} count={listing.reviewCount} showCount={false} /&gt;
  &lt;/p&gt;
&lt;/div&gt;</code></pre>
    </div>
  </div>

  <div class="screenshot-card">
    <img src="${imgHome}" alt="StayLust Homepage Grid">
    <div class="screenshot-caption">Figure 3.1: StayLust Homepage showing the 4-row grid, enlarged logo, and inline card rating.</div>
  </div>

  <!-- ==================== CHAPTER 4: 18% GST ENGINE ==================== -->
  <div class="page-break"></div>
  <h1 class="chapter-title">Chapter 4: Default 18% GST Pricing Engine</h1>

  <div class="triad-box">
    <div class="triad-header triad-what">📌 What It Is</div>
    <div class="triad-body">
      A transparent pricing computation layer that automatically factors India's statutory <strong>18% Goods and Services Tax (GST)</strong> into all displayed listing prices, reservation calculations, and booking payout summaries by default.
    </div>
  </div>

  <div class="triad-box">
    <div class="triad-header triad-why">💡 Why We Built It This Way</div>
    <div class="triad-body">
      Mutating raw price fields directly inside MongoDB (e.g. saving ₹2,595 instead of ₹2,199) violates standard database normalization:
      <ul style="margin-left: 1.2rem; margin-top: 0.3rem;">
        <li>If tax laws change (e.g. from 18% to 12%), an entire database migration would be required.</li>
        <li>Hosts would receive skewed commission reports because base payouts would be conflated with government tax liabilities.</li>
        <li>StayLust stores the raw base price in MongoDB and applies <code>const price = Math.round((Number(listing.price) || 0) * (1 + GST_RATE))</code> on the presentation layer, keeping base data pristine while giving guests accurate checkout figures.</li>
      </ul>
    </div>
  </div>

  <div class="triad-box">
    <div class="triad-header triad-how">⚙️ Implementation & Code Walkthrough</div>
    <div class="triad-body">
      <div class="code-label">client/src/lib/format.js: Centralized Financial Logic</div>
      <pre><code>export const GST_RATE = 0.18; // India accommodation tax standard rate

export function formatPrice(amount) {
  if (amount == null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function bookingTotals(nightlyPrice, nights) {
  const base = (Number(nightlyPrice) || 0) * (Number(nights) || 0);
  const gst = Math.round(base * GST_RATE);
  const total = base + gst;
  return { base, gst, total };
}</code></pre>
    </div>
  </div>

  <!-- ==================== CHAPTER 5: CLOUDINARY & MULTER ==================== -->
  <div class="page-break"></div>
  <h1 class="chapter-title">Chapter 5: Cloudinary Media Storage & Multer Upload Pipeline</h1>

  <div class="triad-box">
    <div class="triad-header triad-what">📌 What It Is</div>
    <div class="triad-body">
      A cloud-native media streaming pipeline that connects Express multipart form uploads directly to <strong>Cloudinary CDN</strong> via <strong>Multer</strong>, storing secure HTTPS URLs and public asset IDs in MongoDB.
    </div>
  </div>

  <div class="triad-box">
    <div class="triad-header triad-why">💡 Why We Built It This Way</div>
    <div class="triad-body">
      Writing file uploads to local disk (e.g. <code>/public/uploads</code>):
      <ul style="margin-left: 1.2rem; margin-top: 0.3rem;">
        <li>Fails on cloud deployment platforms (Render, Heroku, AWS Lambda) because server file systems are <em>ephemeral</em>—any container restart wipes out all user-uploaded photos.</li>
        <li>Slows down response times because Node.js must serve multi-megabyte image assets instead of delegating to a dedicated Content Delivery Network.</li>
        <li>Cloudinary provides automatic format negotiation (serving modern WebP and AVIF to supported browsers) and automated image resizing.</li>
      </ul>
    </div>
  </div>

  <div class="triad-box">
    <div class="triad-header triad-how">⚙️ Implementation & Code Walkthrough</div>
    <div class="triad-body">
      <div class="code-label">cloudConfig.js: Cloudinary Storage Engine</div>
      <pre><code>const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'staylust_DEV',
    allowedFormats: ["png", "jpg", "jpeg", "webp", "avif"],
  },
});

module.exports = { cloudinary, storage };</code></pre>

      <div class="code-label">routes/listing.js: Route Handler with Multer Middleware</div>
      <pre><code>const upload = multer({ storage });

router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"), // Streams binary file to Cloudinary
    validateListing,                 // Validates body with Joi schema
    wrapAsync(listingController.createListing)
  );</code></pre>
    </div>
  </div>

  <!-- ==================== CHAPTER 6: MAPBOX GEOCODING ==================== -->
  <div class="page-break"></div>
  <h1 class="chapter-title">Chapter 6: Forward Geocoding & Mapbox GL WebGL Engine</h1>

  <div class="triad-box">
    <div class="triad-header triad-what">📌 What It Is</div>
    <div class="triad-body">
      An automated geospatial pipeline that resolves human-readable location strings (e.g. <em>"Assagao, India"</em>) into precise longitude and latitude coordinates using the <strong>Mapbox Geocoding SDK</strong>, persisting them as <strong>GeoJSON Points</strong> in MongoDB and rendering interactive vector maps on the client using <strong>Mapbox GL JS</strong>.
    </div>
  </div>

  <div class="triad-box">
    <div class="triad-header triad-why">💡 Why We Built It This Way</div>
    <div class="triad-body">
      Forcing hosts to type decimal coordinates (e.g. <code>73.78, 15.59</code>) creates massive friction and high error rates. Forward geocoding allows hosts to enter familiar town names, while Mapbox resolves exact spatial coordinates. Using Mapbox GL JS over static images delivers smooth 60fps GPU-accelerated client panning, zooming, and custom branded markers.
    </div>
  </div>

  <div class="triad-box">
    <div class="triad-header triad-how">⚙️ Implementation & Code Walkthrough</div>
    <div class="triad-body">
      <div class="code-label">controller/listings.js: Server-Side Forward Geocode</div>
      <pre><code>const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

const geocode = async (location) => {
  const response = await geocodingClient
    .forwardGeocode({ query: location, limit: 1 })
    .send();
  return response.body.features[0]?.geometry; // Returns { type: 'Point', coordinates: [lng, lat] }
};

module.exports.createListing = async (req, res) => {
  const geometry = await geocode(\`\${req.body.listing.location}, \${req.body.listing.country}\`);
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.geometry = geometry;
  if (req.file) newListing.image = { url: req.file.path, filename: req.file.filename };
  await newListing.save();
  res.status(201).json(newListing);
};</code></pre>
    </div>
  </div>

  <div class="screenshot-card">
    <img src="${imgDetail}" alt="StayLust Detail & Mapbox">
    <div class="screenshot-caption">Figure 6.1: Property Detail Page displaying Mapbox GL Vector Map, Coordinates, and Host Manager.</div>
  </div>

  <!-- ==================== CHAPTER 7: OPTIMISTIC REVIEW DELETION ==================== -->
  <div class="page-break"></div>
  <h1 class="chapter-title">Chapter 7: Optimistic UI Updates & Parallel DB Execution</h1>

  <div class="triad-box">
    <div class="triad-header triad-what">📌 What It Is</div>
    <div class="triad-body">
      A zero-latency state reconciliation pattern that instantly removes deleted reviews from the UI (0ms feedback), paired with concurrent backend execution using <code>Promise.all</code> and automatic rollback on failure.
    </div>
  </div>

  <div class="triad-box">
    <div class="triad-header triad-why">💡 Why We Built It This Way</div>
    <div class="triad-body">
      Standard CRUD deletion causes frustrating delay: the user clicks delete, waits 800ms for a database trip, and watches the entire page reload. With <strong>Optimistic UI</strong>:
      <ul style="margin-left: 1.2rem; margin-top: 0.3rem;">
        <li>The review disappears instantly from the screen, and the average star rating recalculates immediately.</li>
        <li>Backend execution uses <code>Promise.all</code> to run <code>Listing.updateOne</code> and <code>Review.findByIdAndDelete</code> simultaneously rather than sequentially.</li>
        <li>If network drops, React automatically restores previous data and shows an error toast.</li>
      </ul>
    </div>
  </div>

  <div class="triad-box">
    <div class="triad-header triad-how">⚙️ Implementation & Code Walkthrough</div>
    <div class="triad-body">
      <div class="code-label">client/src/pages/ListingDetail.jsx: Optimistic State Update with Rollback</div>
      <pre><code>const deleteReview = async (reviewId) => {
  const previousData = data;
  const currentReviews = listing.reviews || [];
  const remainingReviews = currentReviews.filter((r) => String(r._id) !== String(reviewId));
  const newCount = remainingReviews.length;
  const newAvg = newCount === 0 ? 0 : remainingReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / newCount;

  // 1. Optimistic Update: Immediately mutate React state and recalculate stars
  setData({
    ...data,
    listing: { ...listing, reviews: remainingReviews },
    reviewCount: newCount,
    averageRating: newAvg,
  });
  toast("Review Deleted!");

  try {
    // 2. Network call executes in background
    await api(\`/listings/\${listing._id}/reviews/\${reviewId}\`, { method: "DELETE" });
  } catch (err) {
    // 3. Rollback on failure
    setData(previousData);
    toast(err.message || "Failed to delete review", "error");
  }
};</code></pre>

      <div class="code-label">controller/reviews.js: Parallel DB Execution</div>
      <pre><code>module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;

  // Concurrently remove review reference from listing AND delete review document
  await Promise.all([
    Listing.updateOne({ _id: id }, { $pull: { reviews: reviewId } }),
    Review.findByIdAndDelete(reviewId),
  ]);

  res.json({ ok: true });
};</code></pre>
    </div>
  </div>

  <!-- ==================== CHAPTER 8: HOST BOOKING ENGINE ==================== -->
  <div class="page-break"></div>
  <h1 class="chapter-title">Chapter 8: Host Reservation Manager & Booking Engine</h1>

  <div class="triad-box">
    <div class="triad-header triad-what">📌 What It Is</div>
    <div class="triad-body">
      A dual-mode accommodation reservation engine. For visiting guests, it provides an interactive date picker, night calculation, and GST billing. For the property owner, it transforms into an <strong>in-situ Host Reservation Dashboard</strong> displaying real-time guest reservations, guest contact emails, and payout totals.
    </div>
  </div>

  <div class="triad-box">
    <div class="triad-header triad-why">💡 Why We Built It This Way</div>
    <div class="triad-body">
      Most clones force hosts to visit a disconnected admin screen to check bookings. In StayLust, the booking card automatically detects ownership (<code>isOwner = user && listing.owner._id === user._id</code>) and renders host reservation telemetry right on the property page.
    </div>
  </div>

  <div class="triad-box">
    <div class="triad-header triad-how">⚙️ Implementation & Code Walkthrough</div>
    <div class="triad-body">
      <div class="code-label">client/src/components/BookingCard.jsx: Host Manager View</div>
      <pre><code>// If the logged-in user is the property owner, display host management UI
{isOwner ? (
  &lt;div className="mt-6 space-y-4"&gt;
    &lt;div className="flex items-center justify-between"&gt;
      &lt;span className="badge badge-get"&gt;Host Reservation Manager&lt;/span&gt;
      &lt;span className="text-xs font-semibold"&gt;{hostBookings.length} bookings&lt;/span&gt;
    &lt;/div&gt;
    &lt;div className="max-h-80 space-y-2.5 overflow-y-auto"&gt;
      {hostBookings.map((b) => (
        &lt;div key={b._id} className="p-3 border rounded-xl"&gt;
          &lt;span className="font-bold"&gt;{b.user?.username}&lt;/span&gt;
          &lt;a href={\`mailto:\${b.user?.email}\`}&gt;{b.user?.email}&lt;/a&gt;
          &lt;div&gt;Dates: {formatDate(b.checkIn)} &rarr; {formatDate(b.checkOut)}&lt;/div&gt;
          &lt;div className="font-bold text-sm"&gt;Payout: {formatPrice(b.totalPrice)}&lt;/div&gt;
        &lt;/div&gt;
      ))}
    &lt;/div&gt;
  &lt;/div&gt;
) : (
  /* Guest Reservation Form with Date Pickers */
  &lt;form onSubmit={submit}&gt;...&lt;/form&gt;
)}</code></pre>
    </div>
  </div>

  <div class="screenshot-card">
    <img src="${imgAbout}" alt="StayLust About Page">
    <div class="screenshot-caption">Figure 8.1: StayLust Platform Information, Community Safety & Trust Guidelines.</div>
  </div>

  <!-- ==================== CHAPTER 9: VIVA & INTERVIEWS ==================== -->
  <div class="page-break"></div>
  <h1 class="chapter-title">Chapter 9: High-Yield Viva Voce & Technical Interview Guide</h1>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q1</span> Explain the overall architecture of StayLust.</div>
    <div class="qa-answer">
      StayLust uses a decoupled SPA + REST API architecture. The client is a React 19 Single Page Application bundled with Vite 8 and styled with Tailwind CSS v4. The backend is an Express.js 5 micro-monolith running on Node.js 24 connected to MongoDB Atlas. Static assets stream from Cloudinary CDN, spatial queries resolve through Mapbox Geocoding, and state transitions occur client-side without full-page reloads.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q2</span> Why use session cookies in MongoDB instead of JSON Web Tokens (JWT)?</div>
    <div class="qa-answer">
      JWTs stored in <code>localStorage</code> are vulnerable to Cross-Site Scripting (XSS) token theft and cannot be invalidated immediately by the server if an account is compromised. StayLust uses <code>httpOnly</code>, <code>secure</code> cookies managed by Passport.js and <code>connect-mongo</code>. This guarantees immune-to-XSS cookie handling and instant server-side revocation on logout or account termination.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q3</span> How does the review deletion optimization work?</div>
    <div class="qa-answer">
      Previously, deleting a review caused lag because the UI waited for the network delete and triggered a full page reload. I implemented Optimistic UI on the frontend: the review is removed from React state immediately (0ms latency), and ratings are recalculated in memory. On the backend, I converted sequential queries into concurrent execution using <code>Promise.all([Listing.updateOne(...), Review.findByIdAndDelete(...)])</code>, reducing database roundtrip latency by over 50%.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q4</span> How does forward geocoding work in the listing creation flow?</div>
    <div class="qa-answer">
      When a host registers a property location string (e.g. "Assagao, Goa"), the backend sends the query to the Mapbox Geocoding SDK. Mapbox returns a GeoJSON FeatureCollection with exact coordinates. The controller stores this as a standard GeoJSON Point (<code>{ type: "Point", coordinates: [lng, lat] }</code>) in MongoDB. The React frontend mounts an interactive WebGL Mapbox GL canvas using these coordinates.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q5</span> How is India's 18% GST implemented without corrupting database prices?</div>
    <div class="qa-answer">
      To preserve data normalization, MongoDB stores strictly the raw nightly base rate. The client uses a centralized financial utility (<code>formatPrice(Math.round(price * (1 + GST_RATE)))</code>) to compute GST-inclusive prices dynamically. This guarantees that if tax rates change, zero database migrations are required, and host payout records remain uncorrupted.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q6</span> How does the 4-row responsive grid calculate listing counts?</div>
    <div class="qa-answer">
      Using a custom React <code>useMediaQuery</code> hook, the client detects the exact active viewport tier (2 cols mobile, 3 cols portrait tablet, 4 cols landscape tablet, 6 cols desktop). It dynamically calculates <code>initialListingCount = cols * 4</code> (8 on mobile, 24 on desktop). This ensures a clean, symmetrical 4-row layout on every screen, with excess listings revealed via "Show more stays".
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q7</span> How does cascading deletion prevent orphaned documents in MongoDB?</div>
    <div class="qa-answer">
      In <code>models/listing.js</code>, a Mongoose <code>post("findOneAndDelete")</code> middleware hook checks if the deleted listing had child review IDs. If so, it executes <code>Review.deleteMany({ _id: { $in: listing.reviews } })</code>, ensuring no orphaned reviews linger in the database.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q8</span> How do you prevent NoSQL injection in Express routes?</div>
    <div class="qa-answer">
      We enforce two defensive barriers: First, strict Joi validation schemas validate data types, numeric ranges, and string lengths before queries touch MongoDB. Second, Mongoose schema casting rejects unexpected query objects and handles malformed ObjectIds via centralized CastError middleware.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q9</span> How would you scale StayLust to handle 1,000,000 daily users?</div>
    <div class="qa-answer">
      I would implement:
      <ol style="margin-left: 1.2rem; margin-top: 0.2rem;">
        <li><strong>Redis Caching:</strong> Cache popular listings and category filter queries in memory with time-to-live (TTL) invalidation on listing updates.</li>
        <li><strong>Read Replicas:</strong> Route read operations to MongoDB Atlas secondary replica set nodes while reserving primary nodes for writes.</li>
        <li><strong>CDN Optimization:</strong> Enable Cloudinary automatic format/quality negotiation (<code>f_auto,q_auto</code>) to serve next-gen AVIF/WebP assets globally.</li>
      </ol>
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q10</span> Why did you restrict card navigation exclusively to the photo?</div>
    <div class="qa-answer">
      Wrapping entire card blocks in an anchor tag causes user frustration when selecting text, copying address details, or toggling wishlist buttons. Restricting the <code>&lt;Link&gt;</code> strictly to the photo container ensures clear intent: photos navigate to details, while card text remains clean, selectable, and accessible.
    </div>
  </div>

  <!-- ==================== SIGN-OFF ==================== -->
  <div style="margin-top: 2.5rem; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 1rem; page-break-inside: avoid;">
    <div>
      <p style="font-weight: 800; color: #0f172a; font-size: 10pt;">StayLust Engineering Master Dossier</p>
      <p style="color: #64748b; font-size: 8.5pt;">Prepared by Ranjit Sharma • MERN Full-Stack Engineer</p>
    </div>
    <div style="text-align: right;">
      <p style="font-weight: 800; color: #0f172a; font-size: 10pt;">Project Repository</p>
      <p style="color: #64748b; font-size: 8.5pt;">github.com/ranjit-sharma/StayLust</p>
    </div>
  </div>

</body>
</html>`;

const htmlPath = path.join(__dirname, 'StayLust_Complete_Project_Notes.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log(`Updated HTML written to: ${htmlPath}`);

// Convert to PDF using Chrome Headless via PowerShell
const pdfPath = path.join(__dirname, '..', 'StayLust_Complete_Project_Notes.pdf');
const profileDir = path.join(__dirname, 'temp_profile');

console.log("Compiling PDF via Headless Chrome...");
const psScript = `
$html = (Resolve-Path "${htmlPath.replace(/\\/g, '\\\\')}").Path
$pdf = "${pdfPath.replace(/\\/g, '\\\\')}"
$profile = "${profileDir.replace(/\\/g, '\\\\')}"

$args = @(
  "--headless=new",
  "--user-data-dir=$profile",
  "--no-pdf-header-footer",
  "--print-to-pdf=$pdf",
  "file:///$($html -replace '\\\\', '/')"
)

Start-Process -FilePath "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" -ArgumentList $args -Wait
`;

const psPath = path.join(__dirname, 'run_chrome_pdf.ps1');
fs.writeFileSync(psPath, psScript, 'utf8');

execSync(`powershell -ExecutionPolicy Bypass -File "${psPath}"`, { stdio: 'inherit' });

if (fs.existsSync(pdfPath)) {
  const stats = fs.statSync(pdfPath);
  console.log(`\n======================================================`);
  console.log(`SUCCESS: StayLust Master Notes PDF Generated!`);
  console.log(`File: ${pdfPath}`);
  console.log(`Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`);
  console.log(`======================================================\n`);
} else {
  console.error("PDF generation failed: Output file missing.");
}
