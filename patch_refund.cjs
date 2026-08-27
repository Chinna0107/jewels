const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminOrdersPage.jsx', 'utf8');

const regex = /function RefundModal\(.*?\{[\s\S]*?(?=\n\nexport function AdminOrdersPage)/;
const match = code.match(regex);
if (!match) {
  console.log("Could not find RefundModal in AdminOrdersPage.jsx");
  process.exit(1);
}

const newRefundModal = `function RefundModal({ order, refunding, refundResult, onConfirm, onClose }) {
  const items = (() => { try { return typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch (e) { return []; } })();
  
  let address = {};
  try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
  
  const getPrice = (i) => parseFloat(i.size?.our_price || i.size?.mrp || i.size?.price || i.variant?.price || i.product?.price || 0);
  const currentItemsTotal = items.reduce((s, i) => s + getPrice(i) * i.qty, 0);

  let rHist = [];
  try { rHist = typeof order.refund_history === 'string' ? JSON.parse(order.refund_history) : (order.refund_history || []); } catch(e) {}
  
  let alreadyRefundedShipping = 0;
  let alreadyRefundedTax = 0;
  let alreadyRefundedSignature = 0;
  let alreadyRefundedInsurance = 0;
  let alreadyDeductedDiscount = 0;
  
  for (const entry of rHist) {
    if (entry.breakdown) {
      alreadyRefundedShipping += parseFloat(entry.breakdown.shipping || 0);
      alreadyRefundedTax += parseFloat(entry.breakdown.tax || 0);
      alreadyRefundedSignature += parseFloat(entry.breakdown.signature || 0);
      alreadyRefundedInsurance += parseFloat(entry.breakdown.insurance || 0);
      alreadyDeductedDiscount += parseFloat(entry.breakdown.discount_deduction || 0);
    }
  }

  const orderTotal = parseFloat(order.total) || 0;
  const originalShipping = Math.max(0, parseFloat(order.shipping_fee) || 0);
  const originalTax = Math.max(0, parseFloat(order.tax_amount) || 0);
  const originalDiscount = Math.max(0, parseFloat(order.discount_amount) || 0);
  const originalSignature = parseFloat(address.signature_fee) || 0;
  const originalInsurance = parseFloat(address.insurance_fee) || 0;

  const remainingShipping = Math.max(0, originalShipping - alreadyRefundedShipping);
  const remainingTax = Math.max(0, originalTax - alreadyRefundedTax);
  const remainingSignature = Math.max(0, originalSignature - alreadyRefundedSignature);
  const remainingInsurance = Math.max(0, originalInsurance - alreadyRefundedInsurance);
  const remainingDiscount = Math.max(0, originalDiscount - alreadyDeductedDiscount);

  let snapshotCancelled = [];
  try { snapshotCancelled = typeof order.cancelled_items_snapshot === 'string' ? JSON.parse(order.cancelled_items_snapshot) : (order.cancelled_items_snapshot || []); } catch(e) {}
  const alreadyCancelledTotal = snapshotCancelled.reduce((s, i) => s + getPrice(i) * (i.cancelQty || i.qty), 0);
  
  const originalItemsTotal = currentItemsTotal + alreadyCancelledTotal;

  const [cancelType, setCancelType] = useState('refund');
  const [selectedQty, setSelectedQty] = useState(() => Object.fromEntries(items.map((it, i) => [i, it.qty])));

  const [refundShipping, setRefundShipping] = useState(true);
  const [refundTax, setRefundTax] = useState(true);
  const [refundSignature, setRefundSignature] = useState(true);
  const [refundInsurance, setRefundInsurance] = useState(true);
  const [refundDiscount, setRefundDiscount] = useState(true);

  const [chargeType, setChargeType] = useState('flat');
  const [chargeValue, setChargeValue] = useState(0);

  const updateQty = (idx, qty) => {
    const q = Math.max(0, Math.min(items[idx].qty, parseInt(qty) || 0));
    setSelectedQty(p => ({ ...p, [idx]: q }));
  };

  const selectedItemsTotal = items.reduce((s, item, idx) => s + getPrice(item) * (selectedQty[idx] || 0), 0);
  const allSelected = items.every((item, i) => selectedQty[i] === item.qty);
  const anySelected = items.some((item, i) => selectedQty[i] > 0);
  const isFullCancel = allSelected;

  const proratedTax = originalItemsTotal > 0 ? originalTax * (selectedItemsTotal / originalItemsTotal) : remainingTax;
  const proratedDiscount = originalItemsTotal > 0 ? originalDiscount * (selectedItemsTotal / originalItemsTotal) : remainingDiscount;

  const actualShippingRefund = refundShipping ? remainingShipping : 0;
  const actualTaxRefund = refundTax ? Math.min(remainingTax, isFullCancel ? remainingTax : proratedTax) : 0;
  const actualSignatureRefund = refundSignature ? remainingSignature : 0;
  const actualInsuranceRefund = refundInsurance ? remainingInsurance : 0;
  const actualDiscountDeduction = refundDiscount ? Math.min(remainingDiscount, isFullCancel ? remainingDiscount : proratedDiscount) : 0;

  const subtotalRefund = selectedItemsTotal + actualShippingRefund + actualTaxRefund + actualSignatureRefund + actualInsuranceRefund - actualDiscountDeduction;

  const transactionCharge = chargeType === 'flat'
    ? parseFloat(chargeValue || 0)
    : Math.max(0, subtotalRefund) * (parseFloat(chargeValue || 0) / 100);

  // Hard cap on refund to prevent refunding more than the total order amount
  const maxRefundable = Math.max(0, (parseFloat(order.total) || 0) - (parseFloat(order.refund_amount) || 0));
  const calcRefundTotal = cancelType === 'refund' ? Math.max(0, subtotalRefund - transactionCharge) : 0;
  const refundTotal = Math.min(calcRefundTotal, maxRefundable);

  const handleConfirm = () => {
    const cancelledItems = items
      .filter((_, idx) => selectedQty[idx] > 0)
      .map((item, idx) => ({
        productId: item.product?.id,
        variantSize: item.variant?.size || '',
        qty: selectedQty[idx],
        cancelQty: selectedQty[idx],
        price: getPrice(item) * selectedQty[idx],
        name: item.product?.name,
        color: item.variant?.color,
        size: item.variant?.size,
      }));

    onConfirm({
      breakdown: {
        items: selectedItemsTotal,
        shipping: actualShippingRefund,
        tax: actualTaxRefund,
        signature: actualSignatureRefund,
        insurance: actualInsuranceRefund,
        discount_deduction: actualDiscountDeduction,
        transaction_charge: cancelType === 'refund' ? transactionCharge : 0,
        total: refundTotal,
      },
      cancelledItems: isFullCancel ? null : cancelledItems,
      cancelType,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="font-serif text-lg font-bold text-[#08183A]">Cancel Order</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>

        {refundResult ? (
          <div className="p-6 text-center">
            {refundResult.success ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCcw className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-[#08183A] mb-1">
                  {refundResult.partial ? 'Partially Cancelled!' : 'Order Cancelled!'}
                </h3>
                {cancelType === 'refund' ? (
                  <p className="text-sm text-gray-500 mb-2">
                    Refund of <strong>\${refundResult.amount?.toFixed(2)}</strong> has been processed.
                  </p>
                ) : (
                  <p className="text-sm text-amber-600 font-semibold mb-2">Cancelled without refund.</p>
                )}
                {refundResult.partial && refundResult.remainingItems > 0 && (
                  <span className="block mt-1 text-blue-600 font-medium">{refundResult.remainingItems} item(s) remain active in the order.</span>
                )}
                {refundResult.refundId && <p className="text-xs text-gray-400 font-mono">ID: {refundResult.refundId}</p>}
                <button onClick={onClose} className="mt-5 w-full bg-[#08183A] text-white font-bold py-2.5 rounded-xl hover:bg-[#08183A]/80 transition-colors">Done</button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-bold text-lg text-[#08183A] mb-1">Cancellation Failed</h3>
                <p className="text-sm text-red-500 mb-4">{refundResult.error}</p>
                <button onClick={onClose} className="w-full bg-gray-100 text-[#08183A] font-bold py-2.5 rounded-xl">Close</button>
              </>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-5 overflow-y-auto">
            <p className="text-sm text-gray-500">Order <strong>#{order.order_number || order.id}</strong></p>

            <div>
              <p className="text-[10px] font-bold text-[#08183A]/40 uppercase tracking-wider mb-2">Cancellation Type</p>
              <select value={cancelType} onChange={e => setCancelType(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#08183A] bg-gray-50 focus:outline-none">
                <option value="refund">Cancel & Refund Payment</option>
                <option value="no_refund">Cancel Without Refund</option>
                <option value="coupon_cancel">Cancel Without Refund (Discount Coupon)</option>
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-[#08183A]/40 uppercase tracking-wider">Select Items to Cancel</p>
              {items.map((item, idx) => {
                const price = getPrice(item) * (selectedQty[idx] || 0);
                const variantColor = (item.variant?.color || '').toLowerCase().trim();
                const matchedV = item.product?.variants?.find(v => (v.color || '').toLowerCase().trim() === variantColor);
                const img = item.variant?.image || matchedV?.images?.[0] || item.product?.images?.[0] || item.product?.image_url;
                const itemCode = item.variant?.size_code || item.variant?.code || matchedV?.sizes?.find(s => s.size === item.variant?.size)?.code;
                const isSelected = selectedQty[idx] > 0;
                return (
                  <div key={idx} className={\`flex items-center gap-3 p-3 rounded-xl border transition-all \${isSelected ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}\`}>
                    {img && <img src={img} alt="" className="w-10 h-10 object-contain rounded-lg border border-gray-100 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#08183A] truncate">{item.product?.name || 'Product'}{item.variant?.color ? \` — \${item.variant.color}\` : ''}</p>
                      <p className="text-xs text-gray-500">{item.variant?.size || 'Standard'} {itemCode ? \` • #\${itemCode}\` : ''}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-[#08183A] text-sm">\${price.toFixed(2)}</span>
                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded px-1">
                        <span className="text-[10px] text-gray-400">Cancel Qty:</span>
                        <input type="number" min="0" max={item.qty} value={selectedQty[idx]}
                          onChange={(e) => updateQty(idx, e.target.value)}
                          className="w-10 text-xs text-center focus:outline-none" />
                        <span className="text-[10px] text-gray-400">/ {item.qty}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {cancelType === 'refund' && anySelected && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {remainingShipping > 0 && (
                    <label className="flex items-center justify-between p-3 bg-[#FDF8F0] rounded-xl border border-[#08183A]/10 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={refundShipping} onChange={e => setRefundShipping(e.target.checked)} className="w-4 h-4 accent-[#08183A]" />
                        <span className="text-sm font-bold text-[#08183A]">Refund Shipping Fee</span>
                      </div>
                      <span className="font-bold text-[#08183A]">\${remainingShipping.toFixed(2)}</span>
                    </label>
                  )}
                  {remainingTax > 0 && (
                    <label className="flex items-center justify-between p-3 bg-[#FDF8F0] rounded-xl border border-[#08183A]/10 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={refundTax} onChange={e => setRefundTax(e.target.checked)} className="w-4 h-4 accent-[#08183A]" />
                        <span className="text-sm font-bold text-[#08183A]">Refund Tax {isFullCancel ? '' : '(Prorated)'}</span>
                      </div>
                      <span className="font-bold text-[#08183A]">\${actualTaxRefund.toFixed(2)}</span>
                    </label>
                  )}
                  {remainingSignature > 0 && (
                    <label className="flex items-center justify-between p-3 bg-[#FDF8F0] rounded-xl border border-[#08183A]/10 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={refundSignature} onChange={e => setRefundSignature(e.target.checked)} className="w-4 h-4 accent-[#08183A]" />
                        <span className="text-sm font-bold text-[#08183A]">Refund Signature Fee</span>
                      </div>
                      <span className="font-bold text-[#08183A]">\${actualSignatureRefund.toFixed(2)}</span>
                    </label>
                  )}
                  {remainingInsurance > 0 && (
                    <label className="flex items-center justify-between p-3 bg-[#FDF8F0] rounded-xl border border-[#08183A]/10 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={refundInsurance} onChange={e => setRefundInsurance(e.target.checked)} className="w-4 h-4 accent-[#08183A]" />
                        <span className="text-sm font-bold text-[#08183A]">Refund Insurance Fee</span>
                      </div>
                      <span className="font-bold text-[#08183A]">\${actualInsuranceRefund.toFixed(2)}</span>
                    </label>
                  )}
                  {remainingDiscount > 0 && (
                    <label className="flex items-center justify-between p-3 bg-[#FDF8F0] rounded-xl border border-[#08183A]/10 cursor-pointer opacity-80">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={refundDiscount} onChange={e => setRefundDiscount(e.target.checked)} className="w-4 h-4 accent-[#08183A]" />
                        <span className="text-sm font-bold text-[#08183A]">Deduct Applied Discount {isFullCancel ? '' : '(Prorated)'}</span>
                      </div>
                      <span className="font-bold text-red-600">-\${actualDiscountDeduction.toFixed(2)}</span>
                    </label>
                  )}
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <p className="text-[10px] font-bold text-[#08183A]/40 uppercase tracking-wider">Deduct Cancellation Charge</p>
                  <div className="flex gap-2">
                    <select value={chargeType} onChange={e => setChargeType(e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-[#08183A] bg-white focus:outline-none w-24">
                      <option value="flat">Flat ($)</option>
                      <option value="percent">Percent (%)</option>
                    </select>
                    <input type="number" min="0" step="0.01" value={chargeValue} onChange={e => setChargeValue(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#08183A] bg-white focus:outline-none" />
                  </div>
                  {transactionCharge > 0 && (
                    <p className="text-xs text-amber-600 font-semibold text-right">Deducting: \${transactionCharge.toFixed(2)}</p>
                  )}
                </div>
              </div>
            )}

            <div className={\`flex justify-between items-center border rounded-xl px-4 py-3 \${cancelType === 'refund' ? 'bg-red-50 border-red-100' : 'bg-gray-100 border-gray-200'}\`}>
              <div>
                <span className={\`font-bold \${cancelType === 'refund' ? 'text-red-700' : 'text-gray-700'}\`}>
                  {cancelType === 'refund' ? 'Total Refund' : 'Amount to Cancel'}
                </span>
                {!isFullCancel && anySelected && (
                  <p className={\`text-[10px] mt-0.5 \${cancelType === 'refund' ? 'text-red-500' : 'text-gray-500'}\`}>Remaining items stay active</p>
                )}
              </div>
              <span className={\`font-bold text-lg \${cancelType === 'refund' ? 'text-red-700' : 'text-gray-700'}\`}>
                \${(cancelType === 'refund' ? refundTotal : selectedItemsTotal).toFixed(2)}
              </span>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 text-[#08183A] rounded-xl font-semibold hover:bg-gray-200 transition-colors">Abort</button>
              <button onClick={handleConfirm} disabled={refunding || !anySelected || (cancelType === 'refund' && refundTotal <= 0 && selectedItemsTotal > 0)}
                className={\`flex-1 px-4 py-2.5 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 \${cancelType === 'refund' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}\`}>
                {refunding
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                  : (!isFullCancel ? 'Cancel Selected' : 'Cancel Full Order')
                }
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}`;

let newCode = code.replace(regex, newRefundModal);
fs.writeFileSync('src/pages/admin/AdminOrdersPage.jsx', newCode);
console.log("Patched AdminOrdersPage.jsx RefundModal");

// Now apply the exact same patch to AdminPickupOrdersPage.jsx
let pickupCode = fs.readFileSync('src/pages/admin/AdminPickupOrdersPage.jsx', 'utf8');
let newPickupCode = pickupCode.replace(regex, newRefundModal);
fs.writeFileSync('src/pages/admin/AdminPickupOrdersPage.jsx', newPickupCode);
console.log("Patched AdminPickupOrdersPage.jsx RefundModal");

