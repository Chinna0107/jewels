const fs = require('fs');
const file = '/Users/hemanthkancharla/Documents/zewotech/jewels/src/pages/SignupPage.jsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove the old state from SignupPage
code = code.replace(/  const \[countryOpen, setCountryOpen\] = useState\(false\);\n/g, '');
code = code.replace(/  const \[countrySearch, setCountrySearch\] = useState\(''\);\n/g, '');
code = code.replace(/  const countryDropdownRef = useRef\(null\);\n/g, '');

// 2. Remove the old useEffect for mousedown on countryDropdownRef
code = code.replace(/  useEffect\(\(\) => \{\n    const handler = \(e\) => \{ if \(countryDropdownRef\.current && !countryDropdownRef\.current\.contains\(e\.target\)\) setCountryOpen\(false\); \};\n    document\.addEventListener\('mousedown', handler\);\n    return \(\) => document\.removeEventListener\('mousedown', handler\);\n  \}, \[\]\);\n/g, '');

// 3. Inject the new CountryPicker before export function SignupPage()
const newComponent = `
function CountryPicker({ dark, allowedCountries, value, onChange }) {
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const countryDropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) setCountryOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isoFlag = (iso) => String.fromCodePoint(...[...iso].map(c => 0x1F1E6 - 65 + c.charCodeAt(0)));
  const list = allowedCountries.length > 0 ? COUNTRIES.filter(c => allowedCountries.includes(c.name)) : COUNTRIES;
  const filtered = list.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));
  const selected = COUNTRIES.find(c => c.name === value);

  return (
    <div ref={countryDropdownRef} className="relative">
      <button
        type="button"
        onClick={() => { setCountryOpen(o => !o); setCountrySearch(''); }}
        className={\`w-full flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm border transition-all focus:outline-none \${
          dark
            ? 'bg-transparent border-white/10 text-white focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50'
            : 'bg-white border-brand-gold/20 text-brand-dark-blue focus:ring-2 focus:ring-brand-gold/40'
        }\`}
      >
        {selected ? (
          <><span className="text-base leading-none shrink-0">{isoFlag(selected.iso)}</span><span className="flex-1 text-left truncate">{selected.name}</span></>
        ) : (
          <span className={\`flex-1 text-left \${dark ? 'text-white/30' : 'text-brand-dark-blue/30'}\`}>Select your country</span>
        )}
        <svg className={\`w-4 h-4 shrink-0 transition-transform \${countryOpen ? 'rotate-180' : ''} \${dark ? 'text-white/40' : 'text-brand-dark-blue/40'}\`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {countryOpen && (
        <div className="absolute z-[200] mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              value={countrySearch}
              onChange={e => setCountrySearch(e.target.value)}
              placeholder="Search country..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-gold"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto">
            {filtered.map(c => (
              <li key={c.iso}>
                <button
                  type="button"
                  onClick={() => { onChange(c.name); setCountryOpen(false); }}
                  className={\`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors \${
                    value === c.name ? 'bg-brand-gold/10 font-bold text-brand-dark-blue' : 'text-gray-700 hover:bg-gray-50'
                  }\`}
                >
                  <span className="text-base shrink-0">{isoFlag(c.iso)}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="px-4 py-6 text-center text-sm text-gray-400">No results</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

export function SignupPage`;

code = code.replace(/export function SignupPage/, newComponent);

// 4. Update the CountryPicker props
code = code.replace(/<CountryPicker dark=\{false\} \/>/g, '<CountryPicker dark={false} allowedCountries={allowedCountries} value={form.country} onChange={(val) => setForm(f => ({ ...f, country: val }))} />');
code = code.replace(/<CountryPicker dark=\{true\} \/>/g, '<CountryPicker dark={true} allowedCountries={allowedCountries} value={form.country} onChange={(val) => setForm(f => ({ ...f, country: val }))} />');

fs.writeFileSync(file, code);
