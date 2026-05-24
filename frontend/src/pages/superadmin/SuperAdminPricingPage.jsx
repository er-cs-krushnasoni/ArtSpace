import { useEffect, useState } from 'react';
import { Loader2, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import api from '../../api/axiosInstance';

const PLANS = [
  { key: '1m', label: '1 Month', sub: '30 days' },
  { key: '3m', label: '3 Months', sub: '90 days' },
  { key: '6m', label: '6 Months', sub: '180 days' },
  { key: '12m', label: '12 Months', sub: '365 days' },
  { key: 'custom_daily', label: 'Custom Days (Daily Rate)', sub: 'Price per day — used to calculate custom plan total' },
];

export default function SuperAdminPricingPage() {
  const [prices, setPrices] = useState({});
  const [edited, setEdited] = useState({});
  const [enabled, setEnabled] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    api.get('/superadmin/pricing').then(res => {
      // res.data.pricing is now an array from the updated controller
      const priceMap = {};
      const enabledMap = {};
      (res.data.pricing || []).forEach(p => {
        priceMap[p.plan] = p.price;
        enabledMap[p.plan] = p.isEnabled !== false;
      });
      // Fill in defaults for any missing plans
      PLANS.forEach(p => {
        if (priceMap[p.key] === undefined) priceMap[p.key] = 0;
        if (enabledMap[p.key] === undefined) enabledMap[p.key] = true;
      });
      setPrices(priceMap);
      setEdited(priceMap);
      setEnabled(enabledMap);
    }).catch(() => toast.error('Failed to load pricing')).finally(() => setLoading(false));
  }, []);

  const savePrice = async (planKey) => {
    const val = Number(edited[planKey]);
    if (isNaN(val) || val < 0) return toast.error('Enter a valid price');
    setSaving(planKey);
    try {
      await api.patch('/superadmin/pricing', { plan: planKey, price: val });
      setPrices(p => ({ ...p, [planKey]: val }));
      toast.success('Price updated');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(null); }
  };

  const togglePlan = async (planKey, newVal) => {
    setToggling(planKey);
    try {
      await api.patch('/superadmin/pricing/toggle', { plan: planKey, isEnabled: newVal });
      setEnabled(e => ({ ...e, [planKey]: newVal }));
      toast.success(`Plan ${newVal ? 'enabled' : 'disabled'}`);
    } catch { toast.error('Failed to toggle plan'); }
    finally { setToggling(null); }
  };

  return (
    <SuperAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Plans & Pricing</h1>
          <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
            Price changes apply to new purchases only. Disabled plans are hidden from tenants.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-violet-500" size={22} />
        </div>
      ) : (
        <div className="space-y-3">
          {PLANS.map(plan => {
            const isOn = enabled[plan.key] !== false;
            const isDirty = Number(edited[plan.key]) !== prices[plan.key];
            return (
              <div key={plan.key}
                className={`bg-white border rounded-xl shadow-sm p-5 flex items-center justify-between gap-4 transition-opacity ${!isOn ? 'opacity-60' : ''}`}
                style={{ borderColor: isOn ? '#f3f4f6' : '#fecaca' }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{plan.label}</p>
                    {!isOn && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{plan.sub}</p>
                  {isDirty && (
                    <p className="text-xs text-amber-600 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Unsaved (was ₹{prices[plan.key]})
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Price input */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={edited[plan.key] ?? ''}
                      onChange={e => setEdited(p => ({ ...p, [plan.key]: e.target.value }))}
                      className="w-32 pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      placeholder="0"
                    />
                  </div>

                  {/* Save price button */}
                  <button
                    onClick={() => savePrice(plan.key)}
                    disabled={saving === plan.key || !isDirty}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg font-medium text-white disabled:opacity-40 transition-colors"
                    style={{ backgroundColor: '#8b5cf6', fontFamily: "'Inter', sans-serif" }}
                    onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#7c3aed'; }}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#8b5cf6'}
                  >
                    {saving === plan.key ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    Save
                  </button>

                  {/* Enable/disable toggle */}
                  <button
                    onClick={() => togglePlan(plan.key, !isOn)}
                    disabled={toggling === plan.key}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors disabled:opacity-40"
                    style={{
                      borderColor: isOn ? '#d1fae5' : '#fee2e2',
                      backgroundColor: isOn ? '#f0fdf4' : '#fff1f2',
                      color: isOn ? '#065f46' : '#991b1b',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {toggling === plan.key
                      ? <Loader2 size={14} className="animate-spin" />
                      : isOn
                        ? <ToggleRight size={16} />
                        : <ToggleLeft size={16} />
                    }
                    {isOn ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 p-4 bg-violet-50 border border-violet-100 rounded-xl">
        <p className="text-xs text-violet-700" style={{ fontFamily: "'Inter', sans-serif" }}>
          <strong>Disabled plans</strong> are hidden on the tenant subscription page and the public signup form. No new purchases can be made for disabled plans. Existing subscriptions are not affected.
          <br /><br />
          <strong>Custom Days rate:</strong> Total price = days entered × daily rate. Verified server-side.
        </p>
      </div>
    </SuperAdminLayout>
  );
}