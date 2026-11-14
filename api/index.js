import fs from 'node:fs';
import path from 'node:path';

const CLOUD_STATE_FILE = path.join('/tmp', 'rangerosh-cloud-store-v1.json');
const STANDARD_SIZES = ['Small', 'Medium', 'Large', 'Extra Large'];
const OFFICIAL_LOGO_URL = '/uploads/1794056903993-429854-rang-e-rosh-logo.jpg';

const DEFAULT_SETTINGS = {
  id: 1,
  store_name: 'Rang e Rosh',
  store_tagline: 'Ladies Stitched Suits — Pret Collection',
  logo_url: OFFICIAL_LOGO_URL,
  contact_email: 'rangerosh.official@gmail.com',
  contact_phone: '+923 130 888 048',
  whatsapp_number: '+923 200 300 552',
  whatsapp_clean: '923200300552',
  shipping_charges: 250,
  free_shipping_threshold: 10000,
  low_stock_threshold: 5,
  currency: 'PKR',
  announcement_text:
    'Welcome to Rang e Rosh — Free Nationwide Delivery on Orders Above PKR 10,000 | Instant WhatsApp Order Confirmation',
  hero_badge: 'NEW PRET COLLECTION 2026',
  hero_title: 'Timeless Craftsmanship in Every Thread',
  hero_subtitle:
    'Discover the signature Rang e Rosh 2-Piece Stitched Pret Collection. Precision tailoring, rich seasonal textures, and intricate embroidery designed for effortless grace.',
  promo_banner_title: 'Artisanal Embroidery Meets Modern Silhouette',
  promo_banner_subtitle:
    'Every Rang e Rosh ensemble is crafted with high-density seam tailoring, structured necklines, and fluid trousers for everyday luxury.',
  instagram_url: 'https://www.instagram.com/rangerosh.official/',
  youtube_url: 'https://www.youtube.com/channel/UC25A1a11129r4V133c23BTw',
  tiktok_url: 'https://www.tiktok.com/@rangerosh.official',
  facebook_url: 'https://www.facebook.com/profile.php?id=61579336619426',
  payment_methods: ['Cash on Delivery (COD)', 'Bank Transfer (Confirm via WhatsApp)'],
  updated_at: new Date().toISOString(),
};

function computeStockStatus(available, threshold) {
  if (available <= 0) return 'Out of Stock';
  if (available <= threshold) return 'Low Stock';
  return 'In Stock';
}

function distributeStock(total) {
  const safe = Math.max(0, Math.floor(Number(total) || 0));
  const base = Math.floor(safe / 4);
  const rem = safe % 4;
  return {
    Small: base + (0 < rem ? 1 : 0),
    Medium: base + (1 < rem ? 1 : 0),
    Large: base + (2 < rem ? 1 : 0),
    'Extra Large': base + (3 < rem ? 1 : 0),
  };
}

function makeImages(slug, count, ext, primaryIdx = 0) {
  const imgs = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    image_url: `/assets/products/${slug}/${i + 1}.${ext}`,
    alt_text: `${slug.toUpperCase()} View ${i + 1}`,
    sort_order: i === primaryIdx ? 0 : i < primaryIdx ? i + 1 : i,
    is_primary: i === primaryIdx ? 1 : 0,
  }));
  imgs.sort((a, b) => a.sort_order - b.sort_order);
  return imgs;
}

function makeVariants(colorLabel) {
  return STANDARD_SIZES.map((s, idx) => ({
    id: idx + 1,
    size_label: s,
    color_label: colorLabel,
    sku_suffix: s === 'Extra Large' ? 'XL' : s.slice(0, 1).toUpperCase(),
    additional_price: 0,
    is_available: 1,
  }));
}

const SEED_PRODUCTS = [
  {
    id: 1,
    slug: 'anna',
    sku: 'RER-PRET-ANNA-01',
    name: 'ANNA',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 7490,
    discounted_price: null,
    effective_price: 7490,
    overview:
      'ANNA from the Rang e Rosh collection features an embroidered shirt paired with a plain-dyed trouser. The intricate light-toned embroidery adds a refined, elegant touch to the rich black textured fabric, complemented by the understated simplicity of the trouser for a beautifully balanced ensemble.',
    product_type_detail: '2-Piece Stitched Suit (Shirt + Trouser)',
    color_name: 'Classic Black with Ivory/Off-White Embroidery',
    fabric: 'Rich Black Textured Fabric',
    fit: 'Relaxed / Straight Fit',
    embroidered_details:
      'Neckline: Intricate embroidery along the rounded neckline.\nFront Panel & Hemline: Delicately embroidered vertical panel borders framing the front, leading to a richly detailed floral and vine hemline (daman).\nSleeves: Wide-cut loose sleeves finished with coordinating embroidered sleeve cuffs.\nTrouser: Plain dyed trouser with a subtle tulip-style/relaxed cut.',
    suit_stitching:
      'Precision Tailoring: High-density, fine thread seams built to maintain silhouette shape and long-term durability.\nFlawless Neckline & Panel Facing: Reinforced embroidery backing ensures the panels lie flat and structured without puckering.\nClean Edge Finishing: Fully enclosed internal seams and thread-trimmed edges prevent fraying and ensure comfortable wear.',
    outfit_architecture:
      'Shirt (Kameez): Straight longline shirt featuring vertical paneling, wide bell sleeves, and a curved embroidered hemline.\nTrouser: Plain-dyed, wide-leg relaxed trousers with a comfortable elasticated waistband for effortless elegance.',
    wash_care:
      'Dry clean recommended to maintain fabric weave and embroidery integrity.\nIf hand washing, wash gently in cold water with mild detergent.\nDo not bleach, wring, or tumble dry.\nLine dry in the shade to prevent color fading.\nIron on low-to-medium heat on the reverse side; avoid direct iron contact on embroidered areas.',
    color_disclaimer:
      'Actual product colors may slightly vary from the images shown due to photographic lighting sources, professional shoot editing, or individual device screen settings.',
    video_url: '/assets/products/anna/anna-video.mp4',
    is_featured: true,
    is_new_arrival: true,
    is_published: true,
    primary_image: '/assets/products/anna/1.jpg',
    secondary_image: '/assets/products/anna/2.jpg',
    images: makeImages('anna', 9, 'jpg', 0),
    variants: makeVariants('Classic Black with Ivory/Off-White Embroidery'),
    sizes: [...STANDARD_SIZES],
    colors: ['Classic Black with Ivory/Off-White Embroidery'],
    inventory: {
      available_stock: 14,
      reserved_stock: 0,
      sold_quantity: 0,
      low_stock_threshold: 5,
      stock_status: 'In Stock',
      size_stock: { Small: 4, Medium: 4, Large: 3, 'Extra Large': 3 },
      updated_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    slug: 'hazel',
    sku: 'RER-PRET-HAZEL-02',
    name: 'HAZEL',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 7490,
    discounted_price: null,
    effective_price: 7490,
    overview:
      'Hazel is a beautifully crafted ensemble that brings together timeless elegance and contemporary charm. Featuring intricate embroidery on a textured shirt, this sophisticated design is paired with a plain-dyed trouser for a graceful, effortlessly coordinated look. Thoughtful detailing and rich seasonal textures add depth and character, making Hazel a perfect choice for women who appreciate understated luxury, everyday comfort, and refined style.',
    product_type_detail: '2-Piece Stitched Suit (Shirt + Trouser)',
    color_name: 'Cranberry Red with Floral Embroidery',
    fabric: 'Rich Seasonal Textured Fabric',
    fit: 'Relaxed / Straight Fit',
    embroidered_details:
      'Featuring intricate floral embroidery with delicate threadwork and traditional motifs along the neckline, front panel, sleeve cuffs, and matching border.',
    suit_stitching:
      'Precision Tailoring: High-density stitching ensures seamless drape, optimal durability, and pristine garment structural integrity.\nNeat Finishing: Fully finished inner seams prevent fraying and offer maximum skin comfort.\nFlawless Neck & Sleeve Facing: Structured yoke construction keeps the embroidery lying flat without wrinkling or bunching.',
    outfit_architecture:
      'Shirt (Kameez): A straight-cut longline shirt with a structured V-neckline, full relaxed bell sleeves, and side vents for fluid movement.\nTrouser: Straight-leg matching plain-dyed trousers designed with a comfortable elastic waistband and clean hemline.',
    wash_care:
      "Dry clean recommended to preserve the fabric's texture and intricate embroidery.\nIf washing at home, hand wash gently in cold water with a mild detergent.\nAvoid bleach and harsh chemicals to protect the fabric and embroidery.\nIron at a low temperature, preferably on the reverse side. Avoid direct ironing over embroidered areas.\nDo not wring or twist the fabric. Dry in the shade to help maintain its original colour.",
    color_disclaimer:
      'Please note that the actual product colour may vary slightly from the images displayed on our website due to lighting conditions, photography, and differences in screen settings.',
    video_url: '/assets/products/hazel/hazel-video.mp4',
    is_featured: true,
    is_new_arrival: true,
    is_published: true,
    primary_image: '/assets/products/hazel/1.jpg',
    secondary_image: '/assets/products/hazel/2.jpg',
    images: makeImages('hazel', 9, 'jpg', 0),
    variants: makeVariants('Cranberry Red with Floral Embroidery'),
    sizes: [...STANDARD_SIZES],
    colors: ['Cranberry Red with Floral Embroidery'],
    inventory: {
      available_stock: 12,
      reserved_stock: 0,
      sold_quantity: 0,
      low_stock_threshold: 5,
      stock_status: 'In Stock',
      size_stock: { Small: 3, Medium: 3, Large: 3, 'Extra Large': 3 },
      updated_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    slug: 'olivia',
    sku: 'RER-PRET-OLIVIA-03',
    name: 'OLIVIA',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 8999,
    discounted_price: null,
    effective_price: 8999,
    overview:
      'OLIVIA from the Rang e Rosh Pret collection is a sophisticated 2-piece stitched ensemble in a rich olive green tone. Adorned with delicate floral embroidery in vibrant shades of magenta, teal, blue, and gold threadwork, this suit pairs an intricately detailed shirt with matching embroidered straight trousers for an effortless, regal look.',
    product_type_detail: '2-Piece Stitched Suit (Shirt + Trouser)',
    color_name: 'Deep Olive Green with Multi-color (Magenta, Teal, Gold) Threadwork',
    fabric: 'Premium Cotton / Linen Blend',
    fit: 'Relaxed Straight Fit',
    embroidered_details:
      'Neckline: Delicate slit neck adorned with fine floral thread embroidery.\nFront & Side Panels: Swirling vine and floral motifs extending along the side panel and hemline.\nSleeves: Wide relaxed sleeves highlighted with rich floral embroidery along the cuffs.\nTrouser: Straight-leg trousers with an intricately embroidered border along the hem.',
    suit_stitching:
      'Precision Tailoring: High-density, fine thread seam construction ensures garment durability and structural integrity.\nNeat Finishing: Fully enclosed internal seams reduce fraying and offer smooth skin comfort.\nFlawless Neckline & Vents: Structured slit neck facing and clean side slits engineered for maximum movement and elegant drape.',
    outfit_architecture:
      'Shirt (Kameez): A straight-cut longline tunic featuring a split V-neckline, broad relaxed sleeves, panel embroidery, and side vents.\nTrouser: Structured straight-leg trousers designed with an elasticated waistband and an embroidered hemline border.',
    wash_care:
      'Dry clean recommended to preserve fabric richness and intricate threadwork.\nIf hand washing, wash gently in cold water using mild detergent.\nWash dark colors separately. Do not bleach, wring, or tumble dry.\nLine dry in shade away from direct sunlight.\nIron on low-to-medium heat on the reverse side of embroidery.',
    color_disclaimer:
      'Actual product colors may vary slightly from the images shown due to photographic lighting sources, professional shoot editing, or individual monitor/mobile screen settings.',
    video_url: null,
    is_featured: true,
    is_new_arrival: true,
    is_published: true,
    primary_image: '/assets/products/olivia/1.jpg',
    secondary_image: '/assets/products/olivia/2.jpg',
    images: makeImages('olivia', 6, 'jpg', 0),
    variants: makeVariants('Deep Olive Green with Multi-color Threadwork'),
    sizes: [...STANDARD_SIZES],
    colors: ['Deep Olive Green with Multi-color Threadwork'],
    inventory: {
      available_stock: 10,
      reserved_stock: 0,
      sold_quantity: 0,
      low_stock_threshold: 5,
      stock_status: 'In Stock',
      size_stock: { Small: 3, Medium: 3, Large: 2, 'Extra Large': 2 },
      updated_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    slug: 'orchid',
    sku: 'RER-PRET-ORCHID-04',
    name: 'ORCHID',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 11450,
    discounted_price: null,
    effective_price: 11450,
    overview:
      'ORCHID from the Rang e Rosh Pret collection is a regal 2-piece stitched suit presented in a deep plum purple tone. Accented with delicate floral thread embroidery and refined schiffli cutwork detailing along the sleeves and scalloped trouser hem, this ensemble blends traditional elegance with fluid modern tailoring.',
    product_type_detail: '2-Piece Stitched Suit (Kameez / Long Shirt + Straight Trouser)',
    color_name: 'Deep Plum / Royal Purple with Peach, Lavender & Ochre Embroidery',
    fabric: 'Premium Smooth Viscose / Cotton Blend',
    fit: 'Relaxed Straight Silhouette with Graceful Drape',
    embroidered_details:
      'Neckline: Delicate notch neck accented with fine floral branch embroidery.\nSide Panels & Hemline: Cascading floral vines extending along the lower side panels and front hem.\nSleeves: Wide relaxed bell sleeves embellished with floral threadwork and schiffli cutwork borders.\nTrouser: Straight-leg matching trousers finished with an intricate schiffli eyelet lace and scalloped embroidered cuff.',
    suit_stitching:
      'Precision Seams: High-density stitching ensures structural longevity and clean garment lines.\nOverlocked Edges: Interlocked internal seams prevent fraying and maintain a smooth feel against skin.\nNeat Finishing: Meticulously faced neckline and clean side slits engineered for effortless movement and fit.',
    outfit_architecture:
      'Shirt (Kameez): A straight, longline tunic featuring side slits, broad relaxed sleeves, notch neck, and panel embroidery.\nTrouser: An elasticated, straight-cut cropped bottom with structured leg width and embroidered eyelet hem borders.',
    wash_care:
      'Dry clean recommended to retain fabric richness and delicate cutwork embroidery.\nHand-wash gently in cold water using mild detergent if washing at home.\nWash dark colors separately; do not bleach, wring, or tumble dry.\nLine dry in shade away from direct sunlight. Iron on low-to-medium heat on the reverse side of embroidery.',
    color_disclaimer:
      'Actual product color may slightly vary from the pictures due to photographic lighting, shoot editing, or individual monitor and screen settings.',
    video_url: null,
    is_featured: true,
    is_new_arrival: true,
    is_published: true,
    primary_image: '/assets/products/orchid/1.webp',
    secondary_image: '/assets/products/orchid/2.webp',
    images: makeImages('orchid', 8, 'webp', 0),
    variants: makeVariants('Deep Plum / Royal Purple with Peach, Lavender & Ochre Embroidery'),
    sizes: [...STANDARD_SIZES],
    colors: ['Deep Plum / Royal Purple with Peach, Lavender & Ochre Embroidery'],
    inventory: {
      available_stock: 9,
      reserved_stock: 0,
      sold_quantity: 0,
      low_stock_threshold: 5,
      stock_status: 'In Stock',
      size_stock: { Small: 3, Medium: 2, Large: 2, 'Extra Large': 2 },
      updated_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    slug: 'sabz',
    sku: 'RER-PRET-SABZ-05',
    name: 'SABZ',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 8450,
    discounted_price: null,
    effective_price: 8450,
    overview:
      'SABZ from the Rang e Rosh Pret collection is a luxurious 2-piece stitched ensemble in a rich jewel-toned emerald green. Showcasing delicate antique gold tilla and tonal threadwork along the neckline, sleeves, and hem, this suit pairs an elongated straight-cut tunic with matching trousers for a regal, sophisticated statement.',
    product_type_detail: '2-Piece Stitched Suit (Long Shirt + Straight Trouser)',
    color_name: 'Deep Emerald Green with Antique Gold & Tonal Green Threadwork',
    fabric: 'Premium Smooth Viscose Silk / Cotton Blend',
    fit: 'Relaxed Longline Straight Cut',
    embroidered_details:
      'Neckline & Placket: Intricate split V-neckline adorned with delicate antique gold hand-accented stitchwork and fine paisley embroidery.\nShirt Front & Side Panel: Scattered floral motifs across the chest, complemented by an elaborate embroidery trail extending down the side slits and hem.\nSleeves: Full-length structured sleeves highlighted with detailed paisley embroidery and tilla cuff borders.\nHemline (Daman): Delicate floral vine embroidery trimming the front hem border.',
    suit_stitching:
      'Master Tailoring: High-density, fine-thread seaming designed for a smooth drape and structural permanence.\nClean Edge Finishing: Overlocked internal seams prevent fraying while offering comfortable skin wear.\nStructured Neck & Vents: Reinforced placket construction ensures the intricate neck embroidery lies completely flat without bunching.',
    outfit_architecture:
      'Shirt (Kameez): An extended longline straight tunic with a V-split neckline, full-length fitted sleeves with embroidered cuffs, and deep side slits.\nTrouser: Plain-dyed emerald green straight-cut trousers featuring a comfortable elasticated waistband and clean finished cuffs.',
    wash_care:
      'Dry clean recommended to retain deep jewel tones and preserve delicate tilla embroidery.\nIf hand washing at home, wash gently in cold water using a mild detergent.\nWash dark colors separately; do not bleach, wring, or tumble dry.\nLine dry in shade away from direct sunlight.\nIron on low-to-medium heat on the reverse side of embroidered panels.',
    color_disclaimer:
      'Actual product colors may vary slightly from the images shown due to studio lighting, professional photo editing, or individual screen resolution settings.',
    video_url: null,
    is_featured: true,
    is_new_arrival: true,
    is_published: true,
    primary_image: '/assets/products/sabz/5.png',
    secondary_image: '/assets/products/sabz/1.png',
    images: makeImages('sabz', 11, 'png', 4),
    variants: makeVariants('Deep Emerald Green with Antique Gold & Tonal Green Threadwork'),
    sizes: [...STANDARD_SIZES],
    colors: ['Deep Emerald Green with Antique Gold & Tonal Green Threadwork'],
    inventory: {
      available_stock: 11,
      reserved_stock: 0,
      sold_quantity: 0,
      low_stock_threshold: 5,
      stock_status: 'In Stock',
      size_stock: { Small: 3, Medium: 3, Large: 3, 'Extra Large': 2 },
      updated_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    slug: 'zayna',
    sku: 'RER-PRET-ZAYNA-06',
    name: 'ZAYNA',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 4700,
    discounted_price: null,
    effective_price: 4700,
    overview:
      'ZAYNA from the Rang e Rosh collection is a vibrant 2-piece stitched suit crafted in a warm mustard-yellow shade. Featuring traditional embroidered motifs scattered across the shirt and intricate geometric-floral border artwork on wide statement sleeves and trousers, this ensemble strikes a perfect balance between timeless heritage and modern comfort.',
    product_type_detail: '2-Piece Stitched Suit (Shirt + Trouser)',
    color_name: 'Mustard Yellow with Maroon & Cream Accents',
    fabric: 'Premium Cotton / Viscose Blend',
    fit: 'Straight Cut / Relaxed Fit',
    embroidered_details:
      'Neckline & Placket: Embroidered round neckline with an extended placket detailed with delicate contrast stitchwork and button accents.\nShirt Front & Back: Delicate embroidered cross-stitch motifs evenly dispersed across the front panel, edged with a decorative patterned hemline border.\nSleeves: Broad-cut sleeves featuring elaborate folk-inspired embroidered panels, floral swirls, and a distinctive split-cuff design.\nTrouser: Straight-cut plain trouser finished with an embroidered border hem matching the sleeve motif.',
    suit_stitching:
      'Precision Tailoring: High-density, fine thread seams crafted for structural durability and a smooth fit.\nNeat Edge Finishing: Fully enclosed internal seams reduce fraying and provide maximum comfort against the skin.\nRefined Placket & Cuffs: Reinforced stitching along the placket and sleeve slits keeps structural lines sharp and crisp.',
    outfit_architecture:
      'Shirt (Kameez): A straight longline tunic with a split keyhole neckline, broad statement sleeves with slit cuffs, and side vents.\nTrouser: Structured straight-leg trousers with an elasticated waistband and aligned embroidered hem borders.',
    wash_care:
      'Dry clean recommended to preserve fabric quality and detailed embroidery work.\nIf hand-washing at home, wash gently in cold water with mild liquid detergent.\nWash dark or vibrant colors separately.\nDo not bleach, wring, or tumble dry.\nDry in shade to maintain color brilliance.\nIron on low-to-medium heat on the reverse side of embroidered panels.',
    color_disclaimer:
      'Product colors may vary slightly from the images shown due to studio lighting, professional photo editing, and individual screen resolution settings.',
    video_url: null,
    is_featured: true,
    is_new_arrival: true,
    is_published: true,
    primary_image: '/assets/products/zayna/1.webp',
    secondary_image: '/assets/products/zayna/2.webp',
    images: makeImages('zayna', 4, 'webp', 0),
    variants: makeVariants('Mustard Yellow with Maroon & Cream Accents'),
    sizes: [...STANDARD_SIZES],
    colors: ['Mustard Yellow with Maroon & Cream Accents'],
    inventory: {
      available_stock: 15,
      reserved_stock: 0,
      sold_quantity: 0,
      low_stock_threshold: 5,
      stock_status: 'In Stock',
      size_stock: { Small: 4, Medium: 4, Large: 4, 'Extra Large': 3 },
      updated_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let memoryState = null;

function loadCloudState() {
  if (memoryState) return memoryState;
  try {
    if (fs.existsSync(CLOUD_STATE_FILE)) {
      const raw = fs.readFileSync(CLOUD_STATE_FILE, 'utf8');
      memoryState = JSON.parse(raw);
      return memoryState;
    }
  } catch {
    // ignore read errors
  }
  memoryState = {
    settings: { ...DEFAULT_SETTINGS },
    products: JSON.parse(JSON.stringify(SEED_PRODUCTS)),
    orders: [],
    transactions: [],
  };
  return memoryState;
}

function saveCloudState(state) {
  memoryState = state;
  try {
    fs.writeFileSync(CLOUD_STATE_FILE, JSON.stringify(state), 'utf8');
  } catch {
    // ignore write errors
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const state = loadCloudState();
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname.replace(/\/+$/, '') || '/';
  const method = req.method || 'GET';
  const body = req.body || {};

  try {
    // 1. Storefront Init
    if (pathname === '/api/storefront/init' && method === 'GET') {
      const published = state.products.filter((p) => p.is_published);
      const categories = Array.from(new Set(published.map((p) => p.category)));
      return res.status(200).json({
        settings: state.settings,
        products: published,
        categories,
      });
    }

    // 2. Public Products List
    if (pathname === '/api/products' && method === 'GET') {
      let list = state.products.filter((p) => p.is_published);
      const category = urlObj.searchParams.get('category');
      const availability = urlObj.searchParams.get('availability');
      const search = urlObj.searchParams.get('search');
      const sort = urlObj.searchParams.get('sort');

      if (category && category !== 'All') {
        list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }
      if (availability === 'in_stock') {
        list = list.filter((p) => p.inventory.available_stock > 0);
      } else if (availability === 'out_of_stock') {
        list = list.filter((p) => p.inventory.available_stock <= 0);
      }
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.color_name.toLowerCase().includes(q) ||
            p.overview.toLowerCase().includes(q)
        );
      }
      if (sort === 'price_asc') {
        list.sort((a, b) => a.effective_price - b.effective_price);
      } else if (sort === 'price_desc') {
        list.sort((a, b) => b.effective_price - a.effective_price);
      }
      return res.status(200).json({ products: list });
    }

    // 3. Public Product Detail
    if (pathname.startsWith('/api/products/') && method === 'GET') {
      const slugOrId = decodeURIComponent(pathname.slice('/api/products/'.length));
      const all = state.products.filter((p) => p.is_published);
      const product = all.find((p) => p.slug === slugOrId || String(p.id) === slugOrId);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      const relatedProducts = all.filter((p) => p.id !== product.id);
      return res.status(200).json({ product, relatedProducts });
    }

    // 4. Create Order
    if (pathname === '/api/orders' && method === 'POST') {
      let subtotal = 0;
      const resolvedItems = (body.items || []).map((item) => {
        const prod = state.products.find((p) => p.id === Number(item.product_id));
        if (!prod) throw new Error('Product not found');
        const qty = Number(item.quantity) || 1;
        const selSize = (item.selected_size || 'Small').trim();
        const sizeAvail = Number(
          prod.inventory.size_stock?.[selSize] ?? prod.inventory.available_stock
        );
        if (qty > sizeAvail) {
          throw new Error(`Insufficient stock for "${prod.name}" (${selSize}).`);
        }
        const lineTotal = prod.effective_price * qty;
        subtotal += lineTotal;
        prod.inventory.reserved_stock += qty;
        return {
          product_id: prod.id,
          product_name: prod.name,
          product_sku: prod.sku,
          product_image: prod.primary_image,
          selected_size: selSize,
          selected_color: item.selected_color || prod.color_name,
          unit_price: prod.effective_price,
          quantity: qty,
          line_total: lineTotal,
        };
      });

      const shipping =
        state.settings.free_shipping_threshold > 0 &&
        subtotal >= state.settings.free_shipping_threshold
          ? 0
          : state.settings.shipping_charges;
      const totalAmount = subtotal + shipping;
      const orderNumber = `RER-${1001 + state.orders.length}`;
      const itemsLines = resolvedItems
        .map(
          (i, idx) =>
            `${idx + 1}. *${i.product_name}* (${i.selected_size}) x${i.quantity} — PKR ${i.line_total.toLocaleString('en-PK')}`
        )
        .join('\n');

      const msg = `Assalam-o-Alaikum *${body.customer_name}*! ✨\nThank you for your order at *${state.settings.store_name}*.\n\n*Order ID:* #${orderNumber}\n*Items:*\n${itemsLines}\n\n*Total Payable:* PKR ${totalAmount.toLocaleString('en-PK')}\n*Delivery Address:* ${body.shipping_address}, ${body.city}\n*Payment:* ${body.payment_method}`;
      const cleanCustomerPhone = String(body.customer_phone || '')
        .replace(/\D/g, '')
        .replace(/^0/, '92');
      const customerWhatsappUrl = `https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(msg)}`;
      const storeWhatsappUrl = `https://wa.me/${state.settings.whatsapp_clean}?text=${encodeURIComponent(msg)}`;

      const newOrder = {
        id: state.orders.length + 1,
        order_number: orderNumber,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_email: body.customer_email || '',
        shipping_address: body.shipping_address,
        city: body.city,
        order_notes: body.order_notes || '',
        payment_method: body.payment_method || 'Cash on Delivery (COD)',
        subtotal,
        shipping_charges: shipping,
        total_amount: totalAmount,
        status: 'Pending',
        stock_deducted: false,
        stock_reserved: true,
        whatsapp_message: msg,
        whatsapp_url: customerWhatsappUrl,
        customer_whatsapp_message: msg,
        customer_whatsapp_url: customerWhatsappUrl,
        store_whatsapp_message: msg,
        store_whatsapp_url: storeWhatsappUrl,
        store_whatsapp: state.settings.whatsapp_number,
        items: resolvedItems,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };

      state.orders.unshift(newOrder);
      saveCloudState(state);
      return res.status(201).json({ order: newOrder });
    }

    // 5. Order Lookup
    if (pathname.startsWith('/api/orders/lookup/') && method === 'GET') {
      const orderNumber = decodeURIComponent(pathname.slice('/api/orders/lookup/'.length));
      const order = state.orders.find(
        (o) => o.order_number.toUpperCase() === orderNumber.trim().toUpperCase()
      );
      if (!order) return res.status(404).json({ error: `No order found with ID "${orderNumber}".` });
      return res.status(200).json({ order });
    }

    // 6. Admin Login & Session
    if (pathname === '/api/admin/login' && method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (
        email === 'rangerosh.official@gmail.com' &&
        (password === 'RangERosh@2026' || password === 'RangeRosh@Admin2026')
      ) {
        return res.status(200).json({
          token: 'rer-cloud-admin-token-2026',
          admin: {
            id: 1,
            email: 'rangerosh.official@gmail.com',
            name: 'Rang e Rosh Admin',
            role: 'super_admin',
          },
        });
      }
      return res.status(401).json({ error: 'Invalid admin email or password.' });
    }

    if (pathname === '/api/admin/me' && method === 'GET') {
      return res.status(200).json({
        admin: {
          id: 1,
          email: 'rangerosh.official@gmail.com',
          name: 'Rang e Rosh Admin',
          role: 'super_admin',
        },
      });
    }

    // 7. Admin Dashboard
    if (pathname === '/api/admin/dashboard' && method === 'GET') {
      const confirmedStatuses = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
      const confirmedOrders = state.orders.filter((o) => confirmedStatuses.includes(o.status));
      const pendingOrders = state.orders.filter((o) => o.status === 'Pending');
      const cancelledOrders = state.orders.filter((o) => o.status === 'Cancelled');
      const totalSales = confirmedOrders.reduce((s, o) => s + o.total_amount, 0);
      const pendingSales = pendingOrders.reduce((s, o) => s + o.total_amount, 0);
      const lowStock = state.products.filter((p) => p.inventory.stock_status === 'Low Stock');
      const outOfStock = state.products.filter((p) => p.inventory.stock_status === 'Out of Stock');

      return res.status(200).json({
        summary: {
          total_products: state.products.length,
          total_orders: state.orders.length,
          pending_orders: pendingOrders.length,
          confirmed_orders: confirmedOrders.length,
          cancelled_orders: cancelledOrders.length,
          total_sales: totalSales,
          pending_sales: pendingSales,
          low_stock_count: lowStock.length,
          out_of_stock_count: outOfStock.length,
        },
        low_stock_products: lowStock,
        out_of_stock_products: outOfStock,
        top_selling_products: [...state.products].sort(
          (a, b) => b.inventory.sold_quantity - a.inventory.sold_quantity
        ),
        daily_analytics: [],
        recent_orders: state.orders.slice(0, 8),
      });
    }

    // 8. Admin Products CRUD
    if (pathname === '/api/admin/products' && method === 'GET') {
      return res.status(200).json({ products: state.products });
    }

    if (pathname === '/api/admin/products' && method === 'POST') {
      const newId = state.products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
      const slug =
        String(body.name || `product-${newId}`)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-') || `product-${newId}`;
      const sizeStock = body.size_stock || distributeStock(Number(body.available_stock) || 12);
      const totalStock = Object.values(sizeStock).reduce((s, n) => s + Number(n || 0), 0);
      const regPrice = Number(body.regular_price) || 0;
      const discPrice = body.discounted_price ? Number(body.discounted_price) : null;
      const effPrice = discPrice && discPrice < regPrice ? discPrice : regPrice;
      const imgs = Array.isArray(body.images) ? body.images : [];

      const newProd = {
        id: newId,
        slug,
        sku: String(body.sku || `RER-PRET-0${newId}`).toUpperCase(),
        name: body.name,
        collection_name: body.collection_name || 'Rang e Rosh Pret Collection',
        category: body.category || '2-Piece Stitched Suit',
        regular_price: regPrice,
        discounted_price: discPrice,
        effective_price: effPrice,
        overview: body.overview || '',
        product_type_detail: body.product_type_detail || '2-Piece Stitched Suit (Shirt + Trouser)',
        color_name: body.color_name || '',
        fabric: body.fabric || '',
        fit: body.fit || 'Relaxed / Straight Fit',
        embroidered_details: body.embroidered_details || '',
        suit_stitching: body.suit_stitching || '',
        outfit_architecture: body.outfit_architecture || '',
        wash_care: body.wash_care || '',
        color_disclaimer: body.color_disclaimer || '',
        video_url: body.video_url || null,
        is_featured: Boolean(body.is_featured),
        is_new_arrival: Boolean(body.is_new_arrival),
        is_published: Boolean(body.is_published),
        primary_image: imgs[0] || state.settings.logo_url || OFFICIAL_LOGO_URL,
        secondary_image: imgs[1] || imgs[0] || state.settings.logo_url || OFFICIAL_LOGO_URL,
        images: imgs.map((url, idx) => ({
          id: idx + 1,
          image_url: url,
          alt_text: `${body.name} View ${idx + 1}`,
          sort_order: idx,
          is_primary: idx === 0 ? 1 : 0,
        })),
        variants: makeVariants(body.color_name || ''),
        sizes: [...STANDARD_SIZES],
        colors: [body.color_name || 'Standard'],
        inventory: {
          available_stock: totalStock,
          reserved_stock: 0,
          sold_quantity: 0,
          low_stock_threshold: Number(body.low_stock_threshold) || 5,
          stock_status: computeStockStatus(totalStock, Number(body.low_stock_threshold) || 5),
          size_stock: sizeStock,
          updated_at: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      state.products.push(newProd);
      saveCloudState(state);
      return res.status(201).json({ product: newProd });
    }

    if (pathname.startsWith('/api/admin/products/') && method === 'PUT') {
      const id = Number(pathname.slice('/api/admin/products/'.length));
      const idx = state.products.findIndex((p) => p.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Product not found' });
      const existing = state.products[idx];

      const regPrice =
        body.regular_price !== undefined ? Number(body.regular_price) : existing.regular_price;
      const discPrice =
        body.discounted_price !== undefined
          ? body.discounted_price
            ? Number(body.discounted_price)
            : null
          : existing.discounted_price;
      const effPrice = discPrice && discPrice < regPrice ? discPrice : regPrice;

      const sizeStock = body.size_stock
        ? { ...existing.inventory.size_stock, ...body.size_stock }
        : existing.inventory.size_stock || distributeStock(existing.inventory.available_stock);
      const totalStock = Object.values(sizeStock).reduce((s, n) => s + Number(n || 0), 0);
      const imgs = Array.isArray(body.images)
        ? body.images.map((url, i) => ({
            id: i + 1,
            image_url: url,
            alt_text: `${body.name || existing.name} View ${i + 1}`,
            sort_order: i,
            is_primary: i === 0 ? 1 : 0,
          }))
        : existing.images;

      const updated = {
        ...existing,
        ...body,
        regular_price: regPrice,
        discounted_price: discPrice,
        effective_price: effPrice,
        primary_image: imgs[0]?.image_url || existing.primary_image,
        secondary_image: imgs[1]?.image_url || imgs[0]?.image_url || existing.secondary_image,
        images: imgs,
        sizes: [...STANDARD_SIZES],
        inventory: {
          ...existing.inventory,
          available_stock: totalStock,
          low_stock_threshold:
            body.low_stock_threshold !== undefined
              ? Number(body.low_stock_threshold)
              : existing.inventory.low_stock_threshold,
          size_stock: sizeStock,
          stock_status: computeStockStatus(
            totalStock,
            body.low_stock_threshold !== undefined
              ? Number(body.low_stock_threshold)
              : existing.inventory.low_stock_threshold
          ),
          updated_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      };

      state.products[idx] = updated;
      saveCloudState(state);
      return res.status(200).json({ product: updated });
    }

    if (pathname.startsWith('/api/admin/products/') && method === 'DELETE') {
      const id = Number(pathname.slice('/api/admin/products/'.length));
      state.products = state.products.filter((p) => p.id !== id);
      saveCloudState(state);
      return res.status(200).json({ message: 'Product deleted successfully.' });
    }

    // 9. Admin Inventory
    if (pathname === '/api/admin/inventory' && method === 'GET') {
      return res.status(200).json({
        products: state.products,
        transactions: state.transactions,
      });
    }

    const invMatch = pathname.match(/^\/api\/admin\/inventory\/(\d+)\/adjust$/);
    if (invMatch && method === 'POST') {
      const productId = Number(invMatch[1]);
      const idx = state.products.findIndex((p) => p.id === productId);
      if (idx === -1) return res.status(404).json({ error: 'Product not found' });
      const prod = state.products[idx];
      const prevAvail = prod.inventory.available_stock;
      const sizeStock = {
        ...(prod.inventory.size_stock || distributeStock(prevAvail)),
      };
      const qty = Math.max(0, Math.floor(Number(body.quantity) || 0));

      if (body.size && STANDARD_SIZES.includes(body.size)) {
        const cur = Number(sizeStock[body.size] ?? 0);
        if (body.mode === 'set') sizeStock[body.size] = qty;
        else if (body.mode === 'increase') sizeStock[body.size] = cur + qty;
        else if (body.mode === 'decrease') sizeStock[body.size] = Math.max(0, cur - qty);
      } else {
        let nextTotal = prevAvail;
        if (body.mode === 'set') nextTotal = qty;
        else if (body.mode === 'increase') nextTotal = prevAvail + qty;
        else if (body.mode === 'decrease') nextTotal = Math.max(0, prevAvail - qty);
        Object.assign(sizeStock, distributeStock(nextTotal));
      }

      const newAvail = Object.values(sizeStock).reduce((s, n) => s + Number(n || 0), 0);
      const threshold =
        body.low_stock_threshold !== undefined
          ? Number(body.low_stock_threshold)
          : prod.inventory.low_stock_threshold;

      prod.inventory = {
        ...prod.inventory,
        available_stock: newAvail,
        low_stock_threshold: threshold,
        size_stock: sizeStock,
        stock_status: computeStockStatus(newAvail, threshold),
        updated_at: new Date().toISOString(),
      };

      state.transactions.unshift({
        id: state.transactions.length + 1,
        product_id: prod.id,
        product_name: prod.name,
        product_sku: prod.sku,
        order_id: null,
        order_number: null,
        change_type: newAvail >= prevAvail ? 'restock' : 'manual_adjustment',
        quantity_delta: newAvail - prevAvail,
        previous_available: prevAvail,
        new_available: newAvail,
        previous_reserved: prod.inventory.reserved_stock,
        new_reserved: prod.inventory.reserved_stock,
        note: body.note || `Adjusted ${body.size || 'stock'} (${body.mode})`,
        performed_by: 'Admin',
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      });

      state.products[idx] = prod;
      saveCloudState(state);
      return res.status(200).json({ product: prod });
    }

    // 10. Admin Orders
    if (pathname === '/api/admin/orders' && method === 'GET') {
      let orders = [...state.orders];
      const status = urlObj.searchParams.get('status');
      const search = urlObj.searchParams.get('search');
      if (status && status !== 'All') {
        orders = orders.filter((o) => o.status === status);
      }
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        orders = orders.filter(
          (o) =>
            o.order_number.toLowerCase().includes(q) ||
            o.customer_name.toLowerCase().includes(q) ||
            o.customer_phone.toLowerCase().includes(q)
        );
      }
      return res.status(200).json({ orders });
    }

    const orderStatusMatch = pathname.match(/^\/api\/admin\/orders\/(\d+)\/status$/);
    if (orderStatusMatch && method === 'PATCH') {
      const id = Number(orderStatusMatch[1]);
      const idx = state.orders.findIndex((o) => o.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Order not found' });
      const order = state.orders[idx];
      const status = body.status;
      const isConfirming = ['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(status);

      if (isConfirming && !order.stock_deducted) {
        for (const item of order.items) {
          const p = state.products.find((pr) => pr.id === item.product_id);
          if (p && p.inventory.size_stock) {
            const sz = item.selected_size || 'Small';
            p.inventory.size_stock[sz] = Math.max(
              0,
              (p.inventory.size_stock[sz] || 0) - item.quantity
            );
            p.inventory.available_stock = Object.values(p.inventory.size_stock).reduce(
              (s, n) => s + n,
              0
            );
            p.inventory.sold_quantity += item.quantity;
            p.inventory.reserved_stock = Math.max(0, p.inventory.reserved_stock - item.quantity);
          }
        }
        order.stock_deducted = true;
        order.stock_reserved = false;
      }

      order.status = status;
      state.orders[idx] = order;
      saveCloudState(state);
      return res.status(200).json({ order });
    }

    // 11. Admin Settings
    if (pathname === '/api/admin/settings' && method === 'GET') {
      return res.status(200).json({ settings: state.settings });
    }

    if (pathname === '/api/admin/settings' && method === 'PUT') {
      const cleanWa = String(body.whatsapp_number || state.settings.whatsapp_number || '')
        .replace(/\D/g, '')
        .replace(/^0/, '92');
      state.settings = {
        ...state.settings,
        ...body,
        whatsapp_clean: cleanWa || state.settings.whatsapp_clean,
        updated_at: new Date().toISOString(),
      };
      saveCloudState(state);
      return res.status(200).json({ settings: state.settings });
    }

    return res.status(404).json({ error: `Endpoint not found: ${method} ${pathname}` });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Server error' });
  }
}
