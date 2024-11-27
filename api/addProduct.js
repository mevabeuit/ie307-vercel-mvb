import { neon } from '@neondatabase/serverless';
import redis from 'redis';

const sql = neon(process.env.DATABASE_URL);
const redisClient = redis.createClient({ url: process.env.REDIS_URL });

redisClient.connect();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const {
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
      } = req.body;

      const result = await sql`
        INSERT INTO products(
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
          type
        )
        VALUES (
          ${name}, 
          ${description}, 
          ${roasted}, 
          ${imagelink_square}, 
          ${imagelink_portrait}, 
          ${ingredients}, 
          ${special_ingredient}, 
          ${JSON.stringify(prices)}, 
          ${average_rating}, 
          ${ratings_count}, 
          ${favourite}, 
          ${type}
        )
        RETURNING id;
      `;

      // Xóa cache khi thêm sản phẩm
      await redisClient.del('products_cache');

      res.status(201).json({
        success: true,
        message: 'Product added successfully',
        data: result[0],
      });
    } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        details: error.message,
      });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
