import { neon } from '@neondatabase/serverless';
import redisClient from "../utils/redisClient.js";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    // Kiểm tra cache trong Redis
    const cacheKey = 'products_cache';
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log('Returning cached data');
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedData), // Dữ liệu đã cache
      });
    }

    // Nếu không có cache, truy vấn cơ sở dữ liệu
    const result = await sql`
      SELECT 
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
      FROM products
    `;

    // Lưu kết quả vào Redis
    await redisClient.set(cacheKey, JSON.stringify(result), {
      EX: 3600, // Cache sẽ hết hạn sau 1 giờ (3600 giây)
    });

    // Trả kết quả
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching products:', error);

    // Xử lý lỗi
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      details: error.message,
    });
  }
}
