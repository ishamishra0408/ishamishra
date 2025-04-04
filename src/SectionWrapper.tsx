import { motion } from 'framer-motion';
import React from 'react';

export const SectionWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="mb-16"
    >
      {children}
    </motion.section>
  );
};