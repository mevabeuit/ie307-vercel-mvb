import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { username } = req.query;

    try {
      const result = await sql`
        SELECT value FROM states WHERE username = ${username} 
      `;
      if (result.rows.length !== 0) {
        res.status(200).json(result.rows[0].state);
      } else {
        res.status(404).json({ error: 'State not found' });
      }
    } catch (error) {
      console.error('Error loading state:', error);
      res.status(500).json({ error: 'Failed to load state' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
