import { useState, useEffect } from 'react';
import { CreditCard, RefreshCw, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PLAN_LABELS = {
  trial: 'Free Trial',
  '1m': '1 Month',
  '3m': '3 Months',
  '6m': '6 Months',
  '12m': '12 Months',
  custom: 'Custom Days',
};

const PLAN_OPTIONS = [
  { key: '1m', label: '1 Month', duration: '30 days' },
  { key: '3m', label: '3 Months', duration: '90 days' },
  { key: '6m', label: '6 Months', duration: '180 days' },
  { key: '12m', label: '12 Months', duration: '365 days' },
  { key: 'custom', label: 'Custom Days', duration: 'You choose' },
];

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function SubscriptionPage({ onPaymentSuccess }) {  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [pricing, setPricing] = useState({});
  const [planEnabled, setPlanEnabled] = useState({});
  const [selectedPlan, setSelectedPlan] = useState('1m');
  const [customDays, setCustomDays] = useState('');
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchStatus();
    fetchPricing();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/subscription/status');
      setStatus(res.data);
    } catch {
      toast.error('Failed to load subscription info.');
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const fetchPricing = async () => {
    try {
      const res = await api.get('/subscription/pricing');
      setPricing(res.data.pricing || {});
      setPlanEnabled(res.data.enabled || {});
    } catch {
      // silent
    } finally {
      setIsLoadingPricing(false);
    }
  };

  // Custom days price preview
  const customTotal = selectedPlan === 'custom' && customDays && pricing['custom_daily']
    ? parseInt(customDays, 10) * pricing['custom_daily']
    : null;

  const handleRenew = async () => {
    if (selectedPlan === 'custom') {
      const days = parseInt(customDays, 10);
      if (!days || days < 1) {
        toast.error('Please enter a valid number of days (minimum 1).');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please check your connection.');
        setIsProcessing(false);
        return;
      }

      const orderPayload = { plan: selectedPlan };
      if (selectedPlan === 'custom') {
        orderPayload.customDays = parseInt(customDays, 10);
      }

      const orderRes = await api.post('/subscription/create-order', orderPayload);
      const { razorpayOrderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: 'ArtSpace',
        description: selectedPlan === 'custom'
          ? `${customDays} Day Custom Plan`
          : `${PLAN_LABELS[selectedPlan]} Subscription`,
        // Replace the handler inside the Razorpay options object:
handler: async (response) => {
  try {
    await api.post('/subscription/verify-payment', {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      plan: selectedPlan,
    });
    toast.success('Payment successful! Subscription activated.');
    fetchStatus();
    // If called from ExpiredPage, reload to re-enter dashboard
    if (onPaymentSuccess) onPaymentSuccess();
  } catch {
    toast.error('Payment verification failed. Contact support with your payment ID.');
  } finally {
    setIsProcessing(false);
  }
},
        modal: { ondismiss: () => setIsProcessing(false) },
        prefill: { email: user?.email || '' },
        theme: { color: '#8b5cf6' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to initiate payment.');
      setIsProcessing(false);
    }
  };

  const progressPercent = status
    ? Math.max(0, Math.min(100, Math.round(
        ((status.totalDays - status.daysRemaining) / status.totalDays) * 100
      )))
    : 0;

  const isExpired = status?.status === 'expired';
  const isTrial = status?.plan === 'trial';

  const StatusBadge = () => isExpired ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
      <AlertCircle className="w-3 h-3" /> Expired
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <CheckCircle className="w-3 h-3" /> Active
    </span>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Subscription & Billing</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your plan and renew your subscription</p>
      </div>

      {/* Current Plan */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-violet-500" />
          <h2 className="text-base font-semibold text-gray-900">Current Plan</h2>
        </div>

        {isLoadingStatus ? (
          <div className="space-y-3">
            <div className="h-5 bg-gray-100 rounded animate-pulse w-32" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-48" />
            <div className="h-2 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : status ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl font-semibold text-gray-900">
                {PLAN_LABELS[status.plan] || status.plan}
              </span>
              <StatusBadge />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Days Remaining</p>
                <p className="text-2xl font-semibold text-gray-900">{status.daysRemaining}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Expires On</p>
                <p className="text-sm font-semibold text-gray-900">
                  {status.planExpiryDate
                    ? new Date(status.planExpiryDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{isTrial ? 'Trial period' : 'Subscription period'}</span>
                <span>{progressPercent}% used</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-violet-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            {isTrial && (
              <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                You're on a free trial. Upgrade to keep your shop live after the trial ends.
              </p>
            )}
            {isExpired && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                Your subscription has expired. Your shop is currently offline. Renew to bring it back live.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400">Unable to load subscription info.</p>
        )}
      </div>

      {/* Renew / Upgrade */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5 text-violet-500" />
          <h2 className="text-base font-semibold text-gray-900">
            {isExpired ? 'Renew Subscription' : 'Upgrade or Extend'}
          </h2>
        </div>

        {isLoadingPricing ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {PLAN_OPTIONS.filter(plan => {
              const key = plan.key === 'custom' ? 'custom_daily' : plan.key;
              return planEnabled[key] !== false;
            }).map((plan) => (
              <button
                key={plan.key}
                onClick={() => {
                  setSelectedPlan(plan.key);
                  setCustomDays('');
                }}
                className={`rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                  selectedPlan === plan.key
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">{plan.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{plan.duration}</p>
                {plan.key === 'custom' ? (
                  <p className="text-base font-bold text-violet-600 mt-1">
                    ₹{pricing['custom_daily'] ?? '—'}/day
                  </p>
                ) : (
                  <p className="text-base font-bold text-violet-600 mt-1">
                    ₹{pricing[plan.key] ?? '—'}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Custom Days input */}
        {selectedPlan === 'custom' && (
          <div className="mb-4 p-4 bg-violet-50 rounded-xl border border-violet-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-violet-500" />
              <p className="text-sm font-medium text-gray-700">Enter number of days</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 45"
                className="w-32 px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-400">days</span>
              {customTotal !== null && (
                <span className="ml-auto text-base font-bold text-violet-600">
                  Total: ₹{customTotal}
                </span>
              )}
            </div>
            {customDays && parseInt(customDays, 10) > 0 && pricing['custom_daily'] && (
              <p className="mt-2 text-xs text-gray-400">
                {customDays} days × ₹{pricing['custom_daily']}/day = ₹{customTotal}
              </p>
            )}
          </div>
        )}

        {/* Carry-forward notice */}
        {status?.daysRemaining > 0 && (
          <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-4">
            Your remaining {status.daysRemaining} day(s) will be carried forward — added on top of your new plan.
          </p>
        )}

        <button
          onClick={handleRenew}
          disabled={
            isProcessing ||
            isLoadingPricing ||
            (selectedPlan === 'custom' && (!customDays || parseInt(customDays, 10) < 1))
          }
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-2.5 transition-all duration-200"
        >
          {isProcessing ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Processing...</>
          ) : (
            <><CreditCard className="w-4 h-4" /> Pay with Razorpay</>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          Secure payment powered by Razorpay. Your subscription activates instantly after payment.
        </p>
      </div>
    </div>
  );
}