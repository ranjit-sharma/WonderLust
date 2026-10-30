import { useState } from "react";

// Fades (and gently settles) an image in once it has actually loaded, instead of popping in.
export default function SmoothImage({ className = "", settle = true, ...props }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      {...props}
      // cached images can finish before React attaches onLoad
      ref={(el) => {
        if (el?.complete && el.naturalWidth) setLoaded(true);
      }}
      onLoad={() => setLoaded(true)}
      className={`transition-[opacity,scale] duration-700 ease-smooth ${
        loaded ? "opacity-100" : `opacity-0 ${settle ? "scale-[1.04]" : ""}`
      } ${className}`}
    />
  );
}
