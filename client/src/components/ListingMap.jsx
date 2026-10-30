import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getMeta } from "../lib/api.js";
import { useTheme } from "../lib/theme.js";

const styles = {
  light: "mapbox://styles/mapbox/streets-v12",
  dark: "mapbox://styles/mapbox/dark-v11",
};

// Loaded with React.lazy: mapbox-gl is large and only this page needs it.
export default function ListingMap({ coordinates, title, location = "" }) {
  const container = useRef(null);
  const map = useRef(null);
  const { dark } = useTheme();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMeta()
      .then(({ mapToken }) => {
        if (cancelled || !container.current) return;
        mapboxgl.accessToken = mapToken;
        map.current = new mapboxgl.Map({
          container: container.current,
          style: dark ? styles.dark : styles.light,
          center: coordinates,
          zoom: 9,
          cooperativeGestures: true,
        });
        map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

        // Modern, stylish popup card
        const popup = document.createElement("div");
        popup.className = "map-popup-card";

        const header = document.createElement("div");
        header.className = "map-popup-header";

        const iconBadge = document.createElement("div");
        iconBadge.className = "map-popup-icon-badge";
        iconBadge.innerHTML = `<svg class="size-4 text-[#fe424d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg>`;

        const textContainer = document.createElement("div");
        textContainer.className = "map-popup-text";

        const heading = document.createElement("h4");
        heading.className = "map-popup-title";
        heading.textContent = title;
        textContainer.appendChild(heading);

        if (location) {
          const loc = document.createElement("p");
          loc.className = "map-popup-loc";
          loc.textContent = location;
          textContainer.appendChild(loc);
        }

        header.appendChild(iconBadge);
        header.appendChild(textContainer);
        popup.appendChild(header);

        const badge = document.createElement("div");
        badge.className = "map-popup-badge";
        badge.innerHTML = `<svg class="size-3.5 shrink-0 text-neutral-500 dark:text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg><span>Exact location provided after booking</span>`;
        popup.appendChild(badge);

        new mapboxgl.Marker({ color: "#fe424d" })
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: true, maxWidth: "320px" }).setDOMContent(popup))
          .addTo(map.current);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // Created once per location; theme changes are handled below without rebuilding.
  }, [coordinates[0], coordinates[1], title, location]);

  useEffect(() => {
    map.current?.setStyle(dark ? styles.dark : styles.light);
  }, [dark]);

  if (failed) {
    return <div className="grid h-full place-items-center text-sm text-neutral-500">Map unavailable</div>;
  }

  return (
    <div className="relative h-full">
      <div ref={container} className="h-full w-full" />
    </div>
  );
}
