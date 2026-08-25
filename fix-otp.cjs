const fs = require('fs');
const file = '/Users/hemanthkancharla/Documents/zewotech/jewels/src/pages/SignupPage.jsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove the old handleOtpChange and handleOtpKeyDown from SignupPage
code = code.replace(/  const handleOtpChange = [\s\S]*?\}\n\n  const handleOtpKeyDown = [\s\S]*?\}\n\n/g, '');
code = code.replace(/  const phoneOtpRefs = useRef\(\[\]\);\n/g, '');
code = code.replace(/  const emailOtpRefs = useRef\(\[\]\);\n/g, '');

// 2. Inject OtpInput before export function SignupPage()
const otpComponent = `
function OtpInput({ length = 6, value, onChange, className, inputClassName }) {
  const refs = useRef([]);
  
  const handleChange = (val, idx) => {
    if (!/^\\d?$/.test(val)) return;
    const next = [...value];
    next[idx] = val;
    onChange(next);
    if (val && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  return (
    <div className={className}>
      {value.map((digit, idx) => (
        <input 
          key={idx} 
          ref={el => refs.current[idx] = el}
          type="text" inputMode="numeric" maxLength={1} value={digit}
          onChange={e => handleChange(e.target.value, idx)}
          onKeyDown={e => handleKeyDown(e, idx)}
          className={inputClassName}
        />
      ))}
    </div>
  );
}

export function SignupPage`;

code = code.replace(/export function SignupPage/, otpComponent);

// 3. Replace all the inline maps with <OtpInput />

// Desktop Phone OTP
code = code.replace(
  /<div className="flex justify-center gap-3">\s*\{phoneOtp\.map\(\(digit, idx\) => \(\s*<input key=\{idx\} ref=\{el => phoneOtpRefs\.current\[idx\] = el\}[\s\S]*?className="w-12 h-14 text-center text-xl font-bold bg-white border-2 border-brand-gold\/20 rounded-xl text-brand-dark-blue focus:outline-none focus:border-brand-gold transition-colors"\s*\/>\s*\)\)\}\s*<\/div>/g,
  '<OtpInput value={phoneOtp} onChange={setPhoneOtp} className="flex justify-center gap-3" inputClassName="w-12 h-14 text-center text-xl font-bold bg-white border-2 border-brand-gold/20 rounded-xl text-brand-dark-blue focus:outline-none focus:border-brand-gold transition-colors" />'
);

// Desktop Email OTP
code = code.replace(
  /<div className="flex justify-center gap-3">\s*\{emailOtp\.map\(\(digit, idx\) => \(\s*<input key=\{idx\} ref=\{el => emailOtpRefs\.current\[idx\] = el\}[\s\S]*?className="w-12 h-14 text-center text-xl font-bold bg-white border-2 border-brand-gold\/20 rounded-xl text-brand-dark-blue focus:outline-none focus:border-brand-gold transition-colors"\s*\/>\s*\)\)\}\s*<\/div>/g,
  '<OtpInput value={emailOtp} onChange={setEmailOtp} className="flex justify-center gap-3" inputClassName="w-12 h-14 text-center text-xl font-bold bg-white border-2 border-brand-gold/20 rounded-xl text-brand-dark-blue focus:outline-none focus:border-brand-gold transition-colors" />'
);

// Mobile Phone OTP
code = code.replace(
  /<div className="flex justify-center gap-2">\s*\{phoneOtp\.map\(\(digit, idx\) => \(\s*<input key=\{idx\} ref=\{el => phoneOtpRefs\.current\[idx\] = el\}[\s\S]*?className="w-10 h-12 text-center text-xl font-bold bg-transparent border border-white\/20 rounded-xl text-white focus:outline-none focus:border-\[\#D4AF37\] focus:ring-1 focus:ring-\[\#D4AF37\] transition-all"\s*\/>\s*\)\)\}\s*<\/div>/g,
  '<OtpInput value={phoneOtp} onChange={setPhoneOtp} className="flex justify-center gap-2" inputClassName="w-10 h-12 text-center text-xl font-bold bg-transparent border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all" />'
);

// Mobile Email OTP
code = code.replace(
  /<div className="flex justify-center gap-2">\s*\{emailOtp\.map\(\(digit, idx\) => \(\s*<input key=\{idx\} ref=\{el => emailOtpRefs\.current\[idx\] = el\}[\s\S]*?className="w-10 h-12 text-center text-xl font-bold bg-transparent border border-white\/20 rounded-xl text-white focus:outline-none focus:border-\[\#D4AF37\] focus:ring-1 focus:ring-\[\#D4AF37\] transition-all"\s*\/>\s*\)\)\}\s*<\/div>/g,
  '<OtpInput value={emailOtp} onChange={setEmailOtp} className="flex justify-center gap-2" inputClassName="w-10 h-12 text-center text-xl font-bold bg-transparent border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all" />'
);

fs.writeFileSync(file, code);
