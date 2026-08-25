import re

with open('src/pages/admin/AdminOrdersPage.jsx', 'r') as f:
    content = f.read()

content = content.replace('export function AdminOrdersPage()', 'export function AdminPickupOrdersPage()')
content = content.replace("if (o.order_type === 'pickup') return false;", "if (o.order_type !== 'pickup') return false;")
content = content.replace("['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']", "['all', 'pending', 'processing', 'ready for pickup', 'pickup completed', 'cancelled']")
content = content.replace('<Store className="w-6 h-6" /> Orders', '<Store className="w-6 h-6" /> Pickup Orders')

old_notify_pattern = re.compile(r'const notifyWhatsApp = \(order\) => \{.*?\n\s*};\n', re.DOTALL)
new_notify = '''const notifyWhatsApp = (order) => {
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
    
    let phone = (order.user_phone || address.mobile || "0000000000").replace(/\\D/g, "");
    if (phone.length === 10) phone = '1' + phone;

    const msg = encodeURIComponent(
      `Hi ${order.user_name || address.name || 'Customer'}! Your order #${order.order_number || order.id} status is now: *${order.status}*.\\n\\n` +
      (order.status === 'ready for pickup'
        ? `Your order is ready for pickup at *2965 FM1385, Aubrey, TX 76227*. Please come pick it up at your convenience! 🏪`
        : `Thank you for shopping with Houra Jewels! 🙏`)
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };
'''
content = old_notify_pattern.sub(new_notify.replace('\\', '\\\\'), content)

shippo_btn_pattern = re.compile(r'<div className="space-y-2">\s*<button onClick=\{\(\) => fetchShippoRates\(order\.id\)\}.*?📦 Select Shipping Rate \(Shippo\)\s*</button>\s*</div>', re.DOTALL)
content = shippo_btn_pattern.sub('<div className="text-center text-xs text-blue-500 font-semibold py-2 bg-blue-50 rounded-xl">Pickup Order</div>', content)

shippo_recreate_pattern = re.compile(r'<div className="space-y-2">\s*<a href=\{shipping\[`shippo_url_\$\{order\.id\}`\].*?Re-create Label \(Shippo\)\s*</button>\s*</div>\s*</div>', re.DOTALL)
content = shippo_recreate_pattern.sub('<div className="text-center text-xs text-blue-500 font-semibold py-2 bg-blue-50 rounded-xl">Pickup Order</div>', content)

with open('src/pages/admin/AdminPickupOrdersPage.jsx', 'w') as f:
    f.write(content)

print('Successfully generated AdminPickupOrdersPage.jsx')
