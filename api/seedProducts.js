import {neon} from '@neondatabase/serverless';
import path from 'path';
import fs from 'fs';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Kiểm tra xem phương thức yêu cầu có phải là POST không
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
      message: 'Only POST method is allowed.',
    });
  }

  try {
    // Đọc dữ liệu từ các file BeansData và CoffeeData
    const beansDataPath = path.join(process.cwd(), 'data', 'Bean.json');
    const coffeeDataPath = path.join(process.cwd(), 'data', 'Coffee.json');

    // Đọc dữ liệu từ các file JSON
    const beansData = JSON.parse(fs.readFileSync(beansDataPath, 'utf8'));
    const coffeeData = JSON.parse(fs.readFileSync(coffeeDataPath, 'utf8'));

    // Hợp nhất BeansData và CoffeeData
    const allProducts = [...beansData, ...coffeeData];
    // Lặp qua từng sản phẩm trong allProducts (bao gồm cả BeansData và CoffeeData)
    for (const product of allProducts) {
      // Chèn dữ liệu vào bảng products
      await sql`
        INSERT INTO products (
          id, 
          name, 
          description, 
          roasted, 
          imagelink_square, 
          imagelink_portrait, 
          ingredients, 
          special_ingredient, 
          prices, 
          average_rating, 
          ratings_count, 
          favourite, 
          type, 
          index
        ) VALUES (
          ${product.id}, 
          ${product.name}, 
          ${product.description}, 
          ${product.roasted}, 
          ${product.imagelink_square}, 
          ${product.imagelink_portrait}, 
          ${product.ingredients}, 
          ${product.special_ingredient}, 
          ${JSON.stringify(product.prices)}, 
          ${product.average_rating}, 
          ${product.ratings_count}, 
          ${product.favourite}, 
          ${product.type}, 
          ${product.index}
        )
      `;
      console.log(`Inserted product: ${product.name}`);
    }

    res.status(200).json({
      success: true,
      message: 'All products inserted successfully.',
    });
  } catch (error) {
    console.error('Error inserting products:', error.message);

    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message,
    });
  }
}
