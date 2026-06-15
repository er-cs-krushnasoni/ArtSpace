import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, ShoppingBag, ChevronRight, Sparkles } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { getLabels } from '../../config/businessTypeLabels';
import ShopHeader from '../../components/public/ShopHeader';
import usePublicTheme from '../../hooks/usePublicTheme';
import ProductCard from '../../components/public/ProductCard';
import ProductDetailModal from '../../components/public/ProductDetailModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Matching algorithm ────────────────────────────────────────────────────────
function matchProducts(questions, answers, products) {
  const selectedTexts = answers.map((ai, qi) =>
    ai === null ? '' : (questions[qi]?.options[ai]?.text?.toLowerCase().trim() || '')
  ).filter(Boolean);

  const talliedIds    = {};
  const talliedValues = {};

  answers.forEach((answerIdx, qIdx) => {
    if (answerIdx === null) return; // skipped — contributes no points
    const opt = questions[qIdx]?.options[answerIdx];
    (opt?.categoryIds || []).forEach((cid) => {
      const key = String(cid);
      talliedIds[key] = (talliedIds[key] || 0) + 1;
    });
    (opt?.categoryLinks || []).forEach((cl) => {
  const cidKey = String(cl.categoryId);
  if (!cl.values?.length) {
    // No specific values linked — score the whole group as a fallback
    talliedIds[cidKey] = (talliedIds[cidKey] || 0) + 1;
  }
  (cl.values || []).forEach((v) => {
    const vKey = `${cidKey}::${v.toLowerCase()}`;
    talliedValues[vKey] = (talliedValues[vKey] || 0) + 1;
  });
});
  });

  const scored = products.map((p) => {
    let score = 0;
    (p.categories || []).forEach((catEntry) => {
  const catObj   = catEntry.categoryId ?? catEntry;
  const catIdKey = String(typeof catObj === 'object' ? catObj._id : catObj);
  const checkVals = catEntry.selectedValues?.length > 0
    ? catEntry.selectedValues
    : (catObj.values || []);
  checkVals.forEach((val) => {
    const valLower = val.toLowerCase();
    const vKey = `${catIdKey}::${valLower}`;
    if (talliedValues[vKey]) score += talliedValues[vKey] * 3;
    selectedTexts.forEach((text) => {
      if (valLower === text) score += 3;
      else if (valLower.includes(text) || text.includes(valLower)) score += 1.5;
      else {
        const textWords = text.split(/\s+/);
        const valWords  = valLower.split(/\s+/);
        textWords.forEach((tw) => {
          if (tw.length > 3 && valWords.some((vw) => vw.includes(tw) || tw.includes(vw)))
            score += 0.75;
        });
      }
    });
  });

  const catScore = talliedIds[catIdKey] || 0;
  score += catScore * 2;
});
    const nameLower = (p.name || '').toLowerCase();
    selectedTexts.forEach((text) => {
      if (nameLower.includes(text)) score += 1;
      else text.split(/\s+/).forEach((word) => {
        if (word.length > 3 && nameLower.includes(word)) score += 0.5;
      });
    });
    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const withScore    = scored.filter((s) => s.score > 0).map((s) => s.product);
  const withoutScore = scored.filter((s) => s.score === 0).map((s) => s.product);
  const results = [...withScore];
  for (const p of withoutScore) {
    if (results.length >= 6) break;
    results.push(p);
  }
  return results.slice(0, 6);
}

// ── Progress bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ current, total }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-2.5">
      <span
        className="text-xs font-semibold"
        style={{ color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 50%, transparent)' }}
      >
        Question {current} of {total}
      </span>
      <span
        className="text-xs font-bold tabular-nums"
        style={{ color: 'var(--tenant-primary)' }}
      >
        {Math.round((current / total) * 100)}%
      </span>
    </div>
    <div
      className="h-2 rounded-full overflow-hidden"
      style={{ background: 'color-mix(in srgb, var(--tenant-text, #1c1917) 8%, transparent)' }}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${(current / total) * 100}%`,
          background: 'var(--tenant-primary)',
        }}
      />
    </div>
  </div>
);

export default function QuizPage() {
  const { tenant } = useTenant();
  const themeClass = usePublicTheme();
  const navigate   = useNavigate();
  const slug       = tenant?.slug;
  const config     = tenant?.websiteConfig || {};
  const labels     = getLabels(tenant?.businessType || 'generic');

  const [questions,      setQuestions]      = useState([]);
  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [step,           setStep]           = useState(0);
  const [answers,        setAnswers]        = useState([]);
  const [matched,        setMatched]        = useState([]);
  const [activeProduct,  setActiveProduct]  = useState(null);

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
      } catch { /* silent */ }
      finally { setLoading(false); }
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
      const results = matchProducts(questions, newAnswers, products);
      setMatched(results);
      setStep(questions.length);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    const newAnswers = [...answers];
    newAnswers[step] = null; // null = skipped, contributes no points
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      const results = matchProducts(questions, newAnswers, products);
      setMatched(results);
      setStep(questions.length);
    }
  };

  const retake = () => {
    setStep(0);
    setAnswers([]);
    setMatched([]);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`min-h-screen ${themeClass}`} style={{ background: 'var(--tenant-bg)' }}>
        <ShopHeader />
        <div className="flex items-center justify-center py-24">
          <div className="space-y-3 w-full max-w-md px-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-2xl animate-pulse"
                style={{ background: 'color-mix(in srgb, var(--tenant-text, #1c1917) 7%, transparent)' }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz not ready ────────────────────────────────────────────────────────
  if (questions.length < 3) {
    return (
      <div className={`min-h-screen ${themeClass}`} style={{ background: 'var(--tenant-bg)' }}>
        <ShopHeader />
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'color-mix(in srgb, var(--tenant-primary) 10%, transparent)' }}
          >
            <ShoppingBag size={28} style={{ color: 'var(--tenant-primary)' }} />
          </div>
          <p className="text-base font-bold mb-1" style={{ color: 'var(--tenant-text, #1c1917)' }}>
            Quiz coming soon!
          </p>
          <p
            className="text-sm mb-7"
            style={{ color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 50%, transparent)' }}
          >
            {tenant?.businessName} is setting up the quiz. Check back soon.
          </p>
          <button
            onClick={() => navigate(`/s/${slug}/shop`)}
            className="px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--tenant-primary)' }}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const isResultsScreen = step >= questions.length;
  const currentQ        = questions[step];

  return (
    <div className={`min-h-screen ${themeClass}`} style={{ background: 'var(--tenant-bg)' }}>
      <ShopHeader />

      <div className="max-w-xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 py-10">

        {/* Quiz label */}
        <div className="flex items-center justify-center gap-2 mb-7">
          <Sparkles size={14} style={{ color: 'var(--tenant-primary)' }} />
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--tenant-primary)' }}
          >
            {labels.quiz_name || 'Style Quiz'}
          </p>
          <Sparkles size={14} style={{ color: 'var(--tenant-primary)' }} />
        </div>

        {/* ── Question screen ───────────────────────────────────────────── */}
        {!isResultsScreen ? (
  <div className="max-w-xl mx-auto">
    <ProgressBar current={step + 1} total={questions.length} />

            {/* Question text */}
            <h2
              className="text-xl sm:text-2xl font-bold text-center mb-8 leading-snug"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--tenant-text, #1c1917)',
              }}
            >
              {currentQ.questionText}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt, oi) => {
                const isSelected = answers[step] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => handleAnswer(oi)}
                    className="w-full py-4 px-5 rounded-2xl border-2 text-sm font-medium text-left flex items-center justify-between group transition-all duration-150"
                    style={{
                      borderColor: isSelected
                        ? 'var(--tenant-primary)'
                        : 'color-mix(in srgb, var(--tenant-text, #1c1917) 12%, transparent)',
                      color: isSelected
                        ? 'var(--tenant-primary)'
                        : 'color-mix(in srgb, var(--tenant-text, #1c1917) 75%, transparent)',
                      background: isSelected
                        ? 'color-mix(in srgb, var(--tenant-primary) 8%, transparent)'
                        : 'var(--tenant-card-bg, #ffffff)',
                      transform: isSelected ? 'translateX(4px)' : 'translateX(0)',
                    }}
                  >
                    <span>{opt.text}</span>
                    <ChevronRight
                      size={16}
                      className="flex-shrink-0 transition-all duration-150"
                      style={{
                        color: 'var(--tenant-primary)',
                        opacity: isSelected ? 1 : 0,
                        transform: isSelected ? 'translateX(0)' : 'translateX(-4px)',
                      }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Back + Skip buttons */}
            <div className="flex items-center justify-between mt-7">
              {step > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 45%, transparent)' }}
                >
                  <ArrowLeft size={14} /> Previous
                </button>
              ) : (
                <span />
              )}
              <button
                onClick={handleSkip}
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 35%, transparent)' }}
              >
                Skip →
              </button>
            </div>
    </div>
    ) : (
          /* ── Results screen ───────────────────────────────────────────── */
          <>
            {/* Results heading */}
            <div
              className="text-center mb-9"
              style={{ animation: 'resultsFadeIn 0.35s ease both' }}
            >
              <h2
                className="text-2xl sm:text-3xl font-bold mb-2"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: 'var(--tenant-text, #1c1917)',
                }}
              >
                Your picks ✨
              </h2>
              <p
                className="text-sm"
                style={{ color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 50%, transparent)' }}
              >
                Based on your answers, you might love these
              </p>
            </div>

            {/* Matched products */}
            {matched.length > 0 ? (
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-9">
                  {matched.map((product, i) => (
                  <div
                    key={product._id}
                    style={{
                      animation: 'resultsFadeIn 0.3s ease both',
                      animationDelay: `${i * 60}ms`,
                    }}
                  >
                    <ProductCard
                      product={product}
                      onClick={() => setActiveProduct(product)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-12 text-center mb-9">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: 'color-mix(in srgb, var(--tenant-primary) 10%, transparent)' }}
                >
                  <ShoppingBag size={24} style={{ color: 'var(--tenant-primary)' }} />
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 55%, transparent)' }}
                >
                  No specific matches — browse everything!
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={retake}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold border-2 transition-colors"
                style={{
                  borderColor: 'color-mix(in srgb, var(--tenant-text, #1c1917) 15%, transparent)',
                  color: 'color-mix(in srgb, var(--tenant-text, #1c1917) 65%, transparent)',
                  background: 'transparent',
                }}
              >
                <RotateCcw size={14} /> Retake Quiz
              </button>
              <button
                onClick={() => navigate(`/s/${slug}/shop`)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--tenant-primary)' }}
              >
                Browse All Products
              </button>
            </div>
          </>
        )}
      </div>

      {/* Product detail modal triggered from quiz results */}
      {activeProduct && (
  <ProductDetailModal
    product={activeProduct}
    onClose={() => setActiveProduct(null)}
  />
)}

      <style>{`
        @keyframes resultsFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}