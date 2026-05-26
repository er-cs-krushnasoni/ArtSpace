import { Link } from 'react-router-dom';
import { Sparkles, Share2, Settings, ShoppingBag, Palette, Cake, Gem, Hand, Brush, Gift, Flower2, Scissors } from 'lucide-react';

const BUSINESS_TYPES = [
  { icon: Sparkles, label: 'Nail Artists' },
  { icon: Hand, label: 'Mehendi Artists' },
  { icon: Gem, label: 'Jewellery Brands' },
  { icon: Cake, label: 'Cake & Bakery' },
  { icon: Brush, label: 'Makeup Artists' },
  { icon: Scissors, label: 'Hair Stylists' },
  { icon: Gift, label: 'Gift Stores' },
  { icon: Flower2, label: 'Florists' },
  { icon: ShoppingBag, label: '80+ business types' },
];

const STEPS = [
  {
    icon: Settings,
    step: '01',
    title: 'Sign up',
    desc: 'Create your shop in minutes. Pick your URL, choose your business type, and you\'re in.',
  },
  {
    icon: Palette,
    step: '02',
    title: 'Customize your shop',
    desc: 'Add your products, upload photos, set your colors and logo. Make it yours.',
  },
  {
    icon: Share2,
    step: '03',
    title: 'Share your link',
    desc: 'Share your shop URL on WhatsApp or Instagram. Customers can order instantly — no app needed.',
  },
];

export default function PlatformLandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center">
            <img src="/artspace-logo.png" alt="ArtSpace" className="h-10 object-contain" />
          </div>
          <span className="font-semibold text-gray-900 text-lg">ArtSpace</span>
        </div>
        <Link
          to="/signup"
          className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors"
        >
          Get Your Store
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          For creators & small businesses
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight mb-5">
          Your business,{' '}
          <span className="text-violet-600">beautifully online</span>.
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
          Create your own shop for nail art, mehendi, jewellery, cakes, makeup, gifts, and 80+ other business types — in minutes.
          No tech skills needed.
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

      {/* How it works */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">How it works</h2>
          <p className="text-sm text-gray-500 text-center mb-10">Three steps to your own online shop</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div key={step.step} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                    <step.icon className="w-4.5 h-4.5 text-violet-600" style={{ width: 18, height: 18 }} />
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

      {/* Business types */}
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

      {/* CTA banner */}
      <section className="bg-violet-600 py-14 px-6">
        <div className="max-w-xl mx-auto text-center">
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

      {/* Footer */}
      <footer className="py-8 px-6 text-center">
        <p className="text-xs text-gray-400">ArtSpace © 2025 · All rights reserved</p>
      </footer>
    </div>
  );
}