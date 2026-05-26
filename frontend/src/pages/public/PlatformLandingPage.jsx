import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Share2, Settings, ShoppingBag, Palette, Cake, Gem,
  Hand, Brush, Gift, Flower2, Scissors, CalendarCheck, BookOpen,
  BarChart2, MessageCircle, HelpCircle, Zap, Mail,
} from 'lucide-react';

const BUSINESS_TYPES = [
  { icon: Sparkles,     label: 'Nail Artists' },
  { icon: Hand,         label: 'Mehendi Artists' },
  { icon: Gem,          label: 'Jewellery Brands' },
  { icon: Cake,         label: 'Cake & Bakery' },
  { icon: Brush,        label: 'Makeup Artists' },
  { icon: Scissors,     label: 'Hair Stylists' },
  { icon: Gift,         label: 'Gift Stores' },
  { icon: Flower2,      label: 'Florists' },
  { icon: ShoppingBag,  label: '80+ business types' },
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
    desc: "Show your WhatsApp number on your shop so customers can reach you instantly.",
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
      {/* ── Nav ── */}
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/artspace-logo.png" alt="ArtSpace" className="h-9 object-contain" />
          <span className="font-semibold text-gray-900 text-lg">ArtSpace</span>
        </div>
        <Link
          to="/signup"
          className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors"
        >
          Get Your Store
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          For creators &amp; small businesses
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight mb-5">
          Your business,{' '}
          <span className="text-violet-600">beautifully online</span>.
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
          Create your own shop for nail art, mehendi, jewellery, cakes, makeup, gifts, and 80+
          other business types — in minutes. No tech skills needed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/signup"
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors text-sm"
          >
            Get Your Store — It's Free →
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-3">7-day free trial · No credit card required</p>
      </section>

      {/* ── How it works ── */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">How it works</h2>
          <p className="text-sm text-gray-500 text-center mb-10">Three steps to your own online shop</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div key={step.step} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                    <step.icon className="w-[18px] h-[18px] text-violet-600" />
                  </div>
                  <span className="text-xs font-bold text-violet-400 tracking-wider">{step.step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Business types ── */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Made for your business</h2>
          <p className="text-sm text-gray-500 mb-8">
            From beauty artists to handmade brands — if you sell it, ArtSpace handles it
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {BUSINESS_TYPES.map((bt) => (
              <div
                key={bt.label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm text-sm font-medium text-gray-700"
              >
                <bt.icon className="w-4 h-4 text-violet-500" />
                {bt.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">Everything you need</h2>
          <p className="text-sm text-gray-500 text-center mb-10">
            Powerful features built for creative businesses
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                  <f.icon className="w-[18px] h-[18px] text-violet-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="bg-violet-600 py-14 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 mb-5">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">Ready to go online?</h2>
          <p className="text-violet-200 text-sm mb-6">
            Join shop owners already using ArtSpace. Start your free 7-day trial today.
          </p>
          <Link
            to="/signup"
            className="inline-block px-6 py-3 rounded-xl bg-white text-violet-700 font-semibold text-sm hover:bg-violet-50 transition-colors"
          >
            Create Your Free Shop →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/artspace-logo.png" alt="ArtSpace" className="h-6 object-contain" />
            <span className="text-sm font-semibold text-gray-700">ArtSpace</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            ArtSpace © {new Date().getFullYear()} · All rights reserved
          </p>
          {/* Developer watermark */}
          
            <a href="mailto:er.cs.krushnasoni@gmail.com"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors"
            title="Contact developer"
          >
            <Mail className="w-5 h-5" />
            Built by Krushna Soni
          </a>
        </div>
      </footer>
    </div>
  );
}