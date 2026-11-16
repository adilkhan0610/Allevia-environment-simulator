import type { Variants, Transition } from 'framer-motion'

export const standardTransition: Transition = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1], // ease-spring
}

export const smoothTransition: Transition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1], // ease-smooth
}

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: standardTransition,
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: standardTransition,
  },
  exit: {
    opacity: 0,
    y: 12,
    transition: { duration: 0.2 },
  },
}

export const slideIn: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: standardTransition,
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: 0.2 },
  },
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: standardTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.2 },
  },
}

export const subtleGlow: Variants = {
  initial: { boxShadow: '0 0 0 rgba(0, 221, 245, 0)' },
  animate: {
    boxShadow: '0 0 16px rgba(0, 221, 245, 0.3)',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
}

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}
