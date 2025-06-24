
import type { NextApiRequest, NextApiResponse } from 'next';

interface ReadEndRequestBody {
  userId: string;
  timestamp: string;
  volume: number;
  rate: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { lessonId } = req.query;
  const { userId, timestamp, volume, rate }: ReadEndRequestBody = req.body;

  console.log('Read-aloud ended:', {
    lessonId,
    userId,
    timestamp,
    volume,
    rate
  });

  res.status(204).end();
}
