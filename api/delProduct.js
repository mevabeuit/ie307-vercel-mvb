import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { id } = req.query; // Lấy ID từ query string hoặc req.body nếu gửi từ body

    try {
      // Kiểm tra nếu không có ID
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing product ID',
        });
      }

      // Xóa sản phẩm theo ID
      const result = await sql`
        DELETE FROM products
        WHERE id = ${id}
        RETURNING id;
      `;

      // Nếu không tìm thấy sản phẩm cần xóa
      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      // Trả về phản hồi thành công
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        deletedId: result[0].id,
      });
    } catch (error) {
      console.error('Error deleting product:', error);

      // Xử lý lỗi
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        details: error.message,
      });
    }
  } else {
    // Phương thức HTTP không được hỗ trợ
    res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
    });
  }
}
