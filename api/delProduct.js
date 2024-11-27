import { neon } from '@neondatabase/serverless';
import redis from 'redis';

const sql = neon(process.env.DATABASE_URL);
const redisClient = redis.createClient({ url: process.env.REDIS_URL });

redisClient.connect();

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { id } = req.query;

    try {
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing product ID',
        });
      }

      const result = await sql`
        DELETE FROM products
        WHERE id = ${id}
        RETURNING id;
      `;

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      // Xóa cache khi xóa sản phẩm
      await redisClient.del('products_cache');

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        deletedId: result[0].id,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        details: error.message,
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
    });
  }
}
