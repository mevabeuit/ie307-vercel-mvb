import { neon } from '@neondatabase/serverless';
import redisClient from "../utils/redisClient.js";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      const {
        id,
        name,
        description,
        roasted,
        imagelink_square,
        imagelink_portrait,
        ingredients,
        special_ingredient,
        prices,
        type,
      } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Product ID is required for update',
        });
      }

      const result = await sql`
        UPDATE products
        SET
          name = ${name},
          description = ${description},
          roasted = ${roasted},
          imagelink_square = ${imagelink_square},
          imagelink_portrait = ${imagelink_portrait},
          ingredients = ${ingredients},
          special_ingredient = ${special_ingredient},
          prices = ${JSON.stringify(prices)},
          type = ${type}
        WHERE id = ${id}
        RETURNING *;
      `;

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      // Xóa cache khi cập nhật sản phẩm
      await redisClient.del('products_cache');

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: result[0],
      });
    } catch (error) {
      console.error('Error updating product:', error);
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
