function escapeCsvCell(val) {
  const str = String(val ?? '').replace(/\r?\n|\r/g, ' ').trim();
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateMetaCatalogCsv(products = [], siteOrigin = 'https://rangerosh.com') {
  const origin = siteOrigin.replace(/\/+$/, '');
  const header = [
    'id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'link',
    'image_link',
    'brand',
  ].join(',');

  const rows = (products || [])
    .filter((p) => p && p.is_published !== false && p.is_published !== 0)
    .map((p) => {
      const id = String(p.sku || p.id || '').trim();
      const title = String(p.title || p.name || '').trim();
      const description = String(
        p.overview || p.fabric_details || `${title} — Rang e Rosh Ladies Stitched Suit`
      ).trim();
      const availStock = Number(p.inventory?.available_stock ?? p.available_stock ?? 14);
      const availability = availStock > 0 ? 'in stock' : 'out of stock';
      const condition = 'new';
      const numPrice = Math.round(
        Number(p.effective_price ?? p.discounted_price ?? p.regular_price ?? 4699)
      );
      const price = `${numPrice} PKR`;
      const slug = String(p.slug || p.id || '').trim();
      const link = `${origin}/product/${encodeURIComponent(slug)}`;
      const rawImg = String(p.primary_image || '').trim();
      const imageLink = rawImg.startsWith('http')
        ? rawImg
        : `${origin}${rawImg.startsWith('/') ? '' : '/'}${encodeURI(rawImg)}`;
      const brand = 'Rang e Rosh';

      return [
        escapeCsvCell(id),
        escapeCsvCell(title),
        escapeCsvCell(description),
        escapeCsvCell(availability),
        escapeCsvCell(condition),
        escapeCsvCell(price),
        escapeCsvCell(link),
        escapeCsvCell(imageLink),
        escapeCsvCell(brand),
      ].join(',');
    });

  return [header, ...rows].join('\n');
}
