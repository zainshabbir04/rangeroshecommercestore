import { initializeDatabase, db } from './db.ts';

initializeDatabase();
const count = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
const imgCount = db.prepare('SELECT COUNT(*) as count FROM product_images').get() as { count: number };
console.log(`✅ Database initialized successfully! Seeded ${count.count} products and ${imgCount.count} product images.`);
