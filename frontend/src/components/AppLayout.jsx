import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="ml-[260px] flex-1 p-8"
      >
        {children}
      </motion.main>
    </div>
  );
}