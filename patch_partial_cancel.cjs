const fs = require('fs');
const file = '../../../jewelsbe/routes/admin.js';
let content = fs.readFileSync(file, 'utf8');

const oldLogic = `      const newTotal = remainingItems.reduce((sum, item) => sum + (item.variant?.price || item.product?.price || 0) * item.qty, 0);
      const newStatus = remainingItems.length === 0 ? 'cancelled' : order.status;
      const newCancelType = remainingItems.length === 0 ? cancel_type : (order.cancel_type || cancel_type);

      await pool.query(
        \`UPDATE orders SET items=$1, total=$2, status=$3, refund_id=$4,
          refund_amount=COALESCE(refund_amount,0)+$5, refund_breakdown=$6,
          cancelled_items_snapshot=$7, refund_history=$8, cancel_type=$9 WHERE id=$10\`,
        [JSON.stringify(remainingItems), newTotal, newStatus, refundId,
          refundAmount, JSON.stringify(refund_breakdown || {}),
          JSON.stringify(fullSnapshot), JSON.stringify(newHistory), newCancelType, req.params.id]
      );`;

const newLogic = `      const newItemsTotal = remainingItems.reduce((sum, item) => sum + (item.variant?.price || item.product?.price || 0) * item.qty, 0);
      
      const remainingTax = Math.max(0, parseFloat(order.tax_amount || 0) - parseFloat(refund_breakdown?.tax || 0));
      const remainingShipping = Math.max(0, parseFloat(order.shipping_fee || 0) - parseFloat(refund_breakdown?.shipping || 0));
      const remainingDiscount = Math.max(0, parseFloat(order.discount_amount || 0) - parseFloat(refund_breakdown?.discount_deduction || 0));
      
      let remainingSignature = 0;
      let remainingInsurance = 0;
      let updatedAddress = {};
      try { updatedAddress = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
      if (updatedAddress) {
        remainingSignature = Math.max(0, parseFloat(updatedAddress.signature_fee || 0) - parseFloat(refund_breakdown?.signature || 0));
        remainingInsurance = Math.max(0, parseFloat(updatedAddress.insurance_fee || 0) - parseFloat(refund_breakdown?.insurance || 0));
        updatedAddress.signature_fee = remainingSignature;
        updatedAddress.insurance_fee = remainingInsurance;
      }
      
      const newTotal = remainingItems.length === 0 ? 0 : Math.max(0, newItemsTotal + remainingTax + remainingShipping + remainingSignature + remainingInsurance - remainingDiscount);
      
      const newStatus = remainingItems.length === 0 ? 'cancelled' : order.status;
      const newCancelType = remainingItems.length === 0 ? cancel_type : (order.cancel_type || cancel_type);

      await pool.query(
        \`UPDATE orders SET items=$1, total=$2, status=$3, refund_id=$4,
          refund_amount=COALESCE(refund_amount,0)+$5, refund_breakdown=$6,
          cancelled_items_snapshot=$7, refund_history=$8, cancel_type=$9,
          tax_amount=$11, discount_amount=$12, shipping_fee=$13, address=$14
         WHERE id=$10\`,
        [JSON.stringify(remainingItems), newTotal, newStatus, refundId,
          refundAmount, JSON.stringify(refund_breakdown || {}),
          JSON.stringify(fullSnapshot), JSON.stringify(newHistory), newCancelType, req.params.id,
          remainingTax, remainingDiscount, remainingShipping, JSON.stringify(updatedAddress)]
      );`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(file, content);
console.log("Patched partial cancel");
