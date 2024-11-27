import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { username } = req.query; // Đổi từ `id` thành `username`

      const result = await sql`
        SELECT value FROM states WHERE id = ${username} 
      `;
      
      if (result.length !== 0) {
        res.status(200).json({ id: username, value: result[0].value }); // Trả về `username` thay vì `id`
      } else {
        res.status(404).json({ error: 'State not found' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
