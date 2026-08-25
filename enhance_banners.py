import re

with open('src/pages/ContactPage.jsx', 'r') as f:
    content = f.read()

pattern = re.compile(r'\{\/\* Quick Contact Banners \*\/}.*?\{\/\* FAQ Section \*\/}', re.DOTALL)

replacement = """{/* Quick Contact Banners */}
      <div className="px-4 md:px-24 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* WhatsApp Premium Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-[32px] p-8 md:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl transition-all duration-500"
          >
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#08183A] to-[#0a2558] z-0"></div>
            <div className="absolute -right-20 -top-20 w-72 h-72 bg-brand-gold/20 rounded-full blur-3xl z-0 group-hover:bg-brand-gold/30 transition-all duration-700"></div>
            <div className="absolute -left-20 -bottom-20 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl z-0 group-hover:scale-110 transition-all duration-700"></div>
            
            <div className="relative z-10 flex items-center gap-5 w-full sm:w-auto justify-center sm:justify-start text-center sm:text-left">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-[#25D366] drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-brand-gold text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Fastest Response</span>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">WhatsApp</h3>
                <p className="text-white/60 text-sm hidden sm:block font-medium">Instant replies & recommendations</p>
              </div>
            </div>
            
            <a
              href="https://wa.me/19404656563"
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 shrink-0 w-full sm:w-auto text-center bg-[#25D366] text-white font-bold py-4 px-8 rounded-2xl shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] transition-all duration-300 text-sm md:text-base flex items-center justify-center gap-2 group-hover:bg-[#1db354]"
            >
              Message Us
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
          </motion.div>

          {/* Instagram Premium Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-[32px] p-8 md:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl transition-all duration-500"
          >
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] z-0 opacity-95"></div>
            <div className="absolute -right-20 -top-20 w-72 h-72 bg-white/20 rounded-full blur-3xl z-0 group-hover:bg-white/30 transition-all duration-700"></div>
            <div className="absolute -left-20 -bottom-20 w-56 h-56 bg-[#fcb045]/40 rounded-full blur-3xl z-0 group-hover:scale-110 transition-all duration-700"></div>
            
            <div className="relative z-10 flex items-center gap-5 w-full sm:w-auto justify-center sm:justify-start text-center sm:text-left">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-white/80 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 opacity-90">Social Media</span>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">Instagram</h3>
                <p className="text-white/90 text-sm hidden sm:block font-medium">Follow & DM us directly</p>
              </div>
            </div>
            
            <a
              href="https://ig.me/m/hourajewels"
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 shrink-0 w-full sm:w-auto text-center bg-white text-[#E1306C] font-bold py-4 px-8 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 text-sm md:text-base flex items-center justify-center gap-2 group-hover:bg-gray-50"
            >
              Send DM
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
          </motion.div>
          
        </div>
      </div>

      {/* FAQ Section */}"""

content = pattern.sub(replacement, content)

with open('src/pages/ContactPage.jsx', 'w') as f:
    f.write(content)

print('Successfully enhanced banners.')
