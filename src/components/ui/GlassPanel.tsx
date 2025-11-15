"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

type GlassPanelProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  disableHover?: boolean;
}>;

export default function GlassPanel({
  children,
  className,
  delay = 0,
  disableHover = false,
}: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={
        disableHover
          ? undefined
          : {
              y: -6,
              scale: 1.02,
              transition: { type: "spring", stiffness: 320, damping: 22 },
            }
      }
      whileTap={disableHover ? undefined : { scale: 0.99 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={cn("card glass-panel", className)}
    >
      {children}
    </motion.div>
  );
}



