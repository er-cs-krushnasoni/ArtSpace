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

  // Position the dropdown using fixed coords based on button position
  // This escapes any overflow:hidden parent
const updatePosition = () => {
  if (!btnRef.current) return;
  const rect = btnRef.current.getBoundingClientRect();
  setDropdownPos({
    top: rect.bottom + 4,   // viewport-relative, no scrollY needed for fixed
    left: rect.left,
  });
};

  useEffect(() => {
    if (open) updatePosition();
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    window.addEventListener('scroll', () => open && updatePosition(), true);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', () => open && updatePosition(), true);
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
        className="flex items-center gap-1 px-3 h-full text-sm text-gray-700 border-r border-gray-200 bg-gray-50 rounded-l-lg hover:bg-gray-100 transition-colors whitespace-nowrap flex-shrink-0"
        style={{ minWidth: '80px' }}
      >
        <span>{selected.flag}</span>
        <span className="font-medium">{selected.code}</span>
        <ChevronDown size={13} className="text-gray-400" />
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="fixed z-[200] bg-white border border-gray-200 rounded-xl shadow-xl w-64 overflow-hidden"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
              <Search size={13} className="text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
          {/* List */}
          <ul className="max-h-52 overflow-y-auto">
            {!search && (
              <li className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50">
                Common
              </li>
            )}
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-gray-400 text-center">No results</li>
            ) : (
              filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => handleSelect(c.code)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left"
                    style={value === c.code ? { color: 'var(--tenant-primary)', fontWeight: 600 } : {}}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="flex-1 truncate text-gray-700">{c.name}</span>
                    <span className="text-gray-400 font-medium">{c.code}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default CountryCodeDropdown;