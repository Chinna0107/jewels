import re

with open('src/pages/ContactPage.jsx', 'r') as f:
    content = f.read()

# Inject useState if not there
if 'const [openFaq, setOpenFaq] = useState(null);' not in content:
    content = content.replace('const { hash } = useLocation();', 'const { hash } = useLocation();\n  const [openFaq, setOpenFaq] = useState(null);')

# Replace FAQ Section
faq_pattern = re.compile(r'\{\/\* FAQ Section \*\/}.*', re.DOTALL)

faq_replacement = """{/* FAQ Section */}
      <div id="faq-section" className="bg-brand-beige py-20 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-dark-blue/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        
        <div className="px-4 md:px-24 relative z-10">
          <div className="text-center mb-16">
            <span className="text-brand-gold font-bold uppercase tracking-widest text-sm mb-3 block">Got Questions?</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark-blue mb-5">Frequently Asked Questions</h2>
            <p className="text-brand-dark-blue/60 max-w-2xl mx-auto">Find quick answers to common questions about our products, shipping, returns, and store policies.</p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {[
              { 
                category: 'Shipping & Delivery',
                q: 'How long does shipping take?', 
                a: 'We process and dispatch all orders within 1–2 business days. Delivery typically takes 1-3 business days depending on your location within the US. International shipping times may vary.' 
              },
              { 
                category: 'Product Quality',
                q: 'Is your jewelry waterproof and tarnish-free?', 
                a: 'Yes! Our 18K PVD gold plated stainless steel jewelry is 100% waterproof and tarnish-free. You can confidently wear it while swimming, showering, or working out without it ever turning your skin green.' 
              },
              { 
                category: 'Returns & Cancellations',
                q: 'Do you accept returns or exchanges?', 
                a: 'Yes, we accept returns within 7 days of delivery if the product is unused and in its original condition. Please contact us via WhatsApp, Instagram, or email to initiate a return.' 
              },
              { 
                category: 'Returns & Cancellations',
                q: 'Can I cancel my order after placing it?', 
                a: 'Generally, all sales are final once processed. However, if you need to request an emergency cancellation, please contact us immediately before the order is dispatched.' 
              },
              { 
                category: 'Privacy & Security',
                q: 'How is my personal information protected?', 
                a: 'We employ robust industry-standard security measures to protect your data. Your payment information is securely processed via Stripe, and we never store your full credit card details on our servers.' 
              },
              { 
                category: 'Privacy & Security',
                q: 'Is there an age requirement to purchase?', 
                a: 'Yes, our services are intended for individuals 13 and older. Purchases should be made by adults or with explicit parental consent, as outlined in our Privacy Policy.' 
              },
              { 
                category: 'Support',
                q: 'What happens if my package is lost or damaged?', 
                a: 'Please inspect your order upon reception. If there is damage, provide an unboxing video as proof and contact us immediately so we can evaluate and resolve the issue for you.' 
              },
              { 
                category: 'Orders',
                q: 'Do you offer custom or bulk orders?', 
                a: 'We do entertain bulk and wholesale inquiries! Please reach out to us directly via WhatsApp or Instagram DM with your requirements and we will provide a custom quote.' 
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white border border-brand-gold/15 rounded-2xl overflow-hidden transition-all duration-300 ${openFaq === i ? 'shadow-lg ring-1 ring-brand-gold/30' : 'hover:shadow-md hover:border-brand-gold/30'}`}
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${openFaq === i ? 'bg-brand-gold text-white' : 'bg-brand-gold/10 text-brand-gold'}`}>
                      <span className="text-sm font-bold">Q</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider mb-1 block opacity-80">{faq.category}</span>
                      <h4 className={`font-bold text-[15px] md:text-base transition-colors duration-300 ${openFaq === i ? 'text-brand-gold' : 'text-brand-dark-blue'}`}>{faq.q}</h4>
                    </div>
                  </div>
                  <div className={`shrink-0 ml-4 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}>
                    <svg className={`w-5 h-5 ${openFaq === i ? 'text-brand-gold' : 'text-brand-dark-blue/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-6 pb-6 pt-2 ml-12 border-t border-gray-50">
                    <p className="text-brand-dark-blue/70 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-brand-dark-blue/60 text-sm mb-4">Still have questions?</p>
            <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({top:0, behavior:'smooth'}); }} className="inline-block px-6 py-2 bg-white border border-brand-dark-blue/10 rounded-full text-brand-dark-blue text-sm font-bold hover:bg-brand-gold hover:text-white hover:border-brand-gold transition-all duration-300 shadow-sm">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
"""

content = faq_pattern.sub(faq_replacement, content)

with open('src/pages/ContactPage.jsx', 'w') as f:
    f.write(content)

print('Successfully enhanced FAQ section.')
