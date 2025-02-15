"use client";
import { motion } from "framer-motion";

export const TextScramble = ({ text }: { text: string }) => {
  return (
    <motion.span
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className="inline-block cursor-default"
    >
      {text}
    </motion.span>
  );
};
