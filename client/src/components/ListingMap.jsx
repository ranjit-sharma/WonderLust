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
export default function ListingMap({ coordinates, title }) {
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
          cooperativeGestures: true, // one-finger scroll moves the page, not the map
        });
        map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

        // Text, not HTML, so a listing title can't inject markup.
        const popup = document.createElement("div");
        const heading = document.createElement("strong");
        heading.textContent = title;
        const note = document.createElement("p");
        note.textContent = "Exact location will be provided after booking";
        note.style.cssText = "margin:4px 0 0;font-size:12px;opacity:.7";
        popup.append(heading, note);

        new mapboxgl.Marker({ color: "#fe424d" })
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setDOMContent(popup))
          .addTo(map.current);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // Created once per location; theme changes are handled below without rebuilding.
  }, [coordinates[0], coordinates[1], title]);

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
