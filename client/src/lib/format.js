export const GST_RATE = 0.18;

export const formatPrice = (amount) => `₹${Math.round(Number(amount) || 0).toLocaleString("en-IN")}`;

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

// YYYY-MM-DD for <input type="date">, in the visitor's local time.
export const toDateInput = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const nightsBetween = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const nights = Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
  return nights > 0 ? nights : 0;
};

// Matches the server's total: Math.round(base * 1.18).
export const bookingTotals = (nights, price) => {
  const base = nights * price;
  const total = Math.round(base * (1 + GST_RATE));
  return { base, gst: total - base, total };
};

// Only same-site paths are allowed as a post-login destination.
export const safeNext = (next) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/listings");

// Ask the image host for a resized, compressed copy instead of the 4000px original.
export const imageUrl = (url, width) => {
  if (!url) return url;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/c_limit,w_${width},q_auto,f_auto/`);
  }
  if (url.includes("images.unsplash.com")) {
    const u = new URL(url);
    u.searchParams.set("w", width);
    u.searchParams.set("q", "80");
    u.searchParams.set("auto", "format");
    return u.toString();
  }
  return url;
};
