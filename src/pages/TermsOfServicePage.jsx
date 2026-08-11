import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function TermsOfServicePage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans text-gray-800">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#08183A] mb-4">Terms & Conditions</h1>
        <p className="text-gray-500 mb-1">Effective Date: August 11, 2026</p>
        <p className="text-gray-500 mb-10">Last Updated: August 11, 2026</p>

        <div className="prose prose-sm md:prose-base prose-blue max-w-none text-gray-700 space-y-6">
          <p>Welcome to Houra Jewels.</p>
          <p>These Terms & Conditions (“Terms,” “Terms & Conditions”) govern your access to and use of the Houra Jewels website, including browsing the website, creating an account, placing orders, purchasing products, and using other services provided through our website.</p>
          <p>By accessing or using the website, creating an account, or placing an order, you agree to be bound by these Terms & Conditions and our Privacy Policy.</p>
          <p>If you do not agree with these Terms, please do not use our website or place an order.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">1. About Houra Jewels</h2>
          <p>Houra Jewels (“Houra Jewels,” “we,” “us,” or “our”) operates an online jewelry business offering fashion jewelry and related products.</p>
          <p>These Terms apply to all purchases and transactions made through our website unless otherwise stated.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">2. Eligibility</h2>
          <p>Our website is intended for individuals 13 years of age or older.</p>
          <p>By creating an account or placing an order, you confirm that you are at least 13 years old and have the legal capacity to enter into these Terms.</p>
          <p>If you are under 13 years of age, you may not create an account or knowingly provide personal information through our website.</p>
          <p>If you are between 13 and 17 years old, you should use the website with the involvement and guidance of a parent or legal guardian where appropriate.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">3. Account Registration</h2>
          <p>Certain features of our website may require you to create an account. When creating an account, you agree to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide accurate and current information</li>
            <li>Maintain the accuracy of your information</li>
            <li>Keep your account credentials confidential</li>
            <li>Not share your password with others</li>
            <li>Notify us if you believe your account has been accessed without authorization</li>
            <li>Be responsible for activity occurring through your account</li>
          </ul>
          <p>We reserve the right to suspend or terminate accounts that contain inaccurate information, violate these Terms, or are involved in fraudulent, abusive, or unauthorized activity.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">4. Product Information</h2>
          <p>We make reasonable efforts to display product descriptions, photographs, colors, sizes, materials, and other product information as accurately as possible. However:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Colors may appear different depending on your device or screen settings.</li>
            <li>Product photographs may not perfectly represent the actual color, finish, size, or appearance.</li>
            <li>Minor variations may occur between individual products.</li>
            <li>Product dimensions and specifications may be subject to reasonable manufacturing variations.</li>
          </ul>
          <p>We do not guarantee that product images displayed on your device will exactly match the physical product.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">5. Product Availability</h2>
          <p>All products are subject to availability. We reserve the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Limit quantities</li>
            <li>Discontinue products</li>
            <li>Modify product designs or specifications</li>
            <li>Correct product information</li>
            <li>Cancel orders when necessary</li>
          </ul>
          <p>If a product becomes unavailable after you place an order, we may cancel the affected portion of the order and issue an applicable refund to the original payment method.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">6. Pricing and Taxes</h2>
          <p>Prices displayed on the website are subject to change without notice. We make reasonable efforts to ensure that product prices are accurate. However, errors may occasionally occur.</p>
          <p>If we discover an obvious pricing or listing error, we reserve the right to correct the error and, where appropriate, cancel an affected order.</p>
          <p>Applicable sales tax and any other required charges may be applied to your order in accordance with Houra Jewels location or the shipping destination and applicable law.</p>
          <p>The final amount payable will be displayed during checkout before you complete your purchase.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">7. Orders</h2>
          <p>Placing an order through our website constitutes an offer to purchase the selected products. After placing an order, you may receive an order confirmation email. An order confirmation does not necessarily mean that Houra Jewels has accepted the order.</p>
          <p>We reserve the right to accept, reject, limit, or cancel an order for reasons including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Product availability</li>
            <li>Pricing or listing errors</li>
            <li>Suspected fraud</li>
            <li>Unauthorized transactions</li>
            <li>Incorrect customer information</li>
            <li>Shipping limitations</li>
            <li>Duplicate orders</li>
            <li>Violation of these Terms</li>
            <li>Other legitimate business reasons</li>
          </ul>
          <p>If we cancel an order after payment has been processed, we will issue an applicable refund to the original payment method.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">8. Payment</h2>
          <p>We accept payment methods displayed during checkout. Payment may be processed through third-party payment processors.</p>
          <p>By submitting payment information, you represent that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You are authorized to use the payment method.</li>
            <li>The information provided is accurate.</li>
            <li>The transaction is authorized by you.</li>
            <li>You will not use another person's payment method without authorization.</li>
          </ul>
          <p>Your payment information may be processed directly by our third-party payment provider. Houra Jewels does not intend to store complete credit card numbers or card security codes on its own servers.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">9. Credit Card and Payment Disputes</h2>
          <p>When you place an order through Houra Jewels, you authorize the applicable payment provider to charge the payment method you selected for the total amount of your purchase.</p>
          <p>If you believe there is an issue with a transaction, please contact Houra Jewels first so that we can investigate and attempt to resolve the issue. Examples include duplicate charges, incorrect charges, payment processing errors, products not received, damaged products, etc.</p>
          <p>You agree not to intentionally initiate a false, fraudulent, or unauthorized payment dispute, chargeback, or claim. If you initiate a payment dispute or chargeback for a transaction that you authorized and received in accordance with these Terms, we reserve the right to provide the applicable transaction, order, shipping, delivery, communication, and other records to the applicable dispute-resolution authority.</p>
          <p>Nothing in these Terms is intended to restrict or eliminate any rights you may have under applicable law or the rules of your payment provider or card network. If a legitimate billing or transaction error occurs, please contact us promptly so we can review and resolve the issue.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">10. All Sales Are Final</h2>
          <p><strong>ALL SALES ARE FINAL.</strong></p>
          <p>Due to the nature of our products, Houra Jewels does not accept returns or exchanges for change of mind, incorrect selection, incorrect size, personal preference, or other reasons not specifically covered by our policies.</p>
          <p>Please carefully review your product selection, quantity, size, color, style, shipping information, and other order details before completing your purchase. By placing an order, you acknowledge and agree to our no-return and no-exchange policy.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">11. Shipping</h2>
          <p>Estimated delivery dates are estimates and are not guaranteed unless expressly stated otherwise. Shipping delays may occur due to circumstances outside our control, including carrier delays, weather, holidays, address issues, customs, transportation disruptions, or other unforeseen circumstances. Once an order has been handed over to the shipping carrier, carrier-related delays may be outside Houra Jewels' control.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">12. Incorrect or Incomplete Shipping Information</h2>
          <p>Customers are responsible for providing accurate shipping information during checkout. Please carefully verify Name, Street address, Apartment/unit number, City, State, ZIP code, and Phone number.</p>
          <p>Houra Jewels is not responsible for delays, failed deliveries, returned packages, or additional shipping costs resulting from incorrect or incomplete information provided by the customer. If an order is returned to us because of an incorrect or incomplete address, additional shipping charges may apply if reshipment is available.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">13. Damaged, Missing, or Incorrect Products</h2>
          <p>If you receive a product that is damaged, incorrect, or missing from your order, please contact us. You may be required to provide photographs, videos, packaging information, order information, or other documentation so that we can investigate the issue.</p>
          <p>To protect customers and prevent fraudulent claims, we may require that the package and its contents be documented promptly after delivery.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">14. No Cancellation Policy</h2>
          <p>Because orders may be processed shortly after purchase, cancellation requests may not always be possible. Once an order has entered processing, been packed, or been shipped, cancellation may not be available.</p>
          <p>If you need to request cancellation, contact us as soon as possible after placing your order. A cancellation request is not guaranteed to be accepted. If an order cannot be canceled, the applicable All Sales Are Final policy will apply.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">15. Refunds</h2>
          <p>Except where otherwise required by applicable law, purchases from Houra Jewels are final and are not eligible for refunds due to change of mind, incorrect selection, personal preference, or ordering the wrong product.</p>
          <p>If a refund is approved under applicable law, the refund will generally be issued to the original payment method. Processing times may vary depending on the payment provider.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">16. Promotions, Discounts, and Offers</h2>
          <p>From time to time, Houra Jewels may offer promotions, discounts, coupons, free products, or other special offers. Each promotion may have its own terms. Promotions may not be combined unless expressly stated. Houra Jewels reserves the right to modify, suspend, or terminate a promotion where permitted by applicable law.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">17. Gift Cards and Promotional Credits</h2>
          <p>If Houra Jewels offers gift cards, store credits, promotional credits, or similar products, additional terms may apply. Any applicable expiration dates, redemption restrictions, refund rules, or other conditions will be disclosed at the time the gift card or credit is issued.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">18. Intellectual Property</h2>
          <p>All content on the Houra Jewels website is owned by or licensed to Houra Jewels and may be protected by applicable intellectual property laws. You may not copy, reproduce, modify, distribute, publish, sell, create derivative works from, or commercially exploit our website content without our prior written permission.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">19. Customer Reviews and Submitted Content</h2>
          <p>By submitting content (reviews, photographs, testimonials), you grant Houra Jewels a non-exclusive, worldwide, royalty-free license to use, reproduce, display, publish, modify, and distribute the content for legitimate business, marketing, promotional, or operational purposes, subject to applicable law.</p>
          
          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">20. Prohibited Activities</h2>
          <p>You agree not to use the website for unlawful purposes, attempt to gain unauthorized access, interfere with website functionality, impersonate another person, commit payment fraud, or use the website in a way that violates applicable law. We reserve the right to suspend or terminate access for violations of these Terms.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">21. Website Availability</h2>
          <p>We attempt to keep the website available and functioning properly. However, we do not guarantee that the website will always be available, error-free, secure, or free from interruptions. The website may occasionally be unavailable due to circumstances outside our control.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">22. Third-Party Services</h2>
          <p>Our website may rely on third-party services. Third-party services may have their own terms and privacy policies. Houra Jewels is not responsible for the independent policies, practices, availability, or performance of third-party services.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">23. Privacy</h2>
          <p>Your use of the Houra Jewels website is also governed by our Privacy Policy. The Privacy Policy explains how we collect, use, disclose, retain, and protect personal information.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">24. Disclaimer of Warranties</h2>
          <p>To the maximum extent permitted by applicable law, the Houra Jewels website and its content are provided on an “as is” and “as available” basis. Houra Jewels disclaims warranties that are not expressly provided in these Terms.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">25. Limitation of Liability</h2>
          <p>To the maximum extent permitted by applicable law, Houra Jewels will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages arising from or related to your use of the website or purchase of products. Our total liability will not exceed the amount you actually paid to Houra Jewels.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">26. Indemnification</h2>
          <p>To the maximum extent permitted by applicable law, you agree to indemnify and hold harmless Houra Jewels from claims, damages, losses, liabilities, and reasonable expenses arising from your violation of these Terms, misuse of our website, violation of applicable law, or fraudulent activities.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">27. Governing Law</h2>
          <p>These Terms will be governed by applicable laws of the State of Texas, without regard to conflict-of-law principles, except where applicable law requires otherwise.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">28. Dispute Resolution</h2>
          <p>Before initiating formal legal proceedings regarding a dispute, we encourage you to contact Houra Jewels and give us an opportunity to investigate and attempt to resolve the issue.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">29. Changes to These Terms</h2>
          <p>We may update these Terms from time to time. When we update these Terms, we will update the “Last Updated” date. Your continued use of the website after updated Terms become effective constitutes acceptance of the updated Terms.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">30. Severability</h2>
          <p>If any provision of these Terms is determined to be invalid, unlawful, or unenforceable, the remaining provisions will continue to apply to the extent permitted by applicable law.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">31. Entire Agreement</h2>
          <p>These Terms, together with our Privacy Policy and other policies expressly incorporated into these Terms, constitute the agreement between you and Houra Jewels concerning your use of the website and purchases made through the website.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">32. Contact Us</h2>
          <p>If you have questions regarding these Terms, an order, payment, or another issue, please contact us:</p>
          <ul className="list-none pl-0 space-y-2 font-medium">
            <li><strong>Houra Jewels</strong></li>
            <li>Email: <a href="mailto:support@hourajewels.com" className="text-brand-gold underline">support@hourajewels.com</a></li>
            <li>Website: <a href="https://hourajewels.com" target="_blank" rel="noopener noreferrer" className="text-brand-gold underline">https://hourajewels.com</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
