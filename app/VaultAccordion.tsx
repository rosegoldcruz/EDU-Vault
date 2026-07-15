"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { useMotionTokens } from "./motion/tokens";

export type VaultAccordionItem = {
  title: string;
  detail: string;
};

type VaultAccordionProps = {
  items: VaultAccordionItem[];
  label: string;
  mode?: "benefits" | "faq";
  revealClassName?: string;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
};

export function VaultAccordion({
  items,
  label,
  mode = "benefits",
  revealClassName = "",
  activeIndex,
  onActiveIndexChange,
}: VaultAccordionProps) {
  const [uncontrolledIndex, setUncontrolledIndex] = useState(0);
  const openIndex = activeIndex ?? uncontrolledIndex;
  const tokens = useMotionTokens();
  const reduceMotion = useReducedMotion();
  const transition = tokens ? { duration: tokens.micro, ease: tokens.easeHover } : undefined;
  const detailTransition = tokens ? { duration: tokens.micro, ease: tokens.easeHover, delay: tokens.micro + 0.1 } : undefined;

  return (
    <div className={`vault-accordion vault-accordion-${mode}`} aria-label={label}>
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div className={revealClassName} key={item.title}>
            <motion.article className="vault-row" layout transition={transition}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => {
                  const nextIndex = open ? -1 : index;
                  if (activeIndex === undefined) setUncontrolledIndex(nextIndex);
                  onActiveIndexChange?.(nextIndex);
                }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.title}</strong>
                <motion.i
                  aria-hidden="true"
                  animate={reduceMotion ? undefined : { rotate: open ? 90 : 0 }}
                  transition={transition}
                />
              </button>
              <AnimatePresence initial={false}>
                {open ? (
                  <motion.div
                    className="vault-row-detail"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition }}
                    transition={detailTransition}
                  >
                    <p>{item.detail}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.article>
          </div>
        );
      })}
    </div>
  );
}
