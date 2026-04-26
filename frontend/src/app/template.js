'use client';

import { motion } from 'framer-motion';

export default function Template({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ ease: [0.175, 0.885, 0.32, 1], duration: 0.5 }}
            style={{ width: '100%' }}
        >
            {children}
        </motion.div>
    );
}
