'use client';

export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

export const cardVariants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  }),
  hover: { y: -4, transition: { duration: 0.2, ease: 'easeOut' } },
};

export const slideFromLeft = {
  initial: { opacity: 0, x: -20 },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.08, duration: 0.35 },
  }),
};

export const slideFromRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

export const swipeLeft = {
  exit: { x: -320, rotate: -12, opacity: 0, transition: { duration: 0.4, ease: [0.4, 0, 1, 1] } },
};

export const swipeRight = {
  exit: { x: 320, rotate: 12, opacity: 0, transition: { duration: 0.4, ease: [0.4, 0, 1, 1] } },
};

export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { repeat: Infinity, duration: 1.8, ease: 'linear' },
  },
};

export const floatOrb = (delay: number) => ({
  animate: {
    y: [0, -18, 0],
    x: [0, 12, 0],
    transition: { repeat: Infinity, duration: 7 + delay, ease: 'easeInOut', delay },
  },
});

export const buttonTap = { whileTap: { scale: 0.96 }, whileHover: { scale: 1.02 } };

export const magneticHover = { whileHover: { scale: 1.04, y: -2 } };

export const modalSlideUp = {
  initial: { opacity: 0, y: 60, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: { opacity: 0, y: 40, scale: 0.97, transition: { duration: 0.2 } },
};

export const drawerSlideUp = {
  initial: { y: '100%' },
  animate: { y: 0, transition: { type: 'spring', stiffness: 280, damping: 30 } },
  exit: { y: '100%', transition: { duration: 0.25 } },
};
