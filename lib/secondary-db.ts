import { createClient } from '@supabase/supabase-js';

// Get secondary Supabase configuration from environment
const secondarySupabaseUrl = process.env.SECONDARY_SUPABASE_URL;
const secondarySupabaseKey = process.env.SECONDARY_SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client for secondary database
let secondaryClient: ReturnType<typeof createClient> | null = null;

function getSecondaryClient() {
  if (!secondarySupabaseUrl) {
    throw new Error('SECONDARY_SUPABASE_URL environment variable is not set');
  }
  if (!secondarySupabaseKey) {
    throw new Error('SECONDARY_SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  }

  if (!secondaryClient) {
    secondaryClient = createClient(secondarySupabaseUrl, secondarySupabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return secondaryClient;
}

export interface RowCountStats {
  currentCount: number;
  weekAgoCount: number;
  growth: number;
  growthPercent: number;
}

/**
 * Get row count from a table in the secondary database
 * Also calculates growth since last week
 */
export async function getRowCountStats(
  tableName: string
): Promise<RowCountStats> {
  const supabase = getSecondaryClient();

  try {
    // Sanitize table name to prevent SQL injection
    // Only allow alphanumeric, underscore characters
    const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
    
    // Get current count using Supabase RPC or direct query
    // First, try to get total count
    const { count: currentCount, error: countError } = await supabase
      .from(sanitizedTableName)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    const current = currentCount || 0;

    // Get count from one week ago
    // Try common timestamp column names
    const timestampColumns = ['created_at', 'updated_at', 'createdAt', 'updatedAt', 'timestamp', 'date'];
    
    let weekAgoCount = 0;
    let foundColumn = false;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoISO = oneWeekAgo.toISOString();

    for (const col of timestampColumns) {
      try {
        const { count, error } = await supabase
          .from(sanitizedTableName)
          .select('*', { count: 'exact', head: true })
          .lte(col, oneWeekAgoISO);

        if (!error && count !== null) {
          weekAgoCount = count;
          foundColumn = true;
          break;
        }
      } catch (e) {
        // Column doesn't exist or query failed, try next one
        continue;
      }
    }

    // If no timestamp column found, we can't calculate growth
    // Just return current count with 0 growth
    if (!foundColumn) {
      return {
        currentCount: current,
        weekAgoCount: current,
        growth: 0,
        growthPercent: 0,
      };
    }

    const growth = current - weekAgoCount;
    const growthPercent = weekAgoCount > 0 ? (growth / weekAgoCount) * 100 : 0;

    return {
      currentCount: current,
      weekAgoCount,
      growth,
      growthPercent,
    };
  } catch (error) {
    console.error('Error fetching row count stats:', error);
    throw error;
  }
}

/**
 * Simple row count without growth calculation
 */
export async function getRowCount(tableName: string): Promise<number> {
  const supabase = getSecondaryClient();

  try {
    // Sanitize table name to prevent SQL injection
    const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
    
    const { count, error } = await supabase
      .from(sanitizedTableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error fetching row count:', error);
    throw error;
  }
}

