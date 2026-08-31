const fs = require('fs');

const myOrdersPath = 'src/pages/MyOrdersPage.jsx';
let content = fs.readFileSync(myOrdersPath, 'utf8');

const startTag = "orders.map((order) => {";
const endTag = "          })\n        )}";
const startIdx = content.indexOf(startTag);
const endIdx = content.indexOf(endTag);

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find start or end bounds.");
    process.exit(1);
}

// Get the body of the map function
const mapBody = content.substring(startIdx + startTag.length, endIdx);

// The map body is: 
// const STATUS_STEPS = ...
// const stepIdx = ...
// return ( <div key={order.id} ...> ... </div> );

const orderCardContent = `import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Store, Truck, MessageCircle, MapPin, Tag, CreditCard, ExternalLink, FileText, RefreshCw } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped: 'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  'ready for pickup': 'bg-orange-100 text-orange-700 border-orange-200',
  'pickup completed': 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const SHIPPING_STEPS = ['pending', 'processing', 'shipped', 'delivered'];
const PICKUP_STEPS = ['pending', 'processing', 'ready for pickup', 'pickup completed'];

export function OrderCard({ order, openInvoice, handleReorder, hideActions }) {
${mapBody}
}
`;

// In OrderCard.jsx, we need to conditionally render the footer actions based on hideActions prop.
const modifiedOrderCardContent = orderCardContent.replace(
  '{/* Footer Actions */}',
  '{!hideActions && (\\n                {/* Footer Actions */}'
).replace(
  '</button>\n                </div>\n              </div>\n            );',
  '</button>\n                </div>\\n              )}\n              </div>\n            );'
);


fs.writeFileSync('src/components/OrderCard.jsx', modifiedOrderCardContent);

// Update MyOrdersPage.jsx
const replacement = `orders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              openInvoice={openInvoice} 
              handleReorder={handleReorder} 
            />
          ))
        )}`;

const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx + endTag.length);

// Add import
const importStatement = "import { OrderCard } from '../components/OrderCard';\n";
const lastImportIdx = newContent.lastIndexOf("import ");
const nextLineIdx = newContent.indexOf("\n", lastImportIdx) + 1;
const finalContent = newContent.substring(0, nextLineIdx) + importStatement + newContent.substring(nextLineIdx);

fs.writeFileSync(myOrdersPath, finalContent);
console.log('Extraction complete.');
