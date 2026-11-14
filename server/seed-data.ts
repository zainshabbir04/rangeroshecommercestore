import fs from 'node:fs';
import path from 'node:path';

export interface InitialProductData {
  slug: string;
  sku: string;
  name: string;
  collection_name: string;
  category: string;
  regular_price: number;
  discounted_price: number | null;
  overview: string;
  product_type_detail: string;
  color_name: string;
  fabric: string;
  fit: string;
  embroidered_details: string;
  suit_stitching: string;
  outfit_architecture: string;
  wash_care: string;
  color_disclaimer: string;
  source_folder: string;
  primary_image_index: number; // 0-based index in sorted images
  video_filename?: string;
  initial_stock: number;
  low_stock_threshold: number;
  is_featured: number;
  is_new_arrival: number;
  variants: Array<{
    size_label: string;
    color_label: string;
    sku_suffix: string;
  }>;
}

export const INITIAL_PRODUCTS: InitialProductData[] = [
  {
    slug: 'anna',
    sku: 'RER-PRET-ANNA-01',
    name: 'ANNA',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 7490,
    discounted_price: null,
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
    source_folder: 'ANNA Black 7490',
    primary_image_index: 0,
    video_filename: 'YTDown.com_YouTube_Media_s4bDstAGjc8_ANNA_001_1080p.mp4',
    initial_stock: 14,
    low_stock_threshold: 5,
    is_featured: 1,
    is_new_arrival: 1,
    variants: [
      {
        size_label: 'Relaxed / Straight Fit',
        color_label: 'Classic Black with Ivory/Off-White Embroidery',
        sku_suffix: 'BLK',
      },
    ],
  },
  {
    slug: 'hazel',
    sku: 'RER-PRET-HAZEL-02',
    name: 'HAZEL',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 7490,
    discounted_price: null,
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
      'Please note that the actual product colour may vary slightly from the images displayed on our website due to lighting conditions, photography, and differences in screen settings. We strive to represent our products as accurately as possible, but minor colour variations are normal.',
    source_folder: 'HAZEL Red 7490',
    primary_image_index: 0,
    video_filename: 'YTDown.com_YouTube_Media_NFmb6R5767U_HAZEL_001_1080p.mp4',
    initial_stock: 12,
    low_stock_threshold: 5,
    is_featured: 1,
    is_new_arrival: 1,
    variants: [
      {
        size_label: 'Relaxed / Straight Fit',
        color_label: 'Cranberry Red with Floral Embroidery',
        sku_suffix: 'RED',
      },
    ],
  },
  {
    slug: 'olivia',
    sku: 'RER-PRET-OLIVIA-03',
    name: 'OLIVIA',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 8999,
    discounted_price: null,
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
    source_folder: '4-Nishat Green 8999',
    primary_image_index: 0,
    initial_stock: 10,
    low_stock_threshold: 5,
    is_featured: 1,
    is_new_arrival: 1,
    variants: [
      {
        size_label: 'Relaxed Straight Fit',
        color_label: 'Deep Olive Green with Multi-color Threadwork',
        sku_suffix: 'OLV',
      },
    ],
  },
  {
    slug: 'orchid',
    sku: 'RER-PRET-ORCHID-04',
    name: 'ORCHID',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 11450,
    discounted_price: null,
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
    source_folder: '5-AZURE Orchid Purple 11450',
    primary_image_index: 0,
    initial_stock: 9,
    low_stock_threshold: 5,
    is_featured: 1,
    is_new_arrival: 1,
    variants: [
      {
        size_label: 'Relaxed Straight Silhouette',
        color_label: 'Deep Plum / Royal Purple with Peach, Lavender & Ochre Embroidery',
        sku_suffix: 'PLM',
      },
    ],
  },
  {
    slug: 'sabz',
    sku: 'RER-PRET-SABZ-05',
    name: 'SABZ',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 8450,
    discounted_price: null,
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
    source_folder: '6-daria 8450 Green',
    primary_image_index: 4, // 5.jpg.png is the full-length hero portrait; 1.jpg.png is neckline closeup
    initial_stock: 11,
    low_stock_threshold: 5,
    is_featured: 1,
    is_new_arrival: 1,
    variants: [
      {
        size_label: 'Relaxed Longline Straight Cut',
        color_label: 'Deep Emerald Green with Antique Gold & Tonal Green Threadwork',
        sku_suffix: 'EMR',
      },
    ],
  },
  {
    slug: 'zayna',
    sku: 'RER-PRET-ZAYNA-06',
    name: 'ZAYNA',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 4700,
    discounted_price: null,
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
    source_folder: '3-diners Rust 4700',
    primary_image_index: 0,
    initial_stock: 15,
    low_stock_threshold: 5,
    is_featured: 1,
    is_new_arrival: 1,
    variants: [
      {
        size_label: 'Straight Cut / Relaxed Fit',
        color_label: 'Mustard Yellow with Maroon & Cream Accents',
        sku_suffix: 'MST',
      },
    ],
  },
];

/**
 * Copies the original logo and all 6 product image/video folders into `public/assets`
 * without modifying, deleting, or overwriting the original files in the project root.
 */
export function syncOriginalAssetsToPublic(rootDir: string): Map<string, { images: string[]; videoUrl: string | null }> {
  const result = new Map<string, { images: string[]; videoUrl: string | null }>();

  // 1. Copy Brand Logo (Prefer the official uploaded Rang e Rosh Clothing logo if present)
  const uploadedLogoPath = path.join(rootDir, 'public', 'uploads', '1794056903993-429854-rang-e-rosh-logo.jpg');
  const srcLogoPath = fs.existsSync(uploadedLogoPath)
    ? uploadedLogoPath
    : path.join(rootDir, 'website logo', 'website logo.jpg');
  const destLogoDir = path.join(rootDir, 'public', 'assets', 'logo');
  fs.mkdirSync(destLogoDir, { recursive: true });
  const destLogoPath = path.join(destLogoDir, 'website-logo.jpg');
  if (fs.existsSync(srcLogoPath)) {
    fs.copyFileSync(srcLogoPath, destLogoPath);
  }

  // 2. Copy Product Images & Videos for each of the 6 products
  const productsSourceBase = path.join(rootDir, 'product name pic & detail');
  for (const product of INITIAL_PRODUCTS) {
    const srcFolder = path.join(productsSourceBase, product.source_folder);
    const destFolder = path.join(rootDir, 'public', 'assets', 'products', product.slug);
    fs.mkdirSync(destFolder, { recursive: true });

    const images: string[] = [];
    let videoUrl: string | null = null;

    if (fs.existsSync(srcFolder)) {
      const files = fs.readdirSync(srcFolder);

      // Sort numerically by leading number (1.jpg, 2.jpg, ..., 10.jpg, 11.jpg)
      const imageFiles = files
        .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort((a, b) => {
          const numA = parseInt(a.match(/^\d+/)?.[0] || '999', 10);
          const numB = parseInt(b.match(/^\d+/)?.[0] || '999', 10);
          return numA - numB;
        });

      imageFiles.forEach((file, idx) => {
        const ext = path.extname(file); // e.g. .webp, .jpg, .png
        const cleanFileName = `${idx + 1}${ext}`;
        const srcFile = path.join(srcFolder, file);
        const destFile = path.join(destFolder, cleanFileName);
        if (!fs.existsSync(destFile)) {
          fs.copyFileSync(srcFile, destFile);
        }
        images.push(`/assets/products/${product.slug}/${cleanFileName}`);
      });

      // Reorder so primary_image_index is first if needed (e.g., SABZ full-body shot first, while keeping all 11 images!)
      if (product.primary_image_index > 0 && product.primary_image_index < images.length) {
        const [primaryImg] = images.splice(product.primary_image_index, 1);
        images.unshift(primaryImg);
      }

      // Check for video file
      const videoFiles = files.filter((f) => /\.(mp4|webm)$/i.test(f));
      if (videoFiles.length > 0) {
        const vFile = videoFiles[0];
        const cleanVideoName = `${product.slug}-video.mp4`;
        const srcVideo = path.join(srcFolder, vFile);
        const destVideo = path.join(destFolder, cleanVideoName);
        if (!fs.existsSync(destVideo)) {
          fs.copyFileSync(srcVideo, destVideo);
        }
        videoUrl = `/assets/products/${product.slug}/${cleanVideoName}`;
      }
    }

    result.set(product.slug, { images, videoUrl });
  }

  return result;
}
