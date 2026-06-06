import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const COMMON_CODES = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+1', flag: '🇺🇸', name: 'USA / Canada' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
];

const ALL_CODES = [
  ...COMMON_CODES,
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+63', flag: '🇵🇭', name: 'Philippines' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
];

const DEDUPLICATED = Array.from(
  new Map(ALL_CODES.map((c) => [c.code, c])).values()
);

const CountryCodeDropdown = ({ value = '+91', onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);

  const updatePosition = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 4, left: rect.left });
  };

  useEffect(() => {
    if (open) updatePosition();
  }, [open]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
        setSearch('');
      }
    };
    const handleScroll = () => { if (open) updatePosition(); };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  const filtered = search.trim()
    ? DEDUPLICATED.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.includes(search)
      )
    : DEDUPLICATED;

  const selected = DEDUPLICATED.find((c) => c.code === value) || COMMON_CODES[0];

  const handleSelect = (code) => {
    onChange(code);
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 h-full text-sm text-gray-700 dark:text-zinc-200 border-r border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-700/60 rounded-l-xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap flex-shrink-0"
        style={{ minWidth: '82px' }}
      >
        <span>{selected.flag}</span>
        <span className="font-medium">{selected.code}</span>
        <ChevronDown
          size={12}
          className="text-gray-400 dark:text-zinc-400 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="fixed z-[200] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-2xl w-64 overflow-hidden"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            animation: 'dropdownIn 0.18s cubic-bezier(0.34,1.2,0.64,1) both',
          }}
        >
          {/* Search */}
          <div className="p-2.5 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 px-2.5 py-2 bg-gray-50 dark:bg-zinc-800 rounded-xl">
              <Search size={13} className="text-gray-400 dark:text-zinc-500 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country…"
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-500"
              />
            </div>
          </div>

          {/* List */}
          <ul className="max-h-52 overflow-y-auto">
            {!search && (
              <li className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider bg-gray-50 dark:bg-zinc-800/60">
                Common
              </li>
            )}
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-sm text-gray-400 dark:text-zinc-500 text-center">
                No results
              </li>
            ) : (
              filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => handleSelect(c.code)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left"
                    style={
                      value === c.code
                        ? { color: 'var(--tenant-primary)', fontWeight: 600 }
                        : { color: undefined }
                    }
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="flex-1 truncate text-gray-700 dark:text-zinc-200">
                      {c.name}
                    </span>
                    <span className="text-gray-400 dark:text-zinc-500 font-medium text-xs">
                      {c.code}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

export default CountryCodeDropdown;