import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Share2, Settings, ShoppingBag, Palette, Cake, Gem,
  Hand, Brush, Gift, Flower2, Scissors, CalendarCheck, BookOpen,
  BarChart2, MessageCircle, HelpCircle, Zap, Mail, ArrowRight,
} from 'lucide-react';

const BUSINESS_TYPES = [
  { icon: Sparkles,    label: 'Nail Artists' },
  { icon: Hand,        label: 'Mehendi Artists' },
  { icon: Gem,         label: 'Jewellery Brands' },
  { icon: Cake,        label: 'Cake & Bakery' },
  { icon: Brush,       label: 'Makeup Artists' },
  { icon: Scissors,    label: 'Hair Stylists' },
  { icon: Gift,        label: 'Gift Stores' },
  { icon: Flower2,     label: 'Florists' },
  { icon: ShoppingBag, label: '80+ business types' },
];

const STEPS = [
  {
    icon: Settings,
    step: '01',
    title: 'Sign up',
    desc: "Create your shop in minutes. Pick your URL, choose your business type, and you're in.",
  },
  {
    icon: Palette,
    step: '02',
    title: 'Customize your shop',
    desc: 'Add your products, upload photos, set your colors and logo. Make it completely yours.',
  },
  {
    icon: Share2,
    step: '03',
    title: 'Share your link',
    desc: 'Share your shop URL on WhatsApp or Instagram. Customers order instantly — no app needed.',
  },
];

const FEATURES = [
  {
    icon: ShoppingBag,
    title: 'Custom Orders',
    desc: 'Let customers send reference images and special requests for personalized creations.',
  },
  {
    icon: CalendarCheck,
    title: 'Appointment Booking',
    desc: 'Accept at-home or in-shop appointments directly from your public shop page.',
  },
  {
    icon: HelpCircle,
    title: 'Style Quiz',
    desc: 'Help customers discover the right product through an interactive quiz you build.',
  },
  {
    icon: BookOpen,
    title: 'Blog',
    desc: 'Share tips, showcases, and updates. Build trust and keep customers coming back.',
  },
  {
    icon: BarChart2,
    title: 'Analytics',
    desc: 'See what sells, track revenue, and understand how customers engage with your shop.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Integration',
    desc: 'Show your WhatsApp number on your shop so customers can reach you instantly.',
  },
];

export default function PlatformLandingPage() {
  useEffect(() => {
    document.title = 'ArtSpace — Start Your Online Shop';
  }, []);

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
    >

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/artspace-logo.png" alt="ArtSpace" className="h-14 object-contain" />
          <span className="font-bold text-gray-900 text-lg tracking-tight">ArtSpace</span>
        </div>
        <Link
          to="/signup"
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-violet-200"
        >
          Get Your Store
        </Link>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-7">
          <Sparkles className="w-3.5 h-3.5" />
          For creators &amp; small businesses
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 tracking-tight">
          Turn your craft into a{' '}
          <span
            className="relative inline-block"
            style={{ color: '#7c3aed' }}
          >
            brand
            {/* Underline accent */}
            <svg
              className="absolute -bottom-1 left-0 w-full"
              height="6"
              viewBox="0 0 100 6"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q25 1 50 4 Q75 7 100 3"
                stroke="#7c3aed"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.35"
              />
            </svg>
          </span>
          .
        </h1>

        <p className="text-xl font-semibold text-gray-500 mb-5">
          Your business, beautifully online.
        </p>

        <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Create your own shop for nail art, mehendi, jewellery, cakes, makeup, gifts, and 80+
          other business types — in minutes. No tech skills needed.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-all duration-150 text-sm shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5"
          >
            Get Your Store — It's Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-3">7-day free trial · No Payment Details Required</p>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-500 text-center mb-2">
            Getting started
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2 tracking-tight">
            How it works
          </h2>
          <p className="text-sm text-gray-400 text-center mb-10">
            Three steps to your own online shop
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div
                key={step.step}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-violet-600" />
                  </div>
                  <span className="text-xs font-bold text-violet-400 tracking-widest">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5 text-base">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Business types ──────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-2">
            Who it's for
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Made for your business
          </h2>
          <p className="text-sm text-gray-400 mb-9">
            From beauty artists to handmade brands — if you sell it, ArtSpace handles it
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {BUSINESS_TYPES.map((bt) => (
              <div
                key={bt.label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm text-sm font-semibold text-gray-700 hover:border-violet-300 hover:shadow-md transition-all duration-150"
              >
                <bt.icon className="w-4 h-4 text-violet-500 flex-shrink-0" />
                {bt.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-500 text-center mb-2">
            Features
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2 tracking-tight">
            Everything you need
          </h2>
          <p className="text-sm text-gray-400 text-center mb-10">
            Powerful features built for creative businesses
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mb-3 group-hover:bg-violet-600 transition-colors duration-200">
                  <f.icon className="w-5 h-5 text-violet-600 group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-sm">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────────────────── */}
      <section
        className="py-16 px-6"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}
      >
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-6">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
            Ready to go online?
          </h2>
          <p className="text-violet-200 text-sm mb-8 leading-relaxed">
            Join shop owners already using ArtSpace. Start your free 7-day trial today —
            no credit card required.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-violet-700 font-bold text-sm hover:bg-violet-50 transition-all duration-150 hover:-translate-y-0.5 shadow-lg"
          >
            Create Your Free Shop
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/artspace-logo.png" alt="ArtSpace" className="h-14 object-contain" />
            <span className="text-sm font-bold text-gray-700 tracking-tight">ArtSpace</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            ArtSpace © {new Date().getFullYear()} · All rights reserved
          </p>
          <a
            href="mailto:er.cs.krushnasoni@gmail.com"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-violet-600 transition-colors"
            title="Contact developer"
          >
            <Mail className="w-4 h-4" />
            Built by Krushna Soni
          </a>
        </div>
      </footer>

    </div>
  );
}