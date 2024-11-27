// api/del.js
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    if (req.method === 'DELETE') {
      const { id } = req.query;

      const result = await sql`
        DELETE FROM states WHERE id = ${id} RETURNING id
      `;
      
      if (result.length !== 0) {
        res.status(200).json({ message: `State with id ${id} deleted successfully` });
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
