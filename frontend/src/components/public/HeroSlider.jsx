// frontend/src/components/public/HeroSlider.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroSlider = ({ slides, onSlideClick }) => {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, slides.length, goTo]);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 4500);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [slides.length, startTimer]);

  if (!slides || slides.length === 0) return null;

  const handleMouseEnter = () => clearInterval(timerRef.current);
  const handleMouseLeave = () => startTimer();

  const handleClick = (slide) => {
    if (slide.linkType !== 'none' && slide.linkId && onSlideClick) {
      onSlideClick(slide);
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-100 dark:bg-zinc-900 select-none rounded-none"
      style={{ aspectRatio: '16/9', maxHeight: '520px' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Crossfade slides */}
      {slides.map((slide, i) => (
        <div
          key={slide._id || i}
          className="absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 1 : 0,
            cursor: slide.linkType !== 'none' ? 'pointer' : 'default',
            pointerEvents: i === current ? 'auto' : 'none',
          }}
          onClick={() => handleClick(slide)}
        >
          <img
            src={slide.imageUrl}
            alt={slide.title || `Slide ${i + 1}`}
            className="w-full h-full object-fill"
            draggable={false}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
          {/* Title overlay */}
          {slide.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-6 py-6 sm:py-8">
              <p
                className="text-white font-bold text-base sm:text-2xl md:text-3xl drop-shadow-sm"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.01em' }}
              >
                {slide.title}
              </p>
            </div>
          )}
        </div>
      ))}

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); startTimer(); }}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} className="text-white drop-shadow" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); startTimer(); }}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
            aria-label="Next slide"
          >
            <ChevronRight size={18} className="text-white drop-shadow" />
          </button>

          {/* Line-style indicators */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goTo(i); startTimer(); }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? '24px' : '6px',
                  height: '6px',
                  background: i === current
                    ? 'var(--tenant-primary)'
                    : 'rgba(255,255,255,0.55)',
                  boxShadow: i === current ? '0 0 0 2px rgba(255,255,255,0.3)' : 'none',
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSlider;