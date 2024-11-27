// api/del.js
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { username } = req.body;
    try {
      await client.connect();
      const result = await sql`
        DELETE FROM states WHERE username = ${username} RETURNING id
      `;
      if (result.length !== 0) {
        res.status(200).json({ message: 'State deleted successfully' });
      } else {
        res.status(404).json({ error: 'State not found' });
      }
    } catch (error) {
      console.error('Error deleting state:', error);
      res.status(500).json({ error: 'Failed to delete state' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
