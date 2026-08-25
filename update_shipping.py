import re

with open('src/pages/ShippingPolicyPage.jsx', 'r') as f:
    content = f.read()

# 1. Update delivery timeline
delivery_point = "'Delivery timelines may vary during peak seasons or festival periods.',\n      'Once an order has been handed over to the shipping carrier, carrier-related delays may be outside Houra Jewels\\' control.',"
content = content.replace("'Delivery timelines may vary during peak seasons or festival periods.',", delivery_point)

# 2. Append new sections to the sections array
# We need to find the end of the sections array. 
# Looking at the structure, the array ends with:
#     ],
#   },
# ];

new_sections = """  {
    id: 'signature',
    icon: <ShieldCheck className="w-6 h-6 text-brand-gold" />,
    title: 'Signature Confirmation',
    badge: 'Optional',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    content: [
      'Customers may choose Signature Confirmation at checkout for an additional fee, where available. This service requires a signature upon delivery and may provide additional security for the shipment.',
      'If Signature Confirmation is not selected, the order will be shipped using the standard delivery service without a signature requirement. The carrier may leave the package at the delivery address or in another location according to its delivery procedures.',
      'Once a package is marked as successfully delivered by the carrier, Houra Jewels is not responsible for packages that are lost, stolen, or misplaced after delivery. We recommend selecting Signature Confirmation for higher-value orders or locations where packages may be left unattended.',
      'Signature requirements and delivery procedures are subject to the selected carrier’s terms and conditions.',
    ],
  },
  {
    id: 'insurance',
    icon: <ShieldCheck className="w-6 h-6 text-brand-gold" />,
    title: 'Shipping Insurance & Claims',
    badge: 'Recommended',
    badgeColor: 'bg-teal-100 text-teal-700',
    content: [
      'Additional shipping insurance may be available at checkout for an additional fee. If additional insurance is not selected, default carrier liability will apply, subject to the carrier’s terms and conditions.',
      '1. Default Carrier Liability: Most eligible shipping services include limited carrier liability coverage, generally up to $100. For a package confirmed lost or damaged, the customer is responsible for filing the claim with the carrier. Houra Jewels will assist by providing relevant order information.',
      '2. Additional Shipping Insurance: May provide broader protection for eligible shipments, including loss, damage, or theft. Protection beyond standard carrier liability is subject to the provider’s terms and exclusions.',
      'Important: All insurance claims are subject to the applicable carrier or insurance provider’s terms. Houra Jewels is not responsible for losses or damages beyond the applicable carrier liability or insurance coverage.',
    ],
  },
"""

sections_end_pattern = r'(\s*],\s*},\s*)(];)'
content = re.sub(sections_end_pattern, r'\1' + new_sections + r'\2', content)

with open('src/pages/ShippingPolicyPage.jsx', 'w') as f:
    f.write(content)

print("Shipping policy updated successfully.")
