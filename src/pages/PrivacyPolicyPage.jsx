import React from 'react';
import { Header } from '../components/Header';

export function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans text-gray-800">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#08183A] mb-4">Privacy Policy</h1>
        <p className="text-gray-500 mb-1">Effective Date: August 11, 2026</p>
        <p className="text-gray-500 mb-10">Last Updated: August 11, 2026</p>

        <div className="prose prose-sm md:prose-base prose-blue max-w-none text-gray-700 space-y-6">
          <p>
            Houra Jewels (“Houra Jewels,” “we,” “us,” or “our”) respects your privacy and is committed to protecting the personal information you provide when you visit or use our website, create an account, place an order, contact us, or otherwise interact with our products and services.
          </p>
          <p>
            This Privacy Policy explains what personal information we collect, how we collect and use it, when we share it, how we protect it, how long we retain it, and the choices and rights that may be available to you.
          </p>
          <p>
            Our website is intended for individuals 13 years of age or older. We do not knowingly permit individuals under 13 to create accounts or purchase products directly through our website.
          </p>
          <p>
            By using our website, you acknowledge this Privacy Policy. Where applicable law requires consent for a particular use of personal information, we will obtain the required consent.
          </p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">1. Who We Are</h2>
          <p>
            Houra Jewels is a U.S.-based jewelry business that sells fashion jewelry through its online store and other sales channels.
          </p>
          <p>
            For privacy-related questions or requests, please contact us using the information provided in the Contact Us section of this Privacy Policy.
          </p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">2. Age Requirement</h2>
          <p>Our website is intended for users who are 13 years of age or older.</p>
          <p>
            You must be at least 13 years old to create an Houra Jewels customer account or knowingly provide personal information to us through account registration.
          </p>
          <p>
            If you are under 13, please do not create an account, place an order, or provide personal information through our website.
          </p>
          <p>
            If we learn that we have collected personal information from an individual under 13 without the legally required parental consent, we will take reasonable steps to delete that information in accordance with applicable law.
          </p>
          <p>
            If you believe that an individual under 13 has provided personal information to us, please contact us using the information provided below.
          </p>
          
          <h3 className="text-lg font-bold text-[#08183A] mt-6 mb-2">Teen Users</h3>
          <p>
            Individuals between 13 and 17 years of age may use the website subject to our Terms & Conditions and applicable law.
          </p>
          <p>
            We encourage parents and guardians to discuss online privacy and safe shopping practices with teenagers.
          </p>
          <p>
            We do not knowingly request information from teenagers that is unnecessary for operating their account, processing an order, providing customer support, or performing another disclosed business purpose.
          </p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">3. Personal Information We Collect</h2>
          <p>Depending on how you interact with Houra Jewels, we may collect the following categories of personal information.</p>

          <h3 className="text-lg font-bold text-[#08183A] mt-6 mb-2">A. Account Information</h3>
          <p>When you create an Houra Jewels account, we may collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>First and last name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Password or authentication information</li>
            <li>Account preferences</li>
            <li>Communication preferences</li>
            <li>Other information you voluntarily provide</li>
          </ul>
          <p>
            Your password should be kept confidential. We recommend that you do not reuse your Houra Jewels password on other websites.
          </p>

          <h3 className="text-lg font-bold text-[#08183A] mt-6 mb-2">B. Shipping and Billing Information</h3>
          <p>When you place an order, we may collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Customer name</li>
            <li>Shipping address</li>
            <li>Billing address</li>
            <li>Recipient name</li>
            <li>Phone number</li>
            <li>Delivery instructions</li>
            <li>Other information necessary to fulfill and deliver your order</li>
          </ul>

          <h3 className="text-lg font-bold text-[#08183A] mt-6 mb-2">C. Order and Purchase Information</h3>
          <p>We may collect information associated with your purchases, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Order number</li>
            <li>Products purchased</li>
            <li>Product quantities</li>
            <li>Purchase date</li>
            <li>Order value</li>
            <li>Discounts or promotional codes used</li>
            <li>Shipping information</li>
            <li>Delivery status</li>
            <li>Returns, Exchanges, Refunds</li>
            <li>Order-related communications</li>
            <li>Customer order history</li>
          </ul>
          <p>Your order history may be associated with your customer account.</p>

          <h3 className="text-lg font-bold text-[#08183A] mt-6 mb-2">D. Payment Information</h3>
          <p>
            Payments may be processed through third-party payment processors. Depending on the payment method you select, the payment processor may collect payment information such as credit or debit card information.
          </p>
          <p>
            Houra Jewels does not intend to store complete payment card numbers or card security codes on its own servers. Payment information may instead be processed directly by our third-party payment providers according to their security practices and privacy policies.
          </p>
          <p>
            We may receive limited payment-related information, such as payment status, transaction identifiers, card type, or the last four digits of a payment card, where provided by our payment processor.
          </p>

          <h3 className="text-lg font-bold text-[#08183A] mt-6 mb-2">E. Customer Communications</h3>
          <p>When you contact us, we may collect information contained in your communication, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Emails</li>
            <li>Customer service messages</li>
            <li>Product inquiries</li>
            <li>Order-related questions</li>
            <li>Return or refund requests</li>
            <li>Other information you voluntarily provide</li>
          </ul>

          <h3 className="text-lg font-bold text-[#08183A] mt-6 mb-2">F. Website and Device Information</h3>
          <p>When you visit our website, certain information may be collected automatically, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>IP address</li>
            <li>Browser type and Device type</li>
            <li>Operating system</li>
            <li>Approximate location based on IP address</li>
            <li>Pages visited</li>
            <li>Links or buttons interacted with</li>
            <li>Date and time of website visits</li>
            <li>Referring website</li>
            <li>Website activity and usage information</li>
            <li>Cookies and similar technology identifiers</li>
          </ul>
          <p>We use this information to operate, secure, analyze, and improve our website.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">4. How We Collect Personal Information</h2>
          <p>We may collect personal information:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Directly from you when you create an account</li>
            <li>When you place an order or update your account</li>
            <li>When you contact customer support</li>
            <li>When you subscribe to marketing communications</li>
            <li>When you participate in promotions or events</li>
            <li>Automatically when you browse or interact with our website</li>
            <li>Through cookies and similar technologies</li>
            <li>From service providers that assist us with website operations, payments, shipping, analytics, security, marketing, and other business functions</li>
          </ul>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">5. How We Use Personal Information</h2>
          <p>We may use personal information for the following purposes.</p>
          
          <h3 className="text-lg font-bold text-[#08183A] mt-6 mb-2">Providing and Managing Our Services</h3>
          <p>We may use your information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Create and manage your customer account</li>
            <li>Process orders and payments</li>
            <li>Fulfill and ship purchases</li>
            <li>Provide delivery updates and maintain order history</li>
            <li>Process returns, exchanges, and refunds</li>
            <li>Provide customer support, respond to questions and requests</li>
          </ul>

          <h3 className="text-lg font-bold text-[#08183A] mt-6 mb-2">Website Operations</h3>
          <p>We may use information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Operate our website and maintain functionality</li>
            <li>Remember account and shopping preferences</li>
            <li>Improve website performance and troubleshoot technical issues</li>
            <li>Understand how customers use our website</li>
            <li>Personalize certain aspects of the shopping experience</li>
            <li>Maintain website security</li>
          </ul>

          <h3 className="text-lg font-bold text-[#08183A] mt-6 mb-2">Fraud and Security</h3>
          <p>We may use information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Detect and prevent fraudulent transactions</li>
            <li>Protect customer accounts and detect unauthorized activity</li>
            <li>Protect our website and systems</li>
            <li>Investigate security incidents and prevent abuse</li>
          </ul>

          <h3 className="text-lg font-bold text-[#08183A] mt-6 mb-2">Communications</h3>
          <p>We may use your information to send account-related messages, order confirmations, order status updates, shipping notifications, delivery notifications, return or refund communications, customer service responses, and other transactional communications.</p>
          <p>Some transactional communications may be necessary to provide the services you requested and may not be treated as marketing communications.</p>

          <h3 className="text-lg font-bold text-[#08183A] mt-6 mb-2">Marketing</h3>
          <p>Where permitted by applicable law, we may use your information to send marketing communications regarding new products, collections, special offers, promotions, sales, events, and Houra Jewels updates.</p>
          <p>Where consent is required, we will obtain the appropriate consent. You can unsubscribe from marketing emails at any time by using the unsubscribe mechanism included in the communication or by contacting us.</p>
          <p>Unsubscribing from marketing communications will not prevent us from sending necessary transactional or service-related communications.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">6. Marketing Consent</h2>
          <p>Marketing communications are separate from your ability to create an account or place an order. Where applicable, we may provide a separate optional marketing checkbox during account registration, checkout, or another interaction.</p>
          <p>Marketing consent is not required to purchase products from Houra Jewels. You may withdraw marketing consent at any time.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">7. Cookies and Similar Technologies</h2>
          <p>We may use cookies, pixels, tags, scripts, local storage, and similar technologies. These technologies may help us keep you signed in, maintain your shopping cart, remember preferences, understand website usage, improve website functionality, maintain website security, measure website performance, understand marketing campaign performance, and provide or measure advertising, where applicable.</p>
          <p>Some cookies may be necessary for the website to function. Other cookies may be used for analytics, personalization, advertising, or other purposes depending on the tools implemented on our website.</p>
          <p>You may be able to control certain cookies through your browser or device settings. Where required by applicable law, we will provide additional cookie choices or consent mechanisms.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">8. How We Share Personal Information</h2>
          <p>We do not sell personal information as a source of revenue. We may, however, disclose or make personal information available to third parties when reasonably necessary to operate our business, provide our services, or fulfill the purposes described in this Privacy Policy.</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Payment Providers:</strong> Processors may process payment information to authorize and complete transactions.</li>
            <li><strong>Shipping and Delivery Providers:</strong> We may provide shipping companies with information necessary to fulfill and deliver your order.</li>
            <li><strong>Website and Technology Providers:</strong> We may use third-party providers for hosting, e-commerce services, cloud infrastructure, database services, security, fraud prevention, customer support, email delivery, analytics, and website performance.</li>
            <li><strong>Marketing and Advertising Providers:</strong> We may use third-party services for email marketing, campaign management, advertising, conversion measurement, analytics, and retargeting.</li>
            <li><strong>Professional and Business Service Providers:</strong> We may share information with accountants, attorneys, consultants, auditors, and insurers.</li>
          </ul>
          <p>We may also disclose personal information for legal and safety purposes, or in connection with business transactions like mergers or acquisitions.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">9. Third-Party Service Providers</h2>
          <p>Third-party companies that provide services to Houra Jewels may process personal information on our behalf or independently according to their own privacy practices. We encourage you to review the privacy policies of third-party services you interact with.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">10. Order History and Customer Accounts</h2>
          <p>If you create an Houra Jewels account, we may maintain information associated with your account. This allows you to view your order history and helps us provide customer service and manage transactions. You may request deletion of your account or certain personal information, subject to applicable legal and business recordkeeping requirements.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">11. Data Security</h2>
          <p>We use reasonable administrative, technical, and organizational safeguards designed to protect personal information against unauthorized access, use, disclosure, alteration, or destruction. However, no website, internet transmission, electronic storage system, or security measure can be guaranteed to be completely secure.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">12. Data Retention</h2>
          <p>We retain personal information only for as long as reasonably necessary for the purposes described in this Privacy Policy. Different categories of information may be retained for different periods. When information is no longer reasonably necessary, we may delete, anonymize, or securely dispose of it, subject to applicable legal and business requirements.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">13. Children's and Teen Privacy</h2>
          <p>Houra Jewels is a 13+ general-audience website and is not directed toward children under 13. We do not knowingly collect personal information from children under 13 through account registration. If we learn that we have collected personal information from a child under 13 in circumstances where parental consent was legally required, we will take reasonable steps to delete the information.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">14. Your Privacy Rights</h2>
          <p>Depending on where you live and which privacy laws apply to you, you may have certain rights concerning your personal information, such as the right to know what we collect, access it, request correction or deletion, or opt out of certain processing activities.</p>
          <p>The availability and scope of these rights depend on applicable law. Certain exceptions may apply, for example, we may be required to retain certain information to complete a transaction or comply with legal obligations.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">15. How to Submit a Privacy Request</h2>
          <p>If you would like to exercise an applicable privacy right, please contact us using the information provided in the “Contact Us” section. For security purposes, we may need to verify your identity before completing certain requests.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">18. International Visitors</h2>
          <p>Houra Jewels is based in the United States. If you access our website from outside the United States, your personal information may be processed or stored in the United States or other countries where our service providers operate. By using our website, you understand that your information may be transferred to and processed in the United States.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">19. Third-Party Websites and Social Media</h2>
          <p>Our website may contain links to third-party websites, applications, social media platforms, payment services, shipping services, or other third-party services. Houra Jewels does not control the privacy practices of third-party websites or services.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">20. Social Media Interactions</h2>
          <p>If you interact with Houra Jewels through social media platforms, those platforms may collect information about you according to their own privacy policies.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">21. Promotional Events and Customer Content</h2>
          <p>From time to time, Houra Jewels may conduct promotions, giveaways, events, or customer-content campaigns. If you voluntarily submit information, photographs, reviews, testimonials, or other content, we may use that information according to the terms disclosed when you submit it and applicable law.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">22. Account Deletion</h2>
          <p>You may request that your Houra Jewels account be deleted by contacting us. When an account deletion request is received, we may delete or deactivate information associated with the account, subject to applicable law and legitimate business requirements.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">23. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. When we update this Privacy Policy, we will update the “Last Updated” date at the top. We encourage you to periodically review this Privacy Policy.</p>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">24. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, want to exercise an applicable privacy right, or believe that personal information has been collected from a child under 13, please contact us:</p>
          <ul className="list-none pl-0 space-y-2 font-medium">
            <li><strong>Houra Jewels</strong></li>
            <li>Privacy Email: <a href="mailto:privacy@hourajewels.com" className="text-brand-gold underline">privacy@hourajewels.com</a></li>
            <li>Website: <a href="https://hourajewels.com" target="_blank" rel="noopener noreferrer" className="text-brand-gold underline">https://hourajewels.com</a></li>
          </ul>

          <h2 className="text-xl md:text-2xl font-bold text-[#08183A] mt-10 mb-4">25. Your Acknowledgment</h2>
          <p>By using the Houra Jewels website, you acknowledge that you have had an opportunity to review this Privacy Policy. Where a separate consent is legally required for a particular processing activity, Houra Jewels will obtain that consent separately.</p>
          <p>This Privacy Policy does not replace the Houra Jewels Terms & Conditions.</p>
        </div>
      </div>
    </div>
  );
}
