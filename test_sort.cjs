const http = require('http');

async function test() {
  const fetchJson = (url) => new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const prodData = await fetchJson('http://localhost:5000/api/general/products');
  const offerData = await fetchJson('http://localhost:5000/api/general/offers');
  
  const products = prodData.products || [];
  const offers = offerData.offers || [];
  
  let filteredProducts = products;
  
  let flattenedProducts = filteredProducts.flatMap(product => {
    if (product.variants && product.variants.length > 1) {
      return product.variants.map((variant, idx) => ({
        ...product,
        uniqueListId: `${product.id}-${variant.code || idx}`,
        variants: [variant]
      }));
    }
    return [{ ...product, uniqueListId: product.id }];
  });

  const getProductFinalPrice = (product) => {
    const variants = product.variants || [];
    const firstVariant = variants[0] || {};
    const defaultSize = product.sizes?.[0] || firstVariant?.sizes?.[0] || { price: product.price };
    let originalPrice = Number(defaultSize.mrp) || Number(defaultSize.price) || 0;
    let displayPrice = Number(defaultSize.our_price) || originalPrice;
    let activeOffer = null;
    if (defaultSize.offer_id) {
      activeOffer = offers?.find(o => o.id == defaultSize.offer_id && o.is_active);
    } else if (product.offer_id) {
      activeOffer = offers?.find(o => o.id === product.offer_id && o.is_active);
    }
    if (activeOffer) {
      displayPrice = Math.round(originalPrice - (originalPrice * (activeOffer.discount_percentage / 100)));
    }
    return displayPrice;
  };

  for (let p of flattenedProducts) {
    const price = getProductFinalPrice(p);
    console.log(p.name, p.uniqueListId, '=> price:', price, 'originalPrice:', p.price, 'defaultSize:', p.sizes?.[0] || p.variants?.[0]?.sizes?.[0]);
  }
}
test();
