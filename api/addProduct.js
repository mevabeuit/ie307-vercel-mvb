import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Chỉ xử lý yêu cầu POST
  if (req.method === 'POST') {
    try {
      // Lấy dữ liệu từ payload (req.body)
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

      // Thực hiện câu lệnh INSERT vào bảng `products`
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

      // Nếu việc thêm thành công, trả lại dữ liệu
      res.status(201).json({
        success: true,
        message: 'Product added successfully',
        data: result[0], // Trả lại ID của sản phẩm mới
      });
    } catch (error) {
      console.error('Error adding product:', error);

      // Xử lý lỗi
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        details: error.message,
      });
    }
  } else {
    // Phản hồi khi phương thức không phải POST
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
