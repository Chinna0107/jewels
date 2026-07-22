import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, ChevronDown } from 'lucide-react';

const steps = [
  { num: '01', title: 'Contact Us', desc: 'Reach out via WhatsApp (+91 86866 80001) or email (hourajewels@gmail.com) within 7 days of receiving your order. Include your order number and the reason for the return.' },
  { num: '02', title: 'Get Confirmation', desc: 'Our team will review your request and send you a return confirmation along with shipping instructions within 24 hours.' },
  { num: '03', title: 'Ship the Item', desc: 'Pack the item securely in its original packaging and ship it back using the address provided. The return shipping cost is borne by the customer (unless the return is due to our error).' },
  { num: '04', title: 'Refund / Exchange', desc: 'Once we receive and inspect the item, your refund will be processed within 5–7 business days or your exchange item will be dispatched within 2–3 business days.' },
];

const eligibleItems = [
  'Item received is damaged or defective',
  'Wrong item was delivered',
  'Item is unworn and in original packaging',
  'Return requested within 7 days of delivery',
];

const notEligibleItems = [
  'Item has been worn, washed, or used',
  'Return requested after 7 days of delivery',
  'Item is not in original packaging',
  'Customized or personalized items',
  'Items purchased during clearance or final sales',
];

const faqs = [
  { q: 'How long do I have to return an item?', a: 'You have 7 days from the date of delivery to initiate a return. After this window, we are unable to process returns.' },
  { q: 'Who pays for return shipping?', a: 'If the return is due to our error (wrong item or defective product), we will bear the return shipping cost. Otherwise, the return shipping cost is the customer\'s responsibility.' },
  { q: 'How will I receive my refund?', a: 'Refunds are credited to your original payment method within 5–7 business days after we receive and inspect the returned item.' },
  { q: 'Can I exchange for a different design?', a: 'Yes, you can request an exchange for a different design subject to stock availability. Contact us to check availability before shipping back your item.' },
];

function FaqItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${open ? 'border-brand-gold/40' : 'border-brand-gold/15'}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 p-5 bg-white text-left">
        <span className="font-semibold text-brand-dark-blue text-sm md:text-base">{faq.q}</span>
        <ChevronDown className={`w-5 h-5 text-brand-dark-blue/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28 }}
        className="overflow-hidden bg-brand-beige"
      >
        <p className="px-5 py-4 text-sm text-brand-dark-blue/70 leading-relaxed border-t border-brand-gold/10">{faq.a}</p>
      </motion.div>
    </div>
  );
}

export function ReturnsPolicyPage() {
  return (
    <div className="bg-brand-beige min-h-screen pb-20 md:pb-12 font-sans">
      <Header title="Returns & Exchanges" />

      {/* Hero */}
      <div className="bg-brand-dark-blue">
        <div className="px-4 md:px-24 py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="font-bold tracking-widest uppercase text-xs mb-4" style={{ color: '#C6A184' }}>Legal</p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight mb-4">
              Returns &<br className="hidden md:block" /> Exchanges
            </h1>
            <div className="w-20 h-1.5 rounded-full mb-6" style={{ background: '#C6A184' }}></div>
            <p className="text-white/60 text-base md:text-lg leading-relaxed">
              Your satisfaction is our highest priority. If you are not completely happy with your purchase, we are here to make it right.
            </p>
            <p className="text-white/30 text-xs mt-4">Last updated: July 2025</p>
          </motion.div>
        </div>
      </div>

      {/* Key Terms Strip */}
      <div className="px-4 md:px-24 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {[
            { label: 'Return Window', value: '7 Days' },
            { label: 'Refund Time', value: '5–7 Days' },
            { label: 'Exchange Time', value: '2–3 Days' },
            { label: 'Condition', value: 'Unused Only' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white border border-brand-gold/20 rounded-2xl p-4 md:p-5 text-center shadow-sm"
            >
              <p className="text-xl md:text-2xl font-serif font-bold text-brand-gold">{s.value}</p>
              <p className="text-brand-dark-blue/60 text-xs md:text-sm font-semibold mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">

          {/* Left Main */}
          <div className="lg:col-span-2 space-y-10">

            {/* Eligible / Not Eligible */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-brand-dark-blue mb-6">Eligibility</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                    <h3 className="font-bold text-green-800 text-lg">Eligible for Return</h3>
                  </div>
                  <ul className="space-y-3">
                    {eligibleItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-green-700 text-sm leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-red-50 border border-red-200 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                    <h3 className="font-bold text-red-700 text-lg">Not Eligible for Return</h3>
                  </div>
                  <ul className="space-y-3">
                    {notEligibleItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-red-600 text-sm leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </div>

            {/* Return Process Steps */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-brand-dark-blue mb-6">How to Return</h2>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-white border border-brand-gold/20 rounded-2xl p-5 md:p-6 flex gap-5 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-dark-blue flex items-center justify-center shrink-0">
                      <span className="text-brand-gold font-bold text-sm">{step.num}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-dark-blue text-base mb-1">{step.title}</h4>
                      <p className="text-brand-dark-blue/65 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Refund Policy Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-brand-gold/20 rounded-2xl p-6 md:p-8 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-brand-dark-blue flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-brand-gold" />
                </div>
                <h3 className="font-bold text-brand-dark-blue text-xl">Refund Details</h3>
              </div>
              <div className="space-y-3 text-sm text-brand-dark-blue/70 leading-relaxed">
                <p>Once your return is received and inspected, we will notify you of the approval or rejection within 48 hours.</p>
                <p>If approved, your refund will be credited to your original payment method within <strong className="text-brand-dark-blue">5–7 business days</strong>.</p>
                <p>Please note that <strong className="text-brand-dark-blue">original shipping charges are non-refundable</strong> unless the return is due to our error (wrong or defective item).</p>
                <p>For Cash on Delivery orders, refunds will be issued as store credit or via bank transfer.</p>
              </div>
            </motion.div>

            {/* FAQs */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-brand-dark-blue mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <FaqItem faq={faq} />
                  </motion.div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-24">
            {/* WhatsApp CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-brand-dark-blue rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-brand-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">Start a Return</h3>
              <p className="text-white/50 text-sm mb-5 leading-relaxed">Message us and we'll guide you through the return process step by step.</p>
              <a href="https://wa.me/918686680001" target="_blank" rel="noopener noreferrer"
                className="block w-full bg-brand-gold text-brand-dark-blue font-bold py-3 rounded-xl text-sm hover:bg-brand-gold/80 transition-all">
                Chat on WhatsApp
              </a>
              <a href="mailto:hourajewels@gmail.com"
                className="block w-full mt-3 border border-white/20 text-white/70 font-semibold py-3 rounded-xl text-sm hover:bg-white/10 transition-all">
                Email Us
              </a>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-brand-gold/20 rounded-2xl p-6 space-y-4"
            >
              <h3 className="font-bold text-brand-dark-blue text-base">Contact Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-brand-dark-blue/40 font-semibold uppercase tracking-widest">Email</p>
                  <p className="text-brand-dark-blue/80 text-sm mt-0.5">hourajewels@gmail.com</p>
                </div>
                <div>
                  <p className="text-xs text-brand-dark-blue/40 font-semibold uppercase tracking-widest">WhatsApp</p>
                  <p className="text-brand-dark-blue/80 text-sm mt-0.5">+91 86866 80001</p>
                </div>
                <div>
                  <p className="text-xs text-brand-dark-blue/40 font-semibold uppercase tracking-widest">Hours</p>
                  <p className="text-brand-dark-blue/80 text-sm mt-0.5">Mon–Sat, 9AM – 6PM IST</p>
                </div>
              </div>
            </motion.div>

            {/* Related */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="bg-brand-beige border border-brand-gold/20 rounded-2xl p-6"
            >
              <h3 className="font-bold text-brand-dark-blue text-base mb-4">Related Policies</h3>
              <a href="/shipping-policy" className="flex items-center justify-between py-3 border-b border-brand-gold/10 text-sm text-brand-dark-blue/70 hover:text-brand-gold transition-colors">
                Shipping Policy <span>→</span>
              </a>
              <a href="/contact#faq-section" className="flex items-center justify-between pt-3 text-sm text-brand-dark-blue/70 hover:text-brand-gold transition-colors">
                All FAQs <span>→</span>
              </a>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
