import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Chỉ xử lý yêu cầu PUT
  if (req.method === 'PUT') {
    try {
      // Lấy dữ liệu từ payload (req.body)
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

      // Kiểm tra xem ID có được cung cấp hay không
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Product ID is required for update',
        });
      }

      // Thực hiện câu lệnh UPDATE trong bảng `products`
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

      // Kiểm tra xem sản phẩm có tồn tại không
      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      // Trả về dữ liệu sản phẩm đã được cập nhật
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: result[0],
      });
    } catch (error) {
      console.error('Error updating product:', error);

      // Xử lý lỗi
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        details: error.message,
      });
    }
  } else {
    // Phản hồi khi phương thức không phải PUT
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
