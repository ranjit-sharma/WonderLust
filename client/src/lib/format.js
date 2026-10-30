export const GST_RATE = 0.18;

export const formatPrice = (amount) => `₹${Math.round(Number(amount) || 0).toLocaleString("en-IN")}`;

export const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  } catch {
    return "—";
  }
};

// YYYY-MM-DD for <input type="date">, in the visitor's local time.
export const toDateInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const nightsBetween = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) return 0;
  const nights = Math.round((outDate - inDate) / 86400000);
  return nights > 0 ? nights : 0;
};

// Matches the server's total: Math.round(base * 1.18).
export const bookingTotals = (nights, price) => {
  const base = (Number(nights) || 0) * (Number(price) || 0);
  const total = Math.round(base * (1 + GST_RATE));
  return { base, gst: total - base, total };
};

// Only same-site paths are allowed as a post-login destination.
export const safeNext = (next) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/listings");

// Ask the image host for a resized, compressed copy instead of the 4000px original.
export const imageUrl = (url, width) => {
  if (!url) return url;
  if (typeof url !== "string") return "";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/c_limit,w_${width},q_auto,f_auto/`);
  }
  if (url.includes("images.unsplash.com")) {
    try {
      const u = new URL(url);
      u.searchParams.set("w", width);
      u.searchParams.set("q", "80");
      u.searchParams.set("auto", "format");
      return u.toString();
    } catch {
      return url;
    }
  }
  return url;
};
