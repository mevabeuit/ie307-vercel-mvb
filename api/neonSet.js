// api/set.js
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, state } = req.body;

    try {
      const result = await sql`
        INSERT INTO states (username, state)
        VALUES (${username}, ${state}})
        ON CONFLICT (username) DO UPDATE SET state = ${state}
        RETURNING *
      `;
      res.status(200).json({ message: 'State saved successfully' });
    } catch (error) {
      console.error('Error saving state:', error);
      res.status(500).json({ error: 'Failed to save state' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
