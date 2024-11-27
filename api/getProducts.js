import { neon } from '@neondatabase/serverless';
import redis from 'redis';

const sql = neon(process.env.DATABASE_URL);

// Khởi tạo Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL, // Ví dụ: "redis://localhost:6379"
});

redisClient.connect();

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
