import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Mail, ChevronDown, Check,
  ShoppingBag, CalendarCheck, BarChart2, MessageCircle,
  BookOpen, HelpCircle, Zap, Star,
  Gem, Cake, Brush, Scissors, Gift, Flower2, Hand, Palette,
  Settings, Share2, Package, CreditCard, TrendingUp,
} from 'lucide-react';
import api from '../../api/axiosInstance';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const BUSINESS_TYPES = [
  { icon: Sparkles,    label: 'Nail Artists' },
  { icon: Hand,        label: 'Mehendi Artists' },
  { icon: Gem,         label: 'Jewellery Brands' },
  { icon: Cake,        label: 'Cake & Bakery' },
  { icon: Brush,       label: 'Makeup Artists' },
  { icon: Scissors,    label: 'Hair Stylists' },
  { icon: Gift,        label: 'Gift Stores' },
  { icon: Flower2,     label: 'Florists' },
  { icon: Palette,     label: '80+ types' },
];

const STEPS = [
  {
    icon: Settings,
    num: '01',
    title: 'Sign up in minutes',
    desc: "Pick your shop URL, choose your business type, and your store is ready. No setup calls, no waiting.",
  },
  {
    icon: Palette,
    num: '02',
    title: 'Make it yours',
    desc: 'Add your logo, brand colors, products, and photos. Customers will never see the ArtSpace name.',
  },
  {
    icon: Share2,
    num: '03',
    title: 'Share & start earning',
    desc: 'Drop your shop link on WhatsApp or Instagram. Customers order instantly — no app, no account.',
  },
];

const FEATURES = [
  {
    icon: ShoppingBag,
    title: 'Product shop',
    desc: 'Showcase your work with photo galleries. Customers browse, choose, and place orders — all in one flow.',
  },
  {
    icon: CalendarCheck,
    title: 'Appointments',
    desc: 'Accept at-home or in-shop bookings. Customers pick dates right from your shop page.',
  },
  {
    icon: HelpCircle,
    title: 'Style quiz',
    desc: 'Build a quiz that guides customers to the right product. Works for nail art, jewellery, cakes, and more.',
  },
  {
    icon: BookOpen,
    title: 'Blog',
    desc: 'Post tutorials, showcase work, and share updates. Build a loyal audience around your craft.',
  },
  {
    icon: BarChart2,
    title: 'Analytics',
    desc: 'Know what sells, when customers order, and how revenue trends — without opening a spreadsheet.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp link',
    desc: 'One tap from your shop to your WhatsApp. Customers reach you without hunting for your number.',
  },
];

const FAQS = [
  {
    q: 'Do my customers need to create an account?',
    a: 'Never. Customers visit your link, browse your work, and place orders — no signup, no app, no friction.',
  },
  {
    q: 'Will my shop look like everyone else\'s?',
    a: 'No. You set your own logo, colors, and fonts. Your shop shows only your brand name.',
  },
  {
    q: 'Can I change my shop URL later?',
    a: 'Yes, anytime from your settings. Just know that the old URL stops working immediately, so update your links.',
  },
  {
    q: 'Can I accept custom orders and reference images?',
    a: 'Yes. Your shop has a dedicated Custom Order page where customers describe what they want and attach reference photos.',
  },
  {
    q: 'Is there a transaction fee on orders?',
    a: 'No. ArtSpace charges a flat subscription — orders go directly between you and your customer. We take nothing from sales.',
  },
  {
    q: 'Can I manage everything from my phone?',
    a: 'Yes. Your admin dashboard is a PWA — install it on your phone home screen and manage orders, tasks, and payments on the go.',
  },
  {
    q: 'What if I run more than one business?',
    a: 'Each shop is a separate account with its own URL and subscription. You can have as many shops as you need.',
  },
];

const PLAN_ORDER = ['trial', '1m', '3m', '6m', '12m', 'custom'];
const PLAN_META = {
  trial:  { label: 'Free Trial',  duration: '7 days',   highlight: true },
  '1m':   { label: '1 Month',     duration: '30 days' },
  '3m':   { label: '3 Months',    duration: '90 days' },
  '6m':   { label: '6 Months',    duration: '180 days' },
  '12m':  { label: '12 Months',   duration: '365 days' },
  custom: { label: 'Custom Days', duration: 'Your choice' },
};

/* ─────────────────────────────────────────────
   SHOP MOCKUP (animated preview)
───────────────────────────────────────────── */
const TABS = ['Your Shop', 'Order Form', 'Admin Inbox'];

function ShopMockup() {
  const [tab, setTab] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!autoplay) return;
    timerRef.current = setInterval(() => setTab(t => (t + 1) % 3), 3000);
    return () => clearInterval(timerRef.current);
  }, [autoplay]);

  const pick = (i) => {
    setAutoplay(false);
    setTab(i);
  };

  return (
    <div className="relative w-full max-w-md mx-auto select-none">
      {/* Browser chrome */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-violet-100/60 bg-white">
        {/* Top bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
          <div className="flex-1 mx-3 bg-white rounded-md px-3 py-1 text-xs text-gray-400 border border-gray-200 font-mono truncate">
            artspace.app/s/<span className="text-violet-500">your-shop</span>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-white">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => pick(i)}
              className={`flex-1 text-xs py-2.5 font-medium transition-all border-b-2 ${
                tab === i
                  ? 'text-violet-600 border-violet-500 bg-violet-50/40'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="relative overflow-hidden" style={{ height: 340 }}>
          {/* Tab 0 — Shop */}
          <div className={`absolute inset-0 transition-all duration-500 ${tab === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
            <div className="p-4">
              {/* Mini header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-400 flex items-center justify-center text-white text-xs font-bold">GN</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Glamour Nails</p>
                  <p className="text-xs text-gray-400">Mumbai · ★ Nail Art Studio</p>
                </div>
              </div>
              {/* Product grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { color: 'from-pink-200 to-rose-300',     label: 'Floral Set',   p: '₹899' },
                  { color: 'from-violet-200 to-purple-300', label: 'Ombre Tips',   p: '₹749' },
                  { color: 'from-amber-200 to-orange-300',  label: 'Glitter Pack', p: '₹599' },
                  { color: 'from-teal-200 to-cyan-300',     label: 'Pastel Kit',   p: '₹849' },
                  { color: 'from-rose-200 to-pink-300',     label: 'Bridal Set',   p: '₹1299' },
                  { color: 'from-blue-200 to-indigo-300',   label: 'Abstract',     p: '₹699' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl overflow-hidden border border-gray-100">
                    <div className={`h-16 bg-gradient-to-br ${item.color}`} />
                    <div className="p-1.5">
                      <p className="text-xs text-gray-700 font-medium truncate">{item.label}</p>
                      <p className="text-xs text-violet-600 font-semibold">{item.p}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tab 1 — Order Form */}
          <div className={`absolute inset-0 transition-all duration-500 ${tab === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
            <div className="p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-900">Order — Floral Set</p>
              {[
                { label: 'Your name', val: 'Priya Sharma' },
                { label: 'WhatsApp number', val: '+91 98765 43210' },
                { label: 'Preferred date', val: '15 Dec 2025' },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-xs text-gray-400 mb-1">{f.label}</p>
                  <div className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-gray-50">{f.val}</div>
                </div>
              ))}
              <div>
                <p className="text-xs text-gray-400 mb-1">Delivery option</p>
                <div className="flex gap-2">
                  <div className="flex-1 border-2 border-violet-500 rounded-lg px-2 py-2 text-xs text-violet-700 font-medium bg-violet-50 text-center">Home Delivery ₹899</div>
                  <div className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-500 text-center">Pickup ₹799</div>
                </div>
              </div>
              <button className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-xs font-semibold">
                Place Order →
              </button>
            </div>
          </div>

          {/* Tab 2 — Admin Inbox */}
          <div className={`absolute inset-0 transition-all duration-500 ${tab === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
            <div className="flex h-full">
              {/* Sidebar */}
              <div className="w-10 bg-gray-900 flex flex-col items-center py-3 gap-3">
                {['📥', '✅', '📊', '⚙️'].map((ico, i) => (
                  <div key={i} className={`text-base ${i === 0 ? 'opacity-100' : 'opacity-40'}`}>{ico}</div>
                ))}
              </div>
              {/* Inbox */}
              <div className="flex-1 p-3 space-y-2 overflow-hidden">
                <p className="text-xs font-semibold text-gray-600 mb-2">Inbox · 3 new</p>
                {[
                  { name: 'Priya S.',   type: 'Shop Order',    color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
                  { name: 'Meera K.',   type: 'Custom Order',  color: 'bg-pink-100 text-pink-700',     dot: 'bg-pink-500' },
                  { name: 'Anjali R.',  type: 'Appointment',   color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500' },
                ].map(q => (
                  <div key={q.name} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${q.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800">{q.name}</p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${q.color}`}>{q.type}</span>
                  </div>
                ))}
                <div className="mt-2 bg-gradient-to-r from-violet-50 to-pink-50 rounded-lg p-2 border border-violet-100">
                  <p className="text-xs text-violet-700 font-medium">↑ 3 new orders today</p>
                  <p className="text-xs text-gray-400">Tap to confirm & assign tasks</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom progress */}
        <div className="h-1 bg-gray-100 flex">
          {TABS.map((_, i) => (
            <div
              key={i}
              onClick={() => pick(i)}
              className="flex-1 cursor-pointer"
            >
              <div
                className={`h-full transition-all duration-300 ${i === tab ? 'bg-violet-500' : 'bg-transparent'}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -top-3 -right-4 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        Shop is live
      </div>
      <div className="absolute -bottom-3 -left-4 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-lg text-xs font-semibold text-gray-700">
        🎉 New order from Priya
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FEATURE DEEP DIVE
───────────────────────────────────────────── */
function FeatureSection({ flip, icon: Icon, eyebrow, title, desc, bullets, visual }) {
  return (
    <div className={`flex flex-col ${flip ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-10 lg:gap-16`}>
      <div className="flex-1 w-full">
        <div className={`rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white`}>
          {visual}
        </div>
      </div>
      <div className="flex-1">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-4">
          <Icon className="w-3.5 h-3.5" />
          {eyebrow}
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight tracking-tight">{title}</h3>
        <p className="text-gray-500 text-base leading-relaxed mb-5">{desc}</p>
        <ul className="space-y-2.5">
          {bullets.map(b => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-gray-600">
              <Check className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* Task Calendar Visual */
function TaskVisual() {
  const tasks = [
    { name: 'Priya — Bridal Set',  time: '10:00 AM', status: 'processing', color: 'bg-amber-100 text-amber-700', bar: 'bg-amber-400', w: 'w-2/3' },
    { name: 'Meera — Custom Kit',  time: '12:30 PM', status: 'ready',      color: 'bg-green-100 text-green-700', bar: 'bg-green-400', w: 'w-4/5' },
    { name: 'Anjali — Home Visit', time: '3:00 PM',  status: 'pending',    color: 'bg-gray-100 text-gray-600',   bar: 'bg-gray-300',  w: 'w-1/3' },
  ];
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">Today's tasks</p>
        <span className="text-xs text-gray-400">Fri, 13 Dec</span>
      </div>
      <div className="space-y-3">
        {tasks.map(t => (
          <div key={t.name} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-semibold text-gray-800">{t.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.time}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.color}`}>{t.status}</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${t.bar} ${t.w} transition-all`} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[['3', 'Today'], ['₹2,847', 'Revenue'], ['1', 'Pending']].map(([v, l]) => (
          <div key={l} className="bg-violet-50 rounded-xl p-2.5 text-center">
            <p className="text-sm font-bold text-violet-700">{v}</p>
            <p className="text-xs text-violet-400">{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Payment Tracking Visual */
function PaymentVisual() {
  return (
    <div className="p-5">
      <p className="text-sm font-semibold text-gray-800 mb-4">Payment — Bridal Package</p>
      <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Final price</span>
          <span className="font-semibold text-gray-800">₹3,500</span>
        </div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Advance paid</span>
          <span className="font-semibold text-green-600">₹1,500</span>
        </div>
        <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-xs">
          <span className="text-gray-500">Balance due</span>
          <span className="font-semibold text-amber-600">₹2,000</span>
        </div>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-green-400 rounded-full" style={{ width: '43%' }} />
      </div>
      <div className="space-y-2">
        {[
          { date: '1 Dec', amount: '₹1,500', note: 'Advance' },
        ].map(e => (
          <div key={e.date} className="flex items-center gap-3 text-xs bg-green-50 rounded-lg px-3 py-2 border border-green-100">
            <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            <span className="text-gray-500">{e.date}</span>
            <span className="font-semibold text-gray-800 flex-1">{e.amount}</span>
            <span className="text-gray-400">{e.note}</span>
          </div>
        ))}
        <div className="flex items-center justify-between border border-dashed border-violet-300 rounded-lg px-3 py-2 text-xs">
          <span className="text-violet-600 font-medium">+ Add payment entry</span>
          <span className="text-gray-400">₹ amount · date · note</span>
        </div>
      </div>
    </div>
  );
}

/* Analytics Visual */
function AnalyticsVisual() {
  const bars = [
    { label: 'Mon', h: 40,  v: '₹420' },
    { label: 'Tue', h: 65,  v: '₹680' },
    { label: 'Wed', h: 45,  v: '₹470' },
    { label: 'Thu', h: 80,  v: '₹840' },
    { label: 'Fri', h: 100, v: '₹1,050' },
    { label: 'Sat', h: 90,  v: '₹940' },
    { label: 'Sun', h: 55,  v: '₹570' },
  ];
  return (
    <div className="p-5">
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[['₹4,970', 'This week'], ['18', 'Orders'], ['₹276', 'Avg order']].map(([v, l]) => (
          <div key={l} className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-sm font-bold text-gray-900">{v}</p>
            <p className="text-xs text-gray-400">{l}</p>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-1.5 h-24 mb-1">
        {bars.map(b => (
          <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm bg-violet-400 hover:bg-violet-500 transition-colors cursor-pointer"
              style={{ height: `${b.h}%` }}
              title={b.v}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        {bars.map(b => (
          <p key={b.label} className="flex-1 text-center text-xs text-gray-400">{b.label}</p>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 bg-violet-50 rounded-xl p-2.5">
        <TrendingUp className="w-4 h-4 text-violet-500 flex-shrink-0" />
        <p className="text-xs text-violet-700 font-medium">Friday is your best day — 42% more than average</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────────── */
function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${open ? 'border-violet-200 bg-violet-50/40' : 'border-gray-100 bg-white'}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
      >
        <span className={`text-sm font-semibold ${open ? 'text-violet-700' : 'text-gray-800'}`}>{q}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-violet-500' : 'text-gray-400'}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-violet-100">
          <div className="pt-3">{a}</div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRICING SECTION
───────────────────────────────────────────── */
function PricingSection() {
  const [pricing, setPricing]   = useState({});
  const [enabled, setEnabled]   = useState({});
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/subscription/pricing')
      .then(res => {
        setPricing(res.data.pricing || {});
        setEnabled(res.data.enabled || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visiblePlans = PLAN_ORDER.filter(p => {
    if (p === 'trial') return true;
    const key = p === 'custom' ? 'custom_daily' : p;
    return enabled[key] !== false;
  });

  const priceDisplay = (plan) => {
    if (plan === 'trial')  return { main: 'Free',        sub: '7-day trial' };
    if (plan === 'custom') {
      const rate = pricing['custom_daily'];
      return rate ? { main: `₹${rate}`, sub: 'per day' } : { main: '—', sub: 'per day' };
    }
    const p = pricing[plan];
    return p ? { main: `₹${p}`, sub: PLAN_META[plan].duration } : { main: '—', sub: PLAN_META[plan].duration };
  };

  return (
    <section className="py-20 px-6" style={{ background: '#faf9ff' }}>
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-widest text-violet-500 text-center mb-2">Pricing</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-1 tracking-tight">Simple, honest pricing</h2>
        <p className="text-sm text-gray-400 text-center mb-3">Start free. Upgrade when you're ready. No hidden fees, ever.</p>
        <div className="text-center mb-10">
  <p className="text-xs text-gray-400 bg-amber-50 border border-amber-100 rounded-full px-4 py-1.5 inline-flex items-center gap-1.5">
    <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
    Remaining days always carry forward when you renew or upgrade
  </p>
</div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visiblePlans.map(plan => {
              const meta = PLAN_META[plan];
              const { main, sub } = priceDisplay(plan);
              const isHighlight = meta.highlight;
              return (
                <div
                  key={plan}
                  className={`rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                    isHighlight
                      ? 'border-violet-400 bg-white ring-2 ring-violet-200 shadow-sm'
                      : 'border-gray-100 bg-white shadow-sm'
                  }`}
                >
                  {isHighlight && (
                    <span className="inline-block text-xs bg-violet-100 text-violet-700 px-2.5 py-0.5 rounded-full font-semibold mb-3">
                      Start here
                    </span>
                  )}
                  <p className="text-sm font-semibold text-gray-800 mb-1">{meta.label}</p>
                  <p className="text-xs text-gray-400 mb-3">{meta.duration}</p>
                  <p className={`text-2xl font-bold ${isHighlight ? 'text-violet-600' : 'text-gray-900'}`}>{main}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Need a flexible billing period?{' '}
          <span className="text-violet-600 font-medium">Custom Days</span>{' '}
          lets you pay for exactly as many days as you want.
        </p>
        <div className="text-center mt-6">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all shadow-sm hover:-translate-y-0.5"
          >
            Start your free trial
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   STATS BAR
───────────────────────────────────────────── */
function StatsBar() {
  const stats = [
    { value: '80+',      label: 'Business types supported' },
    { value: '7 days',   label: 'Free trial, no card needed' },
    { value: '0%',       label: 'Commission on your sales' },
    { value: '1 minute', label: 'To get your shop live' },
  ];
  return (
    <div className="border-y border-gray-100 bg-gray-50/60 py-6 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className="text-center">
            <p className="text-2xl font-bold text-violet-600 mb-0.5">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function PlatformLandingPage() {
  useEffect(() => {
    document.title = 'ArtSpace — Your Online Shop for Creative Businesses';
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>

      {/* ── Nav ───────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/artspace-logo.png" alt="ArtSpace" className="h-16 object-contain" />
            <span className="font-bold text-gray-900 text-base tracking-tight">ArtSpace</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-800 transition-colors">Features</a>
            <a href="#pricing"  className="hover:text-gray-800 transition-colors">Pricing</a>
            <a href="#faq"      className="hover:text-gray-800 transition-colors">FAQ</a>
          </div>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all shadow-sm shadow-violet-200 hover:-translate-y-0.5"
          >
            Get Your Store
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-16 lg:pt-20 lg:pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left copy */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Built for artists &amp; creators
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-gray-900 leading-[1.1] mb-5 tracking-tight">
              Your craft deserves<br />
              <span className="relative inline-block text-violet-600">
                its own shop.
                <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                  <path d="M0 5 Q25 1 50 4 Q75 7 100 3" stroke="#8b5cf6" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.4" />
                </svg>
              </span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              ArtSpace gives nail artists, mehendi artists, bakers, jewellers, and 80+ other creative businesses
              a complete online shop — orders, appointments, payments, all in one link you share on WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-200 hover:-translate-y-0.5"
              >
                Start for free — 7 days
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-3">No credit card required · Cancel anytime</p>
          </div>
          {/* Right mockup */}
          <div className="flex-1 w-full lg:max-w-[420px]">
            <ShopMockup />
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────── */}
      <StatsBar />

      {/* ── Business types ────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-2">Who it's for</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            If you create it, we handle it
          </h2>
          <p className="text-sm text-gray-400 mb-9">
            From solo artists to growing studios — ArtSpace works for any visual or handcrafted business
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {BUSINESS_TYPES.map(bt => (
              <div
                key={bt.label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all duration-150 cursor-default shadow-sm"
              >
                <bt.icon className="w-4 h-4 text-violet-500 flex-shrink-0" />
                {bt.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────── */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-500 text-center mb-2">Getting started</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2 tracking-tight">Up and running in minutes</h2>
          <p className="text-sm text-gray-400 text-center mb-10">No tech background needed. Really.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map(step => (
              <div key={step.num} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-violet-600" />
                  </div>
                  <span className="text-xs font-bold text-violet-300 tracking-widest">{step.num}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature grid ──────────────────────── */}
      <section id="features" className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-500 text-center mb-2">Features</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2 tracking-tight">Everything in one link</h2>
          <p className="text-sm text-gray-400 text-center mb-10">Your customers never leave your shop to do anything</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
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

      {/* ── Feature deep dives ────────────────── */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto space-y-20">
          <FeatureSection
            flip={false}
            icon={CalendarCheck}
            eyebrow="Task management"
            title="Your orders, organised. Every single day."
            desc="Every confirmed order becomes a task on your calendar. See what's due today, track progress, and never miss a delivery or appointment."
            bullets={[
              'Drag tasks through Pending → Processing → Ready → Completed',
              "See today's schedule at a glance with time slots",
              'Tasks auto-delete after 7 days — your inbox stays clean',
              'Add private notes per task that customers never see',
            ]}
            visual={<TaskVisual />}
          />
          <FeatureSection
            flip={true}
            icon={CreditCard}
            eyebrow="Payment tracking"
            title="Track advances, balances, and full payments."
            desc="Set the final price, log advance payments, and track how much is still due — all on the task card. No spreadsheet needed."
            bullets={[
              'Accept advance payments and track the balance automatically',
              'Add multiple payment entries per order with dates and notes',
              'Payment status updates live — None, Partial, or Full',
              'See total revenue at a glance without doing the math',
            ]}
            visual={<PaymentVisual />}
          />
          <FeatureSection
            flip={false}
            icon={BarChart2}
            eyebrow="Analytics"
            title="Know exactly what's working in your shop."
            desc="Revenue by day, top products, order trends — all in your dashboard. Make decisions about what to promote based on what actually sells."
            bullets={[
              'Daily and weekly revenue charts updated in real time',
              'See which products drive the most orders',
              'Filter by date range to compare weeks or months',
              'Identify your busiest days and peak booking times',
            ]}
            visual={<AnalyticsVisual />}
          />
        </div>
      </section>

      {/* ── Pricing ───────────────────────────── */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* ── FAQ ───────────────────────────────── */}
      <section id="faq" className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-500 text-center mb-2">FAQ</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2 tracking-tight">Questions we get a lot</h2>
          <p className="text-sm text-gray-400 text-center mb-10">If your question isn't here, email us.</p>
          <div className="space-y-2">
            {FAQS.map(f => <FAQ key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────── */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)' }}>
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-6">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
            Your shop is one minute away.
          </h2>
          <p className="text-violet-200 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
            Start your free 7-day trial today. No card needed. No tech skills needed.
            Just your craft and a link to share.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-violet-700 font-bold text-sm hover:bg-violet-50 transition-all hover:-translate-y-0.5 shadow-xl"
          >
            Create Your Free Shop
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-violet-300 mt-4">7-day free trial · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/artspace-logo.png" alt="ArtSpace" className="h-16 object-contain" />
            <span className="text-sm font-bold text-gray-700 tracking-tight">ArtSpace</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <a href="#features" className="hover:text-gray-600 transition-colors">Features</a>
            <a href="#pricing"  className="hover:text-gray-600 transition-colors">Pricing</a>
            <a href="#faq"      className="hover:text-gray-600 transition-colors">FAQ</a>
          </div>
          <p className="text-xs text-gray-400">ArtSpace © {new Date().getFullYear()}</p>
          <a
            href="mailto:er.cs.krushnasoni@gmail.com"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Built by Krushna Soni
          </a>
        </div>
      </footer>
    </div>
  );
}