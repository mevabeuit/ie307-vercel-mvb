import { neon } from '@neondatabase/serverless';
import path from 'path';
import fs from 'fs';
import cloudinary from 'cloudinary';

const sql = neon(process.env.DATABASE_URL);

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Hàm tải ảnh lên Cloudinary
async function uploadToCloudinary(imagePath) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(imagePath, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result?.secure_url);  // Trả về URL của ảnh sau khi tải lên
      }
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
      message: 'Only POST method is allowed.',
    });
  }

  try {
    // Đọc dữ liệu từ các file JSON
    const beansDataPath = path.join(process.cwd(), 'data', 'Bean.json');
    const coffeeDataPath = path.join(process.cwd(), 'data', 'Coffee.json');
    
    const beansData = JSON.parse(fs.readFileSync(beansDataPath, 'utf8'));
    const coffeeData = JSON.parse(fs.readFileSync(coffeeDataPath, 'utf8'));

    const allProducts = [...beansData, ...coffeeData];

    for (const product of allProducts) {
      let imagelink_square_url = product.imagelink_square;
      let imagelink_portrait_url = product.imagelink_portrait;

      // Xử lý ảnh local nếu đường dẫn bắt đầu với '../assets/' và tải lên Cloudinary
      if (imagelink_square_url && imagelink_square_url.startsWith('/assets/')) {
        const imagePath = path.join(process.cwd(),'/public', imagelink_square_url);  // Đảm bảo đường dẫn chính xác
        imagelink_square_url = await uploadToCloudinary(imagePath);  // Tải ảnh lên Cloudinary
      }

      if (imagelink_portrait_url && imagelink_portrait_url.startsWith('/assets/')) {
        const imagePath = path.join(process.cwd(),'/public', imagelink_portrait_url);  // Đảm bảo đường dẫn chính xác
        imagelink_portrait_url = await uploadToCloudinary(imagePath);  // Tải ảnh lên Cloudinary
      }

      // Chèn dữ liệu vào cơ sở dữ liệu với các đường dẫn ảnh đã được thay thế bằng URL của Cloudinary
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
          ${imagelink_square_url}, 
          ${imagelink_portrait_url}, 
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
