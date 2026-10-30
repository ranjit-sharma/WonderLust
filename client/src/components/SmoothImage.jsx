import { useState } from "react";

// Fades an image in smoothly once loaded without jarring layout shifts or heavy scale transitions.
export default function SmoothImage({ className = "", settle = true, ...props }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      {...props}
      decoding="async"
      ref={(el) => {
        if (el?.complete && el.naturalWidth && !loaded) setLoaded(true);
      }}
      onLoad={() => setLoaded(true)}
      className={`transition-opacity duration-300 ease-smooth ${
        loaded ? "opacity-100" : "opacity-0"
      } ${className}`}
    />
  );
}
