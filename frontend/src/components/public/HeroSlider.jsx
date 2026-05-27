import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroSlider = ({ slides, onSlideClick }) => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 4000);
  }, [next]);

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
      className="relative w-full overflow-hidden bg-gray-100 select-none"
      style={{ aspectRatio: '16/9' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide._id || i}
            className="relative flex-shrink-0 w-full h-full"
            style={{ cursor: slide.linkType !== 'none' ? 'pointer' : 'default' }}
            onClick={() => handleClick(slide)}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title || `Slide ${i + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
            />
            {/* Title overlay */}
            {slide.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-6 py-4">
                <p
                  className="text-white font-semibold text-lg sm:text-2xl"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {slide.title}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Arrows — only if more than 1 slide */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); startTimer(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-all duration-150 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} className="text-gray-700" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); startTimer(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-all duration-150 z-10"
            aria-label="Next slide"
          >
            <ChevronRight size={18} className="text-gray-700" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); startTimer(); }}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === current ? '20px' : '6px',
                  height: '6px',
                  background: i === current ? 'var(--tenant-primary)' : 'rgba(255,255,255,0.7)',
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