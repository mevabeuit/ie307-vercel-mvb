import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  const { username } = req.query; // Lấy username từ query parameters

  if (!username) {
    return res.status(400).json({
      success: false,
      error: 'Username is required',
    });
  }

  try {
    // Truy vấn rolename dựa trên username
    const result = await sql`
      SELECT r.rolename 
      FROM users u
      LEFT JOIN roles r ON u.id = r.userid
      WHERE u.username = ${username}
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Trả kết quả về dưới dạng JSON
    res.status(200).json({
      success: true,
      data: result[0], // Trả về rolename của user
    });
  } catch (error) {
    console.error('Error:', error);

    // Xử lý lỗi
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      details: error.message,
    });
  }
}
