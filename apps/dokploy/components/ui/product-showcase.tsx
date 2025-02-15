"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export const ProductShowcase = () => {
  return (
    <div className="relative w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-6xl"
      >
        <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-border/50 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/50 to-transparent z-10" />
          <Image
            src="/dashboard-preview.png"
            alt="TOM3 Console Dashboard"
            fill
            className="object-cover"
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-6 -right-6 w-72 aspect-video rounded-lg overflow-hidden border border-border/50 shadow-xl"
        >
          <Image
            src="/feature-preview.png"
            alt="Feature Preview"
            fill
            className="object-cover"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};
