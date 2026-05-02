import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScaleIcon, ShieldIcon, BrainIcon } from '../components/Icons';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-gray-800 dark:text-white"
        >
          ⚖️ Legal Saathi
        </motion.span>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-3"
        >
          <Link
            to="/login"
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-6xl lg:text-7xl"
        >
          Your AI-Powered
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Legal Advisor
          </span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 dark:text-gray-400"
        >
          Upload legal documents, extract key insights with OCR, and chat with an AI that understands your contracts, agreements, and notices — all in one place.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Link
            to="/register"
            className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all hover:scale-105"
          >
            Start Free →
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-gray-300 px-8 py-4 text-lg font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-all"
          >
            I have an account
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: <ScaleIcon />,
              title: 'Smart OCR',
              desc: 'Extract text from PDFs and images instantly with advanced OCR technology.',
            },
            {
              icon: <BrainIcon />,
              title: 'AI Analysis',
              desc: 'Chat with an AI that understands legal context and cites specific clauses.',
            },
            {
              icon: <ShieldIcon />,
              title: 'Secure & Private',
              desc: 'Your documents are encrypted and never shared. Enterprise-grade security.',
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="rounded-2xl border bg-white p-8 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center dark:border-gray-800">
        <p className="text-sm text-gray-400">
          © 2026 Legal Saathi. Built with ❤️ for justice.
        </p>
      </footer>
    </div>
  );
}