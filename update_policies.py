import re
import os

date = "August 23, 2026"

# 1. Update dates in all policy pages
for fpath in ['src/pages/PrivacyPolicyPage.jsx', 'src/pages/TermsOfServicePage.jsx']:
    with open(fpath, 'r') as f:
        content = f.read()
    content = re.sub(r'Effective Date:.*?</p>', f'Effective Date: {date}</p>', content)
    with open(fpath, 'w') as f:
        f.write(content)

for fpath in ['src/pages/ReturnsPolicyPage.jsx', 'src/pages/ShippingPolicyPage.jsx']:
    with open(fpath, 'r') as f:
        content = f.read()
    content = re.sub(r'Last updated:.*?</p>', f'Last updated: {date}</p>', content)
    with open(fpath, 'w') as f:
        f.write(content)

# 2. Add Manufacture Defects block
with open('src/pages/ReturnsPolicyPage.jsx', 'r') as f:
    content = f.read()

manufacture_block = """
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white border border-brand-gold/20 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-brand-dark-blue text-base">Manufacture Defects</h3>
                  </div>
                  <p className="text-brand-dark-blue/65 text-sm leading-relaxed mb-3">
                    If your item arrives with a manufacturing defect, we will send a <strong className="text-brand-dark-blue">replacement in the next shipment</strong> at no cost to you.
                  </p>
                  <div className="bg-purple-50 rounded-xl px-3 py-2 text-xs text-purple-700 font-medium">
                    ⚠️ Unboxing video proof required
                  </div>
                </motion.div>"""

# Find the end of Missing Items block and insert Manufacture block
missing_items_end = r'⚠️ Unboxing video proof required\s*</div>\s*</motion\.div>'
content = re.sub(missing_items_end, r'\g<0>' + manufacture_block, content, count=1)

# Change grid-cols-2 to grid-cols-3
content = content.replace('className="grid grid-cols-1 md:grid-cols-2 gap-5"', 'className="grid grid-cols-1 md:grid-cols-3 gap-5"')

# 3. Add Customer Responsibility After Delivery
responsibility_block = """
            {/* Customer Responsibility After Delivery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-brand-gold/20 rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-2xl font-serif font-bold text-brand-dark-blue mb-4">Customer Responsibility After Delivery</h2>
              <div className="text-brand-dark-blue/70 text-sm leading-relaxed space-y-3">
                <p>
                  Once an order has been successfully delivered, Houra Jewels is not responsible for any damage, loss, or deterioration resulting from the customer’s use or handling of the product. As our products are fashion jewelry, customers are responsible for proper care, handling, and storage after delivery.
                </p>
                <p>
                  We recommend following our <a href="/jewelry-care" className="text-brand-gold font-bold hover:underline">Jewelry Care Tips</a> to help maintain the product’s appearance and longevity.
                </p>
              </div>
            </motion.div>
"""

what_we_cover_end = r'</motion\.div>\s*</div>\s*</div>'
content = re.sub(what_we_cover_end, r'\g<0>' + responsibility_block, content, count=1)

# 4. Add Instagram DM to claim steps
content = content.replace('Contact us within 7 days of delivery via WhatsApp (+1 940-465-6563) or email (support@hourajewels.com).', 'Contact us within 7 days of delivery via WhatsApp (+1 940-465-6563), Instagram DM, or email (support@hourajewels.com).')

with open('src/pages/ReturnsPolicyPage.jsx', 'w') as f:
    f.write(content)

print('Updated policies successfully.')
