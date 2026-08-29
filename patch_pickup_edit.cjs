const fs = require('fs');
const file = 'src/pages/admin/AdminPickupOrdersPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace customerPhone initialization
content = content.replace(
  /const \[customerPhone, setCustomerPhone\] = useState\(\(\) => parseO\(order\.address\)\.mobile \|\| ''\);/,
  `const [customerPhone, setCustomerPhone] = useState(() => (parseO(order.address).mobile || order.user_phone || '').replace(/^[A-Z]{2,3}:/, '').trim());
  
  // Manual Adjustments State
  const [manualTax, setManualTax] = useState(false);
  const [taxAmount, setTaxAmount] = useState(parseFloat(order.tax_amount) || 0);
  const [manualDiscount, setManualDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(parseFloat(order.discount_amount) || 0);
  const [applyProratedTax, setApplyProratedTax] = useState(true);
  const [applyProratedDiscount, setApplyProratedDiscount] = useState(true);`
);

// 2. Replace totals calculation
const oldTotals = `  const shipping = parseFloat(order.shipping_fee) || 0;
  const tax = parseFloat(order.tax_amount) || 0;
  const discount = parseFloat(order.discount_amount) || 0;
  const itemsTotal = items.reduce((s, i) => s + (i.variant?.price || i.product?.price || 0) * (i.qty || 1), 0);
  const addr = parseO(order.address);
  const signatureFee = parseFloat(addr.signature_fee) || 0;
  const insuranceFee = parseFloat(addr.insurance_fee) || 0;
  const newTotal = Math.max(0, itemsTotal + shipping + signatureFee + insuranceFee + tax - discount);
  const oldTotal = parseFloat(order.total) || 0;
  const diff = parseFloat((newTotal - oldTotal).toFixed(2));`;

const newTotals = `  const originalTax = parseFloat(order.tax_amount) || 0;
  const originalDiscount = parseFloat(order.discount_amount) || 0;
  const originalItemsTotal = parseJ(order.items).reduce((s, i) => s + (i.variant?.price || i.product?.price || 0) * (i.qty || 1), 0);

  const itemsTotal = items.reduce((s, i) => s + (i.variant?.price || i.product?.price || 0) * (i.qty || 1), 0);
  const ratio = originalItemsTotal > 0 ? (itemsTotal / originalItemsTotal) : 1;
  const currentTax = manualTax ? Number(taxAmount) : (applyProratedTax ? (originalTax * ratio) : originalTax);
  const currentDiscount = manualDiscount ? Number(discountAmount) : (applyProratedDiscount ? (originalDiscount * ratio) : originalDiscount);

  const shipping = parseFloat(order.shipping_fee) || 0;
  const addr = parseO(order.address);
  const signatureFee = parseFloat(addr.signature_fee) || 0;
  const insuranceFee = parseFloat(addr.insurance_fee) || 0;
  const newTotal = Math.max(0, itemsTotal + shipping + signatureFee + insuranceFee + currentTax - currentDiscount);
  const oldTotal = parseFloat(order.total) || 0;
  const diff = parseFloat((newTotal - oldTotal).toFixed(2));`;

content = content.replace(oldTotals, newTotals);

// 3. Update handleSave
const oldSave = `body: JSON.stringify({ items, address: { ...address, mobile: customerPhone }, customer_phone: customerPhone, note }),`;
const newSave = `body: JSON.stringify({ items, address: { ...address, mobile: customerPhone }, customer_phone: customerPhone, note, tax_amount: currentTax, discount_amount: currentDiscount }),`;
content = content.replace(oldSave, newSave);

// 4. Inject Price Adjustments and Breakdown UI before Price diff summary
const priceAdjustmentsUI = `
            {/* Price Adjustments */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-4 mb-4">
              <p className="text-[10px] font-bold text-[#08183A]/60 uppercase tracking-wider mb-1">Price Adjustments</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-[#08183A] cursor-pointer font-medium">
                    <input type="checkbox" checked={manualTax} onChange={e => setManualTax(e.target.checked)} className="w-4 h-4 rounded text-[#08183A] focus:ring-[#08183A]" />
                    Override Tax Amount (Flat $)
                  </label>
                  {!manualTax && originalTax > 0 && (
                    <label className="flex items-center gap-2 text-xs text-[#08183A] cursor-pointer">
                      <input type="checkbox" checked={applyProratedTax} onChange={e => setApplyProratedTax(e.target.checked)} className="accent-[#08183A]" />
                      Prorate Auto
                    </label>
                  )}
                </div>
                {manualTax && (
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-blue-200 px-3 py-2">
                    <span className="text-gray-500 font-bold">$</span>
                    <input type="number" min="0" value={taxAmount} onChange={e => setTaxAmount(e.target.value)} className="w-full bg-transparent focus:outline-none text-[#08183A]" />
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t border-blue-100 pt-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-[#08183A] cursor-pointer font-medium">
                    <input type="checkbox" checked={manualDiscount} onChange={e => setManualDiscount(e.target.checked)} className="w-4 h-4 rounded text-[#08183A] focus:ring-[#08183A]" />
                    Override Discount Amount (Flat $)
                  </label>
                  {!manualDiscount && originalDiscount > 0 && (
                    <label className="flex items-center gap-2 text-xs text-[#08183A] cursor-pointer">
                      <input type="checkbox" checked={applyProratedDiscount} onChange={e => setApplyProratedDiscount(e.target.checked)} className="accent-[#08183A]" />
                      Prorate Auto
                    </label>
                  )}
                </div>
                {manualDiscount && (
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-blue-200 px-3 py-2">
                    <span className="text-gray-500 font-bold">$</span>
                    <input type="number" min="0" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} className="w-full bg-transparent focus:outline-none text-[#08183A]" />
                  </div>
                )}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2 mb-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">\${itemsTotal.toFixed(2)}</span>
              </div>
              {currentDiscount > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">-\${currentDiscount.toFixed(2)}</span>
                </div>
              )}
              {currentTax > 0 && (
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Tax {manualTax ? '(Manual)' : (applyProratedTax ? '(Prorated)' : '')}</span>
                  <span className="font-semibold">\${currentTax.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
                <span className="font-bold text-[#08183A] text-sm">Calculated New Total</span>
                <span className="font-bold text-[#08183A] text-sm">\${newTotal.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Price diff summary */}`;

content = content.replace('{/* Price diff summary */}', priceAdjustmentsUI);

fs.writeFileSync(file, content);
