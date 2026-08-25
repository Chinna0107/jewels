import re
import glob

files_to_check = [
    'src/pages/CartPage.jsx',
    'src/pages/CheckoutPage.jsx',
    'src/pages/PickupPage.jsx',
]

for fpath in files_to_check:
    with open(fpath, 'r') as f:
        content = f.read()
    
    # Replace Price Details
    content = content.replace('>Price Details</h3>', '>Price Details (USD)</h3>')
    
    # Replace Order Summary
    content = content.replace('>Order Summary</span>', '>Order Summary (USD)</span>')
    content = content.replace('>Order Summary</h3>', '>Order Summary (USD)</h3>')

    with open(fpath, 'w') as f:
        f.write(content)

print("Updated USD labels successfully.")
