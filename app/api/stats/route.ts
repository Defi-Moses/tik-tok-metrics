import { NextResponse } from 'next/server';
import { getRowCountStats } from '@/lib/secondary-db';

export async function GET() {
  try {
    // Get table name from environment variable or use default
    const tableName = process.env.SECONDARY_DB_TABLE_NAME || 'users';

    const stats = await getRowCountStats(tableName);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

