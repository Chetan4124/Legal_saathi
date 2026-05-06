import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

// ── Premium Animated Counter ──
function Counter({ value, label }) {
  return (
    <div className="text-center">
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="block text-4xl font-bold text-white md:text-5xl"
      >
        {value}
      </motion.span>
      <span className="mt-1 block text-sm font-medium text-blue-200">{label}</span>
    </div>
  );
}

// ── Feature Card with hover tilt ──
function FeatureCard({ icon, title, desc, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative rounded-3xl bg-white p-8 shadow-lg shadow-gray-200/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-200/30 dark:bg-gray-900 dark:shadow-gray-900/50"
    >
      {/* Gradient border on hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100 -z-10 blur" />
      <div className="absolute inset-[2px] rounded-[22px] bg-white dark:bg-gray-900 -z-10" />

      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-3xl dark:from-blue-900/20 dark:to-indigo-900/20 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">{desc}</p>

      {/* Hover arrow */}
      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-600 opacity-0 transition-all duration-300 group-hover:opacity-100 dark:text-blue-400">
        Learn more
        <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </motion.div>
  );
}

// ── Testimonial Card ──
function TestimonialCard({ quote, name, role, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="rounded-3xl bg-white p-8 shadow-lg dark:bg-gray-900"
    >
      {/* Stars */}
      <div className="mb-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="mb-6 text-base leading-relaxed text-gray-600 dark:text-gray-300 italic">
        "{quote}"
      </p>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-white">{name}</p>
          <p className="text-xs text-gray-400">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* ──── NAVIGATION ──── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-transparent bg-white/80 backdrop-blur-xl dark:bg-gray-950/80 dark:border-gray-800/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Legal Saathi</span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {['Features', 'How It Works', 'Testimonials', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm font-medium text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Get Started Free
            </Link>
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 md:hidden dark:hover:bg-gray-800"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t bg-white px-6 py-4 md:hidden dark:bg-gray-950 dark:border-gray-800"
          >
            <div className="flex flex-col gap-3">
              {['Features', 'How It Works', 'Testimonials'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="text-sm font-medium text-gray-500 dark:text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <Link
                to="/login"
                className="rounded-xl px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white dark:bg-white dark:text-gray-900"
              >
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ──── HERO SECTION ──── */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-indigo-400/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-blue-300/10 via-indigo-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 dark:border-blue-800 dark:bg-blue-900/20"
              >
                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  AI-Powered Legal Intelligence
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl lg:text-7xl dark:text-white"
              >
                Your Legal Documents,
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Instantly Decoded
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mt-8 text-lg leading-relaxed text-gray-500 md:text-xl dark:text-gray-400"
              >
                Upload any legal document — contracts, agreements, notices — and let our AI extract key clauses, summarize content, and answer your questions in plain English. Built for lawyers, businesses, and everyone in between.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-10 flex flex-wrap gap-4"
              >
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-gray-800 hover:scale-105 hover:shadow-xl hover:shadow-gray-900/20 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  Start Free Trial
                  <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-gray-200 px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-900"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Watch Demo
                </a>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="mt-10 flex items-center gap-6"
              >
                <div className="flex -space-x-3">
                  {['https://i.pravatar.cc/40?img=1', 'https://i.pravatar.cc/40?img=2', 'https://i.pravatar.cc/40?img=3', 'https://i.pravatar.cc/40?img=4'].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="User"
                      className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-950"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Trusted by <span className="font-semibold text-gray-700 dark:text-gray-300">2,000+</span> legal professionals
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right - Visual / Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Floating dashboard mockup */}
                <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-gray-300/50 dark:bg-gray-900 dark:shadow-gray-900/80">
                  {/* Mock header */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 ml-4 h-3 rounded-full bg-gray-100 dark:bg-gray-800" />
                  </div>

                  {/* Mock content */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3 dark:bg-blue-900/20">
                      <span className="text-2xl">📄</span>
                      <div>
                        <div className="h-3 w-32 rounded bg-blue-200 dark:bg-blue-800" />
                        <div className="mt-1 h-2 w-24 rounded bg-blue-100 dark:bg-blue-900" />
                      </div>
                      <span className="ml-auto rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Completed</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-purple-50 p-3 dark:bg-purple-900/20">
                      <span className="text-2xl">🤖</span>
                      <div>
                        <div className="h-3 w-40 rounded bg-purple-200 dark:bg-purple-800" />
                        <div className="mt-1 h-2 w-20 rounded bg-purple-100 dark:bg-purple-900" />
                      </div>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                      <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-700 mb-2" />
                      <div className="h-2 w-3/4 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
                      <div className="h-2 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
                </div>

                {/* Floating stat card */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-8 -left-8 rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 text-2xl text-white">✓</div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">98%</p>
                      <p className="text-xs text-gray-400">Accuracy Rate</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating AI badge */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -top-6 -right-6 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 px-5 py-3 text-white shadow-xl"
                >
                  <p className="text-sm font-bold">✨ AI-Powered</p>
                  <p className="text-xs text-blue-100">Gemini 3 Flash</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──── STATS BAR ──── */}
      <section className="border-y bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <Counter value="50K+" label="Documents Analyzed" />
            <Counter value="2,000+" label="Active Users" />
            <Counter value="98%" label="Accuracy Rate" />
            <Counter value="24/7" label="AI Availability" />
          </div>
        </div>
      </section>

      {/* ──── FEATURES SECTION ──── */}
      <section id="features" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">Features</span>
            <h2 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Understand Your Documents</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
              Legal Saathi combines advanced OCR, AI-powered analysis, and an intuitive chat interface to make legal documents accessible to everyone.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="🔍"
              title="Smart OCR Engine"
              desc="Upload PDFs, PNGs, or JPEGs — our OCR extracts every word with high precision, even from scanned documents with complex layouts."
              index={0}
            />
            <FeatureCard
              icon="🤖"
              title="AI Legal Chat"
              desc="Ask questions in plain English. The AI understands legal context, cites specific clauses, and explains complex terms simply."
              index={1}
            />
            <FeatureCard
              icon="📊"
              title="Instant Summaries"
              desc="Get structured summaries with key clauses, parties involved, important dates, obligations, and potential risks — all auto-generated."
              index={2}
            />
            <FeatureCard
              icon="🔒"
              title="Bank-Level Security"
              desc="Your documents are encrypted at rest and in transit. We never share your data. Enterprise-grade security for sensitive legal files."
              index={3}
            />
            <FeatureCard
              icon="💬"
              title="Conversation Memory"
              desc="The AI remembers your chat context. Ask follow-up questions and dive deeper into specific sections without repeating yourself."
              index={4}
            />
            <FeatureCard
              icon="⚡"
              title="Lightning Fast"
              desc="Results in seconds, not minutes. Built on Google's Gemini 3 Flash architecture for near-instant document analysis and responses."
              index={5}
            />
          </div>
        </div>
      </section>

      {/* ──── HOW IT WORKS ──── */}
      <section id="how-it-works" className="bg-gray-50/50 py-24 lg:py-32 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">How It Works</span>
            <h2 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
              Three Simple Steps
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Upload Document', desc: 'Drag & drop any legal document — PDF, scanned image, or photo. We handle the rest.', icon: '📤' },
              { step: '02', title: 'AI Processes It', desc: 'Our OCR extracts text, and Gemini AI analyzes the content for key insights and clauses.', icon: '⚙️' },
              { step: '03', title: 'Chat & Understand', desc: 'Ask questions, get summaries, and understand your legal document in plain language.', icon: '💬' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="relative text-center"
              >
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-4xl shadow-lg dark:bg-gray-900">
                  {item.icon}
                </div>
                <span className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Step {item.step}</span>
                <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-400">{item.desc}</p>

                {/* Connector Line */}
                {i < 2 && (
                  <div className="absolute top-10 left-[60%] hidden h-[2px] w-[80%] bg-gradient-to-r from-blue-300 to-transparent md:block dark:from-blue-800" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── TESTIMONIALS ──── */}
      <section id="testimonials" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">Testimonials</span>
            <h2 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
              Loved by Legal Teams
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            <TestimonialCard
              quote="Legal Saathi has cut our contract review time by 70%. The AI summaries are incredibly accurate and the chat feature is a game-changer for quick clause lookups."
              name="Priya Sharma"
              role="Corporate Lawyer, Delhi"
              delay={0}
            />
            <TestimonialCard
              quote="As a startup founder, I can't afford a full-time legal team. Legal Saathi helps me understand NDAs, vendor contracts, and terms of service without the hefty legal bills."
              name="Arjun Mehta"
              role="Founder, TechVentures"
              delay={0.15}
            />
            <TestimonialCard
              quote="The OCR accuracy on scanned Hindi documents is impressive. It's become an essential tool for our legal aid clinic serving underserved communities."
              name="Dr. Ananya Reddy"
              role="Legal Aid Director"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ──── CTA SECTION ──── */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-12 text-center md:p-16 lg:p-20"
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />

            <div className="relative">
              <h2 className="text-4xl font-bold text-white md:text-5xl">
                Ready to Decode Your Legal Documents?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-200">
                Join 2,000+ legal professionals and businesses who trust Legal Saathi for fast, accurate document analysis. Start free — no credit card required.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-gray-900 transition-all hover:scale-105 hover:shadow-xl hover:shadow-white/20"
                >
                  Get Started Free
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── FOOTER ──── */}
      <footer className="border-t bg-white py-12 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚖️</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Legal Saathi</span>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              © {new Date().getFullYear()} Legal Saathi. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition">Terms of Service</a>
              <a href="#" className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}