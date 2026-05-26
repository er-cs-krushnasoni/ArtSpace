import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, ShoppingBag, ChevronRight } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { getLabels } from '../../config/businessTypeLabels';
import ShopHeader from '../../components/public/ShopHeader';
import ProductCard from '../../components/public/ProductCard';
import OrderFormModal from '../../components/public/OrderFormModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Matching algorithm ────────────────────────────────────────────────────────
function matchProducts(questions, answers, products) {
  // Collect all selected option texts (lowercased)
  const selectedTexts = answers.map((ai, qi) =>
    questions[qi]?.options[ai]?.text?.toLowerCase().trim() || ''
  ).filter(Boolean);

  // Also collect categoryIds if admin mapped them
  const talliedIds = {};
  answers.forEach((answerIdx, qIdx) => {
    const opt = questions[qIdx]?.options[answerIdx];
    (opt?.categoryIds || []).forEach((cid) => {
      const key = String(cid);
      talliedIds[key] = (talliedIds[key] || 0) + 1;
    });
  });

  const scored = products.map((p) => {
    let score = 0;

    // 1. Category value text matching (fuzzy) — works without admin config
    (p.categories || []).forEach((cat) => {
      (cat.values || []).forEach((val) => {
        const valLower = val.toLowerCase();
        selectedTexts.forEach((text) => {
          // exact word match scores higher than partial
          if (valLower === text) score += 3;
          else if (valLower.includes(text) || text.includes(valLower)) score += 1.5;
          // word-level partial match
          else {
            const textWords = text.split(/\s+/);
            const valWords = valLower.split(/\s+/);
            textWords.forEach((tw) => {
              if (tw.length > 3 && valWords.some((vw) => vw.includes(tw) || tw.includes(vw))) {
                score += 0.75;
              }
            });
          }
        });
      });
    });

    // 2. Product name matching
    const nameLower = (p.name || '').toLowerCase();
    selectedTexts.forEach((text) => {
      if (nameLower.includes(text)) score += 1;
      else {
        text.split(/\s+/).forEach((word) => {
          if (word.length > 3 && nameLower.includes(word)) score += 0.5;
        });
      }
    });

    // 3. Category ID matching (if admin configured — bonus points)
    (p.categories || []).forEach((cat) => {
      const catIdScore = talliedIds[String(cat._id)] || 0;
      score += catIdScore * 2;
    });

    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const withScore = scored.filter((s) => s.score > 0).map((s) => s.product);
  const withoutScore = scored.filter((s) => s.score === 0).map((s) => s.product);

  // Pad up to 6 with unmatched products if needed
  const results = [...withScore];
  for (const p of withoutScore) {
    if (results.length >= 6) break;
    results.push(p);
  }

  return results.slice(0, 6);
}

// ── Progress bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ current, total, primaryColor }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-gray-500 font-medium">Question {current} of {total}</span>
      <span className="text-xs text-gray-400">{Math.round((current / total) * 100)}%</span>
    </div>
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${(current / total) * 100}%`, background: primaryColor || 'var(--color-primary)' }}
      />
    </div>
  </div>
);

export default function QuizPage() {
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const slug = tenant?.slug;
  const config = tenant?.websiteConfig || {};
  const labels = getLabels(tenant?.businessType || 'generic');
  const primaryColor = config.primaryColor || '#8b5cf6';

  const [questions, setQuestions] = useState([]);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [step, setStep]           = useState(0); // 0..n-1 = questions, n = results
  const [answers, setAnswers]     = useState([]); // answers[i] = option index chosen
  const [matched, setMatched]     = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);

  useEffect(() => {
    if (!config.quizEnabled) {
      navigate(`/s/${slug}`, { replace: true });
      return;
    }
    const load = async () => {
      try {
        const [qRes, pRes] = await Promise.all([
          fetch(`${API_BASE}/public/${slug}/quiz`),
          fetch(`${API_BASE}/public/${slug}/products`),
        ]);
        const qData = await qRes.json();
        const pData = await pRes.json();
        if (qData.success) setQuestions(qData.data || []);
        if (pData.success) setProducts(pData.data || []);
      } catch {
        // silent fail — show empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, config.quizEnabled]);

  const handleAnswer = (optionIdx) => {
    const newAnswers = [...answers];
    newAnswers[step] = optionIdx;
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Last question answered → compute results
      const results = matchProducts(questions, newAnswers, products);
      setMatched(results);
      setStep(questions.length); // results screen
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const retake = () => {
    setStep(0);
    setAnswers([]);
    setMatched([]);
  };

  if (loading) {
    return (
<div className="min-h-screen" style={{ background: 'var(--tenant-bg)' }}>
        <ShopHeader />
        <div className="flex items-center justify-center py-24">
          <div className="space-y-3 w-full max-w-md px-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (questions.length < 3) {
    return (
      <div className="min-h-screen bg-white">
        <ShopHeader />
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-base font-medium text-gray-600">Quiz coming soon!</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            {tenant?.businessName} is setting up the quiz. Check back soon.
          </p>
          <button
            onClick={() => navigate(`/s/${slug}/shop`)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: primaryColor }}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const isResultsScreen = step >= questions.length;
  const currentQ = questions[step];

  return (
    <div className="min-h-screen bg-white">
      <ShopHeader />

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Quiz name */}
        <p
          className="text-center text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ color: primaryColor }}
        >
          {labels.quiz_name || 'Style Quiz'}
        </p>

        {!isResultsScreen ? (
          <>
            <ProgressBar current={step + 1} total={questions.length} primaryColor={primaryColor} />

            {/* Question */}
            <h2
              className="text-xl font-semibold text-gray-900 text-center mb-8 leading-snug"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {currentQ.questionText}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => handleAnswer(oi)}
                  className="w-full py-4 px-5 rounded-xl border-2 text-sm font-medium text-left flex items-center justify-between group transition-all duration-150"
                  style={{
                    borderColor: answers[step] === oi ? primaryColor : '#e5e7eb',
                    color: answers[step] === oi ? primaryColor : '#374151',
                    background: answers[step] === oi
                      ? `color-mix(in srgb, ${primaryColor} 8%, transparent)`
                      : 'white',
                  }}
                >
                  {opt.text}
                  <ChevronRight
                    size={16}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: primaryColor }}
                  />
                </button>
              ))}
            </div>

            {/* Back */}
            {step > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mt-6 mx-auto transition-colors"
              >
                <ArrowLeft size={14} /> Previous question
              </button>
            )}
          </>
        ) : (
          /* Results screen */
          <>
            <div className="text-center mb-8">
              <h2
                className="text-2xl font-semibold text-gray-900 mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Your picks ✨
              </h2>
              <p className="text-sm text-gray-500">
                Based on your answers, you might love these
              </p>
            </div>

            {matched.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {matched.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={() => setActiveProduct(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 text-center mb-8">
                <ShoppingBag className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-sm text-gray-500">No specific matches — browse everything!</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={retake}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <RotateCcw size={14} /> Retake Quiz
              </button>
              <button
                onClick={() => navigate(`/s/${slug}/shop`)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: primaryColor }}
              >
                Browse All Products
              </button>
            </div>
          </>
        )}
      </div>

      {activeProduct && (
        <OrderFormModal
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
        />
      )}
    </div>
  );
}