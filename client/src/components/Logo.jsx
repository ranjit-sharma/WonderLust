import { Link } from "react-router";
import { motion } from "motion/react";
import { Compass } from "lucide-react";
import { ease } from "./ui.jsx";

export default function Logo({ className = "", iconSize = "size-8", textSize = "text-xl" }) {
  return (
    <Link
      to="/listings"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`group inline-flex items-center gap-2 text-brand-500 focus-visible:outline-none ${className}`}
      aria-label="WonderLust home"
    >
      <motion.span
        whileHover={{ rotate: 180 }}
        transition={{ duration: 0.6, ease }}
        className="grid transition-transform duration-500 ease-smooth group-hover:rotate-180"
      >
        <Compass className={iconSize} strokeWidth={2.2} />
      </motion.span>
      <span className={`${textSize} font-extrabold tracking-tight`}>WonderLust</span>
    </Link>
  );
}
