import re

# Update Header.jsx
with open('src/components/Header.jsx', 'r') as f:
    header_content = f.read()

# Desktop search logic
old_desktop = """  const results = trimmed
    ? products.filter(p =>
        p.name?.toLowerCase().includes(trimmed) ||
        p.category?.toLowerCase().includes(trimmed) ||
        (p.variants && p.variants.some(v => v.sizes?.some(s => s.code?.toLowerCase().includes(trimmed))))
      ).slice(0, 6)
    : [];"""

new_desktop = """  const results = trimmed
    ? products.filter(p =>
        p.name?.toLowerCase().includes(trimmed) ||
        p.category?.toLowerCase().includes(trimmed) ||
        String(p.code || '').toLowerCase().includes(trimmed) ||
        (p.variants && p.variants.some(v => 
          String(v.code || '').toLowerCase().includes(trimmed) || 
          (v.sizes && v.sizes.some(s => String(s.code || '').toLowerCase().includes(trimmed)))
        ))
      ).slice(0, 6)
    : [];"""

header_content = header_content.replace(old_desktop, new_desktop)

# Mobile search logic
old_mobile = """  const mobileSearchResults = mobileSearchTrimmed
    ? products.filter(p =>
        p.name?.toLowerCase().includes(mobileSearchTrimmed) ||
        p.category?.toLowerCase().includes(mobileSearchTrimmed)
      ).slice(0, 6)
    : [];"""

new_mobile = """  const mobileSearchResults = mobileSearchTrimmed
    ? products.filter(p =>
        p.name?.toLowerCase().includes(mobileSearchTrimmed) ||
        p.category?.toLowerCase().includes(mobileSearchTrimmed) ||
        String(p.code || '').toLowerCase().includes(mobileSearchTrimmed) ||
        (p.variants && p.variants.some(v => 
          String(v.code || '').toLowerCase().includes(mobileSearchTrimmed) || 
          (v.sizes && v.sizes.some(s => String(s.code || '').toLowerCase().includes(mobileSearchTrimmed)))
        ))
      ).slice(0, 6)
    : [];"""

header_content = header_content.replace(old_mobile, new_mobile)

with open('src/components/Header.jsx', 'w') as f:
    f.write(header_content)

# Update SearchPage.jsx
with open('src/pages/SearchPage.jsx', 'r') as f:
    search_content = f.read()

old_search = """        const codeMatch = p.variants && p.variants.some(v => v.sizes?.some(s => s.code?.toLowerCase().includes(trimmed)));"""
new_search = """        const codeMatch = String(p.code || '').toLowerCase().includes(trimmed) || (p.variants && p.variants.some(v => String(v.code || '').toLowerCase().includes(trimmed) || (v.sizes && v.sizes.some(s => String(s.code || '').toLowerCase().includes(trimmed)))));"""

search_content = search_content.replace(old_search, new_search)

with open('src/pages/SearchPage.jsx', 'w') as f:
    f.write(search_content)

print("Search logic updated successfully.")
