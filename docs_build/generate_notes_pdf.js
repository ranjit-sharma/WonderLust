const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("Preparing StayLust Master Project Notes PDF...");

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

console.log("Screenshots encoded into Base64.");

// Comprehensive HTML template
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>StayLust — Comprehensive Full-Stack Project Notes</title>
  <style>
    @page {
      size: A4;
      margin: 1.8cm 1.5cm 1.8cm 1.5cm;
      @bottom-right {
        content: counter(page);
        font-size: 9pt;
        color: #71717a;
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
      color: #1e293b;
      line-height: 1.6;
      font-size: 10pt;
      background: #ffffff;
    }

    /* Cover Page */
    .cover-page {
      page-break-after: always;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 3rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      position: relative;
    }

    .cover-badge {
      display: inline-block;
      align-self: flex-start;
      background: #fe424d;
      color: #ffffff;
      padding: 0.35rem 1rem;
      border-radius: 9999px;
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .cover-title-group {
      margin-top: 2rem;
    }

    .cover-brand {
      font-size: 38pt;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.04em;
      line-height: 1.1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .cover-brand span.highlight {
      color: #fe424d;
    }

    .cover-subtitle {
      font-size: 16pt;
      font-weight: 600;
      color: #475569;
      margin-top: 0.8rem;
      line-height: 1.4;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-top: 2.5rem;
      background: #ffffff;
      padding: 1.5rem;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .meta-item h4 {
      font-size: 8pt;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .meta-item p {
      font-size: 10pt;
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
      font-size: 8.5pt;
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

    h1.section-title {
      font-size: 20pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2.5px solid #fe424d;
      padding-bottom: 0.4rem;
      margin-top: 1.5rem;
      margin-bottom: 1.2rem;
      letter-spacing: -0.02em;
    }

    h2.subsection-title {
      font-size: 13pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 1.4rem;
      margin-bottom: 0.6rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    h2.subsection-title::before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 16px;
      background: #fe424d;
      border-radius: 2px;
    }

    h3 {
      font-size: 11pt;
      font-weight: 600;
      color: #334155;
      margin-top: 1rem;
      margin-bottom: 0.4rem;
    }

    p {
      margin-bottom: 0.75rem;
      text-align: justify;
    }

    /* Callout Boxes */
    .callout {
      background: #f8fafc;
      border-left: 4px solid #fe424d;
      padding: 0.9rem 1.2rem;
      margin: 1rem 0;
      border-radius: 0 8px 8px 0;
      font-size: 9.5pt;
    }

    .callout-info {
      background: #f0fdf4;
      border-left-color: #16a34a;
    }

    .callout-warn {
      background: #fffbeb;
      border-left-color: #f59e0b;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0 1.2rem 0;
      font-size: 9pt;
    }

    table th {
      background: #0f172a;
      color: #ffffff;
      padding: 0.55rem 0.75rem;
      text-align: left;
      font-weight: 600;
      font-size: 8.5pt;
      letter-spacing: 0.03em;
    }

    table td {
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }

    table tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Code Blocks */
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 0.8rem 1rem;
      border-radius: 8px;
      font-family: 'Consolas', 'Fira Code', monospace;
      font-size: 8.5pt;
      overflow-x: auto;
      margin: 0.8rem 0;
      line-height: 1.5;
    }

    code {
      background: #f1f5f9;
      color: #e11d48;
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
      font-family: 'Consolas', monospace;
      font-size: 8.5pt;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }

    /* Screenshots & Images */
    .screenshot-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.6rem;
      margin: 1.2rem 0;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
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
      margin-top: 0.5rem;
      font-size: 8.5pt;
      color: #64748b;
      font-style: italic;
      text-align: center;
    }

    /* Architecture Diagram */
    .arch-diagram {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.2rem;
      margin: 1rem 0;
      font-family: 'Consolas', monospace;
      font-size: 8pt;
      line-height: 1.4;
      white-space: pre;
      color: #0f172a;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 700;
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
      margin-bottom: 1.2rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
      page-break-inside: avoid;
    }

    .qa-question {
      font-size: 10pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.4rem;
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }

    .qa-num {
      background: #fe424d;
      color: #ffffff;
      font-size: 7.5pt;
      font-weight: 800;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
    }

    .qa-answer {
      font-size: 9pt;
      color: #334155;
      line-height: 1.55;
      text-align: justify;
    }
  </style>
</head>
<body>

  <!-- ==================== COVER PAGE ==================== -->
  <div class="cover-page">
    <div>
      <div class="cover-badge">Major Project Master Documentation & Engineering Notes</div>
      <div class="cover-title-group">
        <div class="cover-brand">🧭 Stay<span class="highlight">Lust</span></div>
        <div class="cover-subtitle">Production-Ready Full-Stack Travel Accommodation & Vacation Rental Platform</div>
        <p style="margin-top: 1rem; font-size: 10pt; color: #64748b; max-width: 90%;">
          An end-to-end cloud-native MERN ecosystem inspired by Airbnb, engineered with React 19, Express.js 5, MongoDB Atlas, Mapbox GL geocoding, Cloudinary CDN, and Tailwind CSS v4.
        </p>
      </div>

      <div class="cover-meta-grid">
        <div class="meta-item">
          <h4>Project Developer</h4>
          <p>Ranjit Sharma</p>
        </div>
        <div class="meta-item">
          <h4>Architecture Pattern</h4>
          <p>Decoupled SPA + RESTful API (MVC)</p>
        </div>
        <div class="meta-item">
          <h4>Primary Tech Stack</h4>
          <p>React 19, Node.js 24, Express 5, MongoDB Atlas</p>
        </div>
        <div class="meta-item">
          <h4>Styling & Animation</h4>
          <p>Tailwind CSS v4 & Motion (Framer Motion)</p>
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
      <span>Academic Year 2026 • Computer Science & Engineering</span>
      <span>Confidential & Comprehensive Project Viva / Technical Reference</span>
    </div>
  </div>

  <!-- ==================== CHAPTER 1: EXECUTIVE SUMMARY ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">1. Executive Project Summary</h1>

  <h2 class="subsection-title">1.1 Project Overview & Vision</h2>
  <p>
    <strong>StayLust</strong> is an enterprise-grade, modern accommodation and vacation rental web application. Designed and implemented as a complete full-stack solution, it mirrors the core capabilities of Airbnb while incorporating localized Indian destination mapping, interactive geospatial exploration, automated 18% Goods & Services Tax (GST) calculation, and zero-latency optimistic review operations.
  </p>
  <p>
    The platform bridges the gap between property hosts and domestic/international travellers. Travellers can effortlessly discover scenic hill villas, coastal beach houses, luxury heritage rooms, and tranquil retreats across destinations like Assagao Goa, Old Manali, Ooty, Varkala, and Indiranagar Bengaluru. Hosts can manage listings, upload high-resolution media to Cloudinary, track active reservations, and view payouts directly in real time.
  </p>

  <div class="callout callout-info">
    <strong>Core Problem Solved:</strong> Many academic accommodation clones rely on static templates (EJS/Handlebars) with full page reloads, unvalidated manual geocoordinates, lack of real transaction tax breakdowns, and laggy UI deletions. StayLust solves this by leveraging modern <strong>React 19 Single Page Application (SPA)</strong> architecture with dynamic responsive pagination, forward geocoding with Mapbox GL, distributed session storage via MongoDB Atlas, and instant optimistic state reconciliation.
  </div>

  <h2 class="subsection-title">1.2 Key Engineering Highlights</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 28%;">Technical Feature</th>
        <th style="width: 32%;">Implementation Details</th>
        <th style="width: 40%;">User & Architectural Benefit</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Decoupled SPA Architecture</strong></td>
        <td>React 19 + Vite 8 frontend communicating over REST API with Express 5 backend.</td>
        <td>Near-instant page navigation with zero white flashes; clear separation of presentation and business logic.</td>
      </tr>
      <tr>
        <td><strong>Forward Geocoding & Maps</strong></td>
        <td>Mapbox Geocoding SDK on server side; Mapbox GL JS on client side with custom pins.</td>
        <td>Automatically translates city & country names into exact coordinates [longitude, latitude] for visual exploration.</td>
      </tr>
      <tr>
        <td><strong>Default 18% GST Engine</strong></td>
        <td>Nightly prices compute <code>Math.round(price * 1.18)</code> transparently across cards & bookings.</td>
        <td>Ensures accurate Indian market billing compliance without mutating base property values in the database.</td>
      </tr>
      <tr>
        <td><strong>Optimistic Review Operations</strong></td>
        <td>Instant React state updates coupled with parallel <code>Promise.all</code> in Express controllers.</td>
        <td>Eliminates UI delete lag (0ms user feedback) while maintaining eventual database consistency and error rollback.</td>
      </tr>
      <tr>
        <td><strong>4-Row Responsive Pagination</strong></td>
        <td>Dynamic grid calculator based on viewport (2 cols on mobile = 8, up to 6 cols on desktop = 24).</td>
        <td>Keeps initial viewports clean, reduces initial DOM node footprint, and provides an elegant "Show more stays" toggle.</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== CHAPTER 2: SYSTEM ARCHITECTURE ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">2. System Architecture & Request Lifecycle</h1>

  <h2 class="subsection-title">2.1 Architectural Flow Diagram</h2>
  <p>
    StayLust utilizes a decoupled Model-View-Controller (MVC) pattern adapted for modern Single Page Applications. The client runs entirely in the browser as a compiled React bundle, while Express.js 5 serves strictly as an API gateway and static file server.
  </p>

  <div class="arch-diagram">
+-------------------------------------------------------------------------------------------------+
|                                 STAYLUST SYSTEM TOPOLOGY                                        |
+-------------------------------------------------------------------------------------------------+

 [ CLIENT TIER: Browser / Mobile ]
         │
         ├─── (1) React 19 SPA (Vite Bundled) + Tailwind CSS v4 + Motion
         ├─── (2) Mapbox GL JS WebGL Canvas (Interactive Geolocation Map)
         └─── (3) Optimistic UI State Handler & Client Fetch Library
                     │
                     │  HTTP / HTTPS REST Calls (JSON)
                     ▼
 [ BACKEND TIER: Express.js 5 / Node.js 24 ]
         │
         ├─── Middleware Layer
         │      ├── express.json() & express.static(client/dist)
         │      ├── express-session + connect-mongo (Distributed Session Manager)
         │      ├── passport.initialize() + passport.session() (PBKDF2 Authentication)
         │      └── Joi Schema Validator (Input Sanitization & Business Rules)
         │
         ├─── Controller Layer
         │      ├── listing.js (CRUD, Geocoding, Dynamic Aggregations)
         │      ├── review.js (Parallel Promise.all Deletions, Rating Recalculation)
         │      ├── booking.js (Date Logic, Availability, Host Dashboard)
         │      └── user.js (Register, Login, Session Serialization)
         │
         ├─── Cloud Service Integrations
         │      ├── Cloudinary SDK (Direct Cloud Image Upload & Transformation)
         │      └── Mapbox SDK (Forward Geocoding: Location String -> [Lng, Lat])
         │
         ▼
 [ DATABASE TIER: MongoDB Atlas (Replica Set Cluster) ]
         ├─── listings collection (GeoJSON Point, Ref: User, Ref: Reviews)
         ├─── reviews collection (Rating, Comment, Ref: User)
         ├─── bookings collection (CheckIn, CheckOut, Guests, TotalPrice, Status)
         ├─── users collection (Username, Email, Salt, Hash)
         └─── sessions collection (TTL Indexed Session Store)
  </div>

  <h2 class="subsection-title">2.2 Client-Server Request-Response Lifecycle</h2>
  <ol style="margin-left: 1.5rem; line-height: 1.8;">
    <li><strong>Client Dispatch:</strong> The user interacts with the UI (e.g., searches "Goa", reserves a date range, or deletes a review). The React frontend fires an asynchronous <code>fetch()</code> request via the unified <code>api.js</code> service.</li>
    <li><strong>Express Routing & Middleware:</strong> The request hits <code>app.js</code>, passes through logging and cookie parsing, checks session validity via <code>MongoStore</code>, and executes Passport deserialization.</li>
    <li><strong>Authorization Guard:</strong> Endpoints requiring elevated permissions pass through custom middleware (<code>isLoggedIn</code>, <code>isOwner</code>, <code>isReviewAuthor</code>) in <code>middleware.js</code>.</li>
    <li><strong>Joi Schema Validation:</strong> Input bodies (e.g., listing price, coordinates, review stars) are validated against Joi schemas in <code>schema.js</code>. If invalid, a 400 Bad Request is returned before touching the database.</li>
    <li><strong>Database & Cloud Execution:</strong> The controller executes Mongoose queries against MongoDB Atlas. For file uploads, Multer streams the multipart image payload directly into Cloudinary without buffering to the local server disk.</li>
    <li><strong>Optimistic Client Reconciliation:</strong> For state-sensitive actions like deleting a review, the client removes the element from local state immediately (0ms latency feel) and only reverts if the network request fails with an error toast.</li>
  </ol>

  <!-- ==================== CHAPTER 3: DATABASE DESIGN ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">3. Database Schema Design & Relationships</h1>

  <h2 class="subsection-title">3.1 Entity Relationship Model</h2>
  <p>
    StayLust uses a normalized, document-based NoSQL data model designed to maximize query performance while maintaining clean relational integrity.
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 15%;">Model</th>
        <th style="width: 25%;">Field</th>
        <th style="width: 20%;">Type</th>
        <th style="width: 40%;">Description & Constraints</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td rowspan="8"><strong>Listing</strong></td>
        <td><code>title</code></td>
        <td>String</td>
        <td>Required, trimmed, property headline (e.g. "Lush Green Surroundings").</td>
      </tr>
      <tr>
        <td><code>description</code></td>
        <td>String</td>
        <td>Detailed property information (~150 words per listing).</td>
      </tr>
      <tr>
        <td><code>image</code></td>
        <td>{ url, filename }</td>
        <td>Cloudinary public CDN URL and cloud file identifier.</td>
      </tr>
      <tr>
        <td><code>price</code></td>
        <td>Number</td>
        <td>Base per-night cost in INR (must be positive).</td>
      </tr>
      <tr>
        <td><code>location, country</code></td>
        <td>String</td>
        <td>City/region and country (defaulted to India).</td>
      </tr>
      <tr>
        <td><code>geometry</code></td>
        <td>GeoJSON Point</td>
        <td><code>{ type: "Point", coordinates: [Number] }</code> for Mapbox pins.</td>
      </tr>
      <tr>
        <td><code>owner</code></td>
        <td>ObjectId (Ref: User)</td>
        <td>Host user account with edit/delete authorization rights.</td>
      </tr>
      <tr>
        <td><code>reviews</code></td>
        <td>[ObjectId] (Ref: Review)</td>
        <td>Array of child review IDs with cascading delete middleware.</td>
      </tr>
      <tr>
        <td rowspan="4"><strong>Review</strong></td>
        <td><code>comment</code></td>
        <td>String</td>
        <td>Detailed guest feedback (~30 words natural review text).</td>
      </tr>
      <tr>
        <td><code>rating</code></td>
        <td>Number</td>
        <td>Integer between 1 and 5 stars.</td>
      </tr>
      <tr>
        <td><code>author</code></td>
        <td>ObjectId (Ref: User)</td>
        <td>User who wrote the review (used for author-only deletion).</td>
      </tr>
      <tr>
        <td><code>createdAt</code></td>
        <td>Date</td>
        <td>Timestamp automatically stamped upon review submission.</td>
      </tr>
      <tr>
        <td rowspan="6"><strong>Booking</strong></td>
        <td><code>listing</code></td>
        <td>ObjectId (Ref: Listing)</td>
        <td>The reserved accommodation.</td>
      </tr>
      <tr>
        <td><code>user</code></td>
        <td>ObjectId (Ref: User)</td>
        <td>The registered guest who placed the booking.</td>
      </tr>
      <tr>
        <td><code>checkIn, checkOut</code></td>
        <td>Date</td>
        <td>Reservation date range (validated: checkOut > checkIn).</td>
      </tr>
      <tr>
        <td><code>guests</code></td>
        <td>Number</td>
        <td>Total guest headcount.</td>
      </tr>
      <tr>
        <td><code>totalPrice</code></td>
        <td>Number</td>
        <td>Grand total including base nights + 18% GST.</td>
      </tr>
      <tr>
        <td><code>status</code></td>
        <td>String</td>
        <td>Enum: "confirmed", "pending", "cancelled".</td>
      </tr>
    </tbody>
  </table>

  <h2 class="subsection-title">3.2 Cascading Deletion Hook</h2>
  <p>
    When a listing is deleted by its host, all associated child reviews must be cleanly pruned from the <code>reviews</code> collection to prevent orphaned documents in MongoDB Atlas:
  </p>

  <pre><code>// models/listing.js: Post-middleware hook for findOneAndDelete
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing && listing.reviews && listing.reviews.length > 0) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});</code></pre>

  <!-- ==================== CHAPTER 4: KEY FEATURES & SCREENSHOTS ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">4. Key Modules & Production UI Walkthrough</h1>

  <h2 class="subsection-title">4.1 Homepage: Dynamic Responsive Grid & Card Hierarchy</h2>
  <p>
    The StayLust homepage is built to showcase curated stays with maximum visual clarity. The header displays the bold, enlarged <strong>StayLust</strong> branding alongside the live debounced search bar. The category bar allows instant filtering across Rooms, Iconic Cities, Mountains, Castles, Pools, Camping, and Farms.
  </p>

  <div class="screenshot-card">
    <img src="${imgHome}" alt="StayLust Homepage">
    <div class="screenshot-caption">Figure 4.1: StayLust Homepage featuring responsive cards, Indian destinations, and 4-line initial grid.</div>
  </div>

  <div class="callout">
    <strong>Card Hierarchy Innovation:</strong> Each card displays:
    <ul style="margin-left: 1.2rem; margin-top: 0.3rem;">
      <li><strong>Line 1 (Top):</strong> Bold Property Title (e.g. <em>Lush Green Surroundings.</em>).</li>
      <li><strong>Line 2 (Middle):</strong> Muted Address (e.g. <em>Vagator, India</em>).</li>
      <li><strong>Line 3 (Bottom):</strong> GST-inclusive price inline with Star Rating: <code>₹2,199 night · ★ 4.3</code>.</li>
      <li><strong>Exclusive Photo Navigation:</strong> Clicking the image triggers navigation to property details; text remains highlightable.</li>
    </ul>
  </div>

  <div class="page-break"></div>
  <h2 class="subsection-title">4.2 Property Detail & Interactive Mapbox Integration</h2>
  <p>
    The property detail page displays high-resolution Cloudinary imagery, host badges, property descriptions, interactive Mapbox GL vector map, and an instant booking widget.
  </p>

  <div class="screenshot-card">
    <img src="${imgDetail}" alt="StayLust Property Detail Page">
    <div class="screenshot-caption">Figure 4.2: Property detail page displaying Mapbox GL geocoding, ratings, and host manager.</div>
  </div>

  <h2 class="subsection-title">4.3 Authentication, Security & Brand Architecture</h2>
  <p>
    Security is maintained via Passport.js with salted PBKDF2 hashing, cookie serialization, and distributed <code>connect-mongo</code> session management.
  </p>

  <div class="screenshot-card">
    <img src="${imgLogin}" alt="StayLust Login Screen">
    <div class="screenshot-caption">Figure 4.3: Secure split-screen authentication portal with persistent session cookies.</div>
  </div>

  <div class="page-break"></div>
  <h2 class="subsection-title">4.4 Community Guidelines, Trust & About Us</h2>
  <p>
    StayLust includes complete consumer guidelines, privacy policies, terms of service, and accessibility feedback channels.
  </p>

  <div class="screenshot-card">
    <img src="${imgAbout}" alt="StayLust About Page">
    <div class="screenshot-caption">Figure 4.4: Brand manifesto and platform information page.</div>
  </div>

  <!-- ==================== CHAPTER 5: REST API REFERENCE ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">5. Comprehensive REST API Reference</h1>

  <table>
    <thead>
      <tr>
        <th style="width: 12%;">Method</th>
        <th style="width: 28%;">Endpoint</th>
        <th style="width: 25%;">Access Level</th>
        <th style="width: 35%;">Purpose & Response Payload</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="badge badge-get">GET</span></td>
        <td><code>/api/listings</code></td>
        <td>Public</td>
        <td>Returns filtered array of listings with dynamic averageRating and reviewCount.</td>
      </tr>
      <tr>
        <td><span class="badge badge-post">POST</span></td>
        <td><code>/api/listings</code></td>
        <td>Authenticated Host</td>
        <td>Creates a new listing, forward-geocodes coordinates via Mapbox, uploads photo to Cloudinary.</td>
      </tr>
      <tr>
        <td><span class="badge badge-get">GET</span></td>
        <td><code>/api/listings/:id</code></td>
        <td>Public</td>
        <td>Returns single listing populated with owner info and all child reviews.</td>
      </tr>
      <tr>
        <td><span class="badge badge-put">PUT</span></td>
        <td><code>/api/listings/:id</code></td>
        <td>Listing Owner Only</td>
        <td>Updates listing fields and optionally replaces Cloudinary image asset.</td>
      </tr>
      <tr>
        <td><span class="badge badge-del">DELETE</span></td>
        <td><code>/api/listings/:id</code></td>
        <td>Listing Owner Only</td>
        <td>Deletes listing and triggers cascading deletion of child reviews.</td>
      </tr>
      <tr>
        <td><span class="badge badge-post">POST</span></td>
        <td><code>/api/listings/:id/reviews</code></td>
        <td>Authenticated User</td>
        <td>Adds a new star rating (1-5) and comment; recalculates averageRating.</td>
      </tr>
      <tr>
        <td><span class="badge badge-del">DELETE</span></td>
        <td><code>/api/listings/:id/reviews/:rId</code></td>
        <td>Review Author Only</td>
        <td>Executes parallel <code>Promise.all</code> to unlink review from listing and delete review document.</td>
      </tr>
      <tr>
        <td><span class="badge badge-post">POST</span></td>
        <td><code>/api/listings/:id/bookings</code></td>
        <td>Authenticated Guest</td>
        <td>Creates confirmed booking, validates check-in/out dates, and computes 18% GST totals.</td>
      </tr>
      <tr>
        <td><span class="badge badge-get">GET</span></td>
        <td><code>/api/listings/:id/bookings</code></td>
        <td>Listing Owner Only</td>
        <td>Fetches all guest bookings and contact information for host management.</td>
      </tr>
      <tr>
        <td><span class="badge badge-post">POST</span></td>
        <td><code>/api/signup</code></td>
        <td>Public</td>
        <td>Registers new user with email and username using Passport-Local-Mongoose PBKDF2 hashing.</td>
      </tr>
      <tr>
        <td><span class="badge badge-post">POST</span></td>
        <td><code>/api/login</code></td>
        <td>Public</td>
        <td>Authenticates credentials and establishes session cookie in MongoDB store.</td>
      </tr>
      <tr>
        <td><span class="badge badge-post">POST</span></td>
        <td><code>/api/logout</code></td>
        <td>Authenticated User</td>
        <td>Terminates user session and clears client cookie.</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== CHAPTER 6: VIVA & INTERVIEW GUIDE ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">6. Technical Viva & Recruiter Interview Guide</h1>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q1</span> Why did you decouple the architecture into a React 19 SPA instead of using server-rendered EJS templates?</div>
    <div class="qa-answer">
      Traditional server-side templates (like EJS) require full-page HTML rebuilds and reloads on every interaction, causing white flashes, losing scroll positions, and placing excessive rendering load on the Node.js server. By building StayLust as a decoupled Single Page Application (SPA) using React 19 and Vite, the server only serves lean JSON data over REST endpoints. The client retains state locally, handles instant client-side transitions via React Router, renders vector maps with WebGL (Mapbox GL), and utilizes optimistic UI updates for instantaneous user interactions.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q2</span> How does session-based authentication in StayLust work, and why was it chosen over stateless JWTs?</div>
    <div class="qa-answer">
      StayLust uses Passport.js Local Strategy with session cookies stored in MongoDB Atlas via <code>connect-mongo</code>. Unlike JWTs (which cannot be revoked instantly without maintaining a complex distributed token blacklist), server-managed sessions allow instantaneous host/admin revoking, protection against XSS token theft (as cookies use <code>httpOnly: true</code> and <code>secure: true</code>), and automated session touch-throttling (via <code>touchAfter: 24 * 3600</code>).
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q3</span> How did you solve the review deletion lag in ListingDetail?</div>
    <div class="qa-answer">
      Previously, deleting a review caused a noticeable delay because the frontend waited for the database network response and then triggered a complete page reload, which re-fetched all listings and aggregations. I fixed this by implementing <strong>optimistic UI state management</strong>: the review is removed from React state immediately upon user click, providing a 0ms feedback loop. On the backend in <code>controller/reviews.js</code>, I refactored the two sequential operations into a concurrent <code>Promise.all([Listing.findByIdAndUpdate(...), Review.findByIdAndDelete(...)])</code>, reducing database round-trip latency by over 50%. If the network call fails, the client gracefully rolls back the UI state and displays a toast error.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q4</span> How does the forward geocoding with Mapbox work?</div>
    <div class="qa-answer">
      When a host registers a new property with a city name (e.g. "Varkala, India"), the backend intercepts the string and sends a query to the Mapbox Geocoding REST API via <code>@mapbox/mapbox-sdk</code>. The API returns a GeoJSON FeatureCollection containing exact longitude and latitude coordinates. We save this directly in MongoDB inside the <code>geometry</code> field following the standardized GeoJSON Point schema (<code>{ type: "Point", coordinates: [lng, lat] }</code>). On the client, Mapbox GL JS initializes a WebGL map canvas and dynamically mounts a custom interactive marker at those coordinates.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q5</span> How is 18% GST implemented without corrupting base property prices?</div>
    <div class="qa-answer">
      In database design, storing pre-tax and post-tax values redundantly violates data normalization and risks price drift. In StayLust, MongoDB stores strictly the raw nightly property rate (e.g., ₹2,199). On the client display layer, we apply a centralized GST factor (<code>GST_RATE = 0.18</code>) via <code>formatPrice(Math.round(price * 1.18))</code>. This ensures that cards, reserve bars, and booking breakdowns remain 100% synchronized, while hosts can edit base rates without recalculation errors.
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q6</span> How does the 4-row responsive grid calculate initial listings on the homepage?</div>
    <div class="qa-answer">
      Different devices display different column counts (2 on mobile, 3 on portrait tablet, 4 on landscape tablet, 6 on desktop). Rather than showing a hardcoded number like 12 or 20 stays, StayLust uses a custom React hook (<code>useMediaQuery</code>) to determine the exact screen tier dynamically. It computes <code>initialListingCount = cols * 4</code> rows (e.g., 2 × 4 = 8 stays on mobile; 6 × 4 = 24 stays on desktop). Any remaining listings are smoothly revealed when the user clicks "Show more stays".
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q7</span> How does StayLust prevent NoSQL injection and parameter tampering?</div>
    <div class="qa-answer">
      We enforce two layers of defense: First, <strong>Joi validation schemas</strong> rigorously validate every incoming <code>req.body</code> against strict data types, string length caps, and integer thresholds before database execution. Second, Mongoose schemas enforce casting checks (e.g., rejecting invalid <code>ObjectId</code>s with automatic 404 CastError handling). Finally, authorization middleware explicitly compares <code>listing.owner._id</code> with <code>req.user._id</code> to prevent Broken Object Level Authorization (BOLA).
    </div>
  </div>

  <div class="qa-item">
    <div class="qa-question"><span class="qa-num">Q8</span> What would you do if StayLust scaled to 1,000,000 daily active users?</div>
    <div class="qa-answer">
      I would introduce three key architectural upgrades:
      <ol style="margin-left: 1.2rem; margin-top: 0.3rem;">
        <li><strong>Redis Caching Layer:</strong> Cache frequent read queries (like <code>/api/listings</code> and category filters) in an in-memory Redis cluster with cache invalidation on property updates.</li>
        <li><strong>Database Read Replicas:</strong> Separate MongoDB write operations (primary node) from read queries (secondary replica set nodes) to eliminate database read bottlenecks.</li>
        <li><strong>Cloudinary Edge CDN Optimization:</strong> Use Cloudinary's dynamic quality and format auto-negotiation (<code>f_auto,q_auto</code>) so mobile clients download lightweight WebP/AVIF images.</li>
      </ol>
    </div>
  </div>

  <!-- ==================== CHAPTER 7: CONCLUSION & METRICS ==================== -->
  <div class="page-break"></div>
  <h1 class="section-title">7. Project Metrics & Summary</h1>

  <h2 class="subsection-title">7.1 Codebase & Engineering Statistics</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 35%;">Metric</th>
        <th style="width: 35%;">Measurement / Value</th>
        <th style="width: 30%;">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Frontend Framework</strong></td>
        <td>React 19.3 + Vite 8.3 + Tailwind CSS v4.3</td>
        <td>Production Ready</td>
      </tr>
      <tr>
        <td><strong>Backend Runtime</strong></td>
        <td>Node.js 24.18 + Express 5.2.1</td>
        <td>Production Ready</td>
      </tr>
      <tr>
        <td><strong>Database Cluster</strong></td>
        <td>MongoDB Atlas (Replica Set M0 Cloud Cluster)</td>
        <td>Active (36 Seeded Stays)</td>
      </tr>
      <tr>
        <td><strong>Production Build Time</strong></td>
        <td>~2.5 - 3.1 seconds</td>
        <td>Optimized Rollup Chunks</td>
      </tr>
      <tr>
        <td><strong>Review Deletion Latency</strong></td>
        <td>~0ms perceived (Optimistic UI)</td>
        <td>Zero Lag Achieved</td>
      </tr>
      <tr>
        <td><strong>Cloudinary Storage</strong></td>
        <td>High-resolution responsive imagery with CDN caching</td>
        <td>Operational</td>
      </tr>
      <tr>
        <td><strong>Mapbox Geocoding</strong></td>
        <td>Real-time forward geocoding with GeoJSON Point</td>
        <td>Operational</td>
      </tr>
    </tbody>
  </table>

  <h2 class="subsection-title">7.2 Developer Sign-Off</h2>
  <div class="callout callout-info" style="margin-top: 1.5rem;">
    <strong>Conclusion:</strong> StayLust demonstrates end-to-end full-stack mastery, encompassing modern front-end state architecture, secure session-based backend engineering, third-party cloud SDK orchestration, and responsive cross-device UI design. It stands as a production-grade, resume-worthy project engineered for performance, maintainability, and scale.
  </div>

  <div style="margin-top: 3rem; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 1.5rem;">
    <div>
      <p style="font-weight: 700; color: #0f172a;">Developer & Engineer</p>
      <p style="color: #64748b;">Ranjit Sharma</p>
    </div>
    <div style="text-align: right;">
      <p style="font-weight: 700; color: #0f172a;">Repository & Documentation</p>
      <p style="color: #64748b;">github.com/ranjit-sharma/StayLust</p>
    </div>
  </div>

</body>
</html>`;

// Write HTML file
const htmlPath = path.join(__dirname, 'StayLust_Complete_Project_Notes.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log(`HTML generated successfully at: ${htmlPath}`);

// Compile HTML to PDF using Chrome Headless
const pdfPath = path.join(__dirname, '..', 'StayLust_Complete_Project_Notes.pdf');
const tempProfile = path.join(__dirname, 'temp_chrome_profile');

console.log("Compiling PDF with Chrome Headless...");
const chromeCmd = `cmd /c "start /wait \\"\\" \\"C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe\\" --headless=new --user-data-dir=\\"${tempProfile}\\" --no-pdf-header-footer --print-to-pdf=\\"${pdfPath}\\" \\"file:///${htmlPath.replace(/\\\\/g, '/')}\\""`;

try {
  execSync(chromeCmd, { stdio: 'inherit' });
  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log(`\n========================================`);
    console.log(`SUCCESS: StayLust Project Notes PDF Created!`);
    console.log(`Path: ${pdfPath}`);
    console.log(`Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`);
    console.log(`========================================\n`);
  } else {
    console.error("PDF file was not found after execution.");
  }
} catch (err) {
  console.error("Error generating PDF:", err);
}
