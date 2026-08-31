const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminCustomersPage.jsx', 'utf8');

// Imports
content = content.replace(
  'import { Users, Mail, Phone, Calendar, Search, Trash2, CheckCircle, XCircle } from "lucide-react";',
  'import { Users, Mail, Phone, Calendar, Search, Trash2, CheckCircle, XCircle, FileText, X } from "lucide-react";\nimport { OrderCard } from "../../components/OrderCard";'
);

// State
content = content.replace(
  'const [clearing, setClearing] = useState(null);',
  `const [clearing, setClearing] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);`
);

// Fetch orders function
const fetchOrdersFunction = `
  const handleViewOrders = async (customer) => {
    setSelectedCustomer(customer);
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(\`\${BACKEND_URL}/admin/users/\${customer.id}/orders\`, {
        headers: { Authorization: \`Bearer \${token}\` },
      });
      const data = await res.json();
      if (res.ok) {
        setCustomerOrders(data.orders || []);
      } else {
        alert(data.error || "Failed to fetch orders");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingOrders(false);
    }
  };
`;
content = content.replace('const handleClearUser = async', fetchOrdersFunction + '\n  const handleClearUser = async');

// Table Headers
content = content.replace(
  '<th className="text-left py-4 px-4 font-semibold">Joined / Type</th>',
  '<th className="text-left py-4 px-4 font-semibold">Joined</th>\n                <th className="text-left py-4 px-4 font-semibold">Signup Type</th>'
);

// Table Data - Country
content = content.replace(
  '{customer.country || "—"}',
  '{customer.country || (customer.addresses && customer.addresses.length > 0 ? customer.addresses[0].country : "—")}'
);

// Table Data - Joined & Type
content = content.replace(
  /<td className="py-4 px-4">\s*<div className="flex flex-col gap-1\.5">\s*<div className="flex items-center gap-1\.5 text-xs text-\[#08183A\]\/60">\s*<Calendar className="w-3\.5 h-3\.5" \/>\s*\{new Date\(customer\.created_at\)\.toLocaleDateString\("en-IN"\)\}\s*<\/div>\s*<div>\s*<span className=\{`inline-flex items-center gap-1 text-\[9px\] font-bold px-1\.5 py-0\.5 rounded uppercase tracking-wider \$\{\s*\(customer\.is_verified && !customer\.email_verified && !customer\.phone_verified\) \|\| \(customer\.avatar_url && customer\.avatar_url\.includes\('google'\)\) \|\| customer\.google_id \|\| customer\.auth_provider === 'google' \|\| customer\.provider === 'google'\s*\? 'bg-red-50 text-red-600 border border-red-100'\s*: 'bg-blue-50 text-blue-600 border border-blue-100'\s*\}\`\}>\s*\{\(customer\.is_verified && !customer\.email_verified && !customer\.phone_verified\) \|\| \(customer\.avatar_url && customer\.avatar_url\.includes\('google'\)\) \|\| customer\.google_id \|\| customer\.auth_provider === 'google' \|\| customer\.provider === 'google' \? 'Google' : 'Direct'\}\s*<\/span>\s*<\/div>\s*<\/div>\s*<\/td>/,
  `<td className="py-4 px-4 text-xs text-[#08183A]/60 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(customer.created_at).toLocaleDateString("en-IN")}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={\`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider \${
                      (customer.is_verified && !customer.email_verified && !customer.phone_verified) || (customer.avatar_url && customer.avatar_url.includes('google')) || customer.google_id || customer.auth_provider === 'google' || customer.provider === 'google' 
                        ? 'bg-red-50 text-red-600 border border-red-100' 
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }\`}>
                      {(customer.is_verified && !customer.email_verified && !customer.phone_verified) || (customer.avatar_url && customer.avatar_url.includes('google')) || customer.google_id || customer.auth_provider === 'google' || customer.provider === 'google' ? 'Google' : 'Direct'}
                    </span>
                  </td>`
);

// Table Data - Actions
content = content.replace(
  '<td className="py-4 px-4 text-center sticky right-0 bg-white z-10 shadow-[-4px_0_12px_rgba(0,0,0,0.03)] group-hover:bg-[#FDF8F0]/50">',
  `<td className="py-4 px-4 sticky right-0 bg-white z-10 shadow-[-4px_0_12px_rgba(0,0,0,0.03)] group-hover:bg-[#FDF8F0]/50">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewOrders(customer)}
                        title="View Orders"
                        className="p-1.5 text-[#08183A]/60 hover:text-[#08183A] hover:bg-[#08183A]/5 rounded-lg transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                      </button>`
);
content = content.replace('</td>\n                </motion.tr>', '</div>\n                  </td>\n                </motion.tr>');

// Modal rendering
const modalUI = `
      {/* Orders Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08183A]/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between p-6 border-b border-[#08183A]/10 bg-[#FDF8F0]">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#08183A]">{selectedCustomer.name}'s Orders</h2>
                <p className="text-sm text-[#08183A]/60 mt-0.5">{selectedCustomer.email}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-[#08183A]/10 rounded-full transition-colors text-[#08183A]/60 hover:text-[#08183A]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-gray-50 flex-1 space-y-4">
              {loadingOrders ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-[#08183A]/20 border-t-[#08183A] rounded-full animate-spin" />
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="text-center py-12 text-[#08183A]/50">No orders found for this customer.</div>
              ) : (
                customerOrders.map(order => (
                  <OrderCard key={order.id} order={order} hideActions={true} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
`;
content = content.replace('</div>\n  );\n}\n', modalUI + '  );\n}\n');

fs.writeFileSync('src/pages/admin/AdminCustomersPage.jsx', content);
console.log('patched AdminCustomersPage.jsx');
