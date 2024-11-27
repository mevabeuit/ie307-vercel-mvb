// api/set.js
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { id, value } = req.body;

      if (!id || !value) {
        return res.status(400).json({ error: 'id and value are required' });
      }

      const result = await sql`
        INSERT INTO states (id, value)
        VALUES (${id}, ${value})
        ON CONFLICT (id) DO UPDATE SET value = ${value}
        RETURNING *
      `;

      res.status(200).json({ id, value: result[0].value });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
