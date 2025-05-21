import express, { Request, Response } from 'express';
import pool from '../db'; // ADD THIS LINE
import { verifyToken } from '../middleware/auth'; // Assuming your verifyToken middleware

const router = express.Router();

interface UserActivityMetrics {
  spend: number;
  tokens: number;
  requests: number;
}

interface UserActivityLog {
  timestamp: string;
  provider: string | null;
  model: string | null;
  app: string | null; // Will now be populated by api_key.name
  tokens: number;
  cost?: number | null;
  responseTime?: number | null; // Updated to match usage_logs column name
  finish?: string | null; // fallback_reason could be used, or needs clarification
  // api_key_id is no longer explicitly needed in the log entry if we map it to app directly
}

interface UserActivityResponse {
  metrics: UserActivityMetrics;
  activity: UserActivityLog[];
  // pagination info could be added here later
}

// GET /api/user/activity - Fetch user activity metrics and logs
router.get('/activity', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: number }).id;
    if (!userId) {
      return res.status(403).json({ error: 'User ID not found in token' });
    }

    let { 
      from, 
      to, 
      page = '1', 
      limit = '20', 
      provider: filterProvider,
      model: filterModel,
      apiKeyId: filterApiKeyId // For filtering by app/key name
    } = req.query;

    // Validate and default dates
    const toDate = to ? new Date(to as string) : new Date();
    const fromDate = from ? new Date(from as string) : new Date(new Date().setDate(toDate.getDate() - 30));

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD.' });
    }
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Reset queryParams for activity log query, starting with base ones
    const activityQueryParams: any[] = [userId, fromDate, toDate];
    let activityParamIndex = 4;
    let activityWhereClause = '';

    if (filterProvider) {
      activityWhereClause += ` AND ul.provider = $${activityParamIndex}`;
      activityQueryParams.push(filterProvider as string);
      activityParamIndex++;
    }
    if (filterModel) {
      activityWhereClause += ` AND ul.model = $${activityParamIndex}`;
      activityQueryParams.push(filterModel as string);
      activityParamIndex++;
    }
    if (filterApiKeyId) {
      activityWhereClause += ` AND ul.api_key_id = $${activityParamIndex}`;
      activityQueryParams.push(parseInt(filterApiKeyId as string, 10));
      activityParamIndex++;
    }
    
    // Add pagination params last
    activityQueryParams.push(limitNum, offset);

    // Fetch Metrics
    const metricsResult = await pool.query(
      `SELECT
         COALESCE(SUM(cost), 0) AS total_spend,
         COALESCE(SUM(total_tokens), 0) AS total_tokens,
         COUNT(*) AS total_requests
       FROM usage_logs
       WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3`,
      [userId, fromDate, toDate]
    );

    const metrics: UserActivityMetrics = {
      spend: parseFloat(metricsResult.rows[0].total_spend) || 0,
      tokens: parseInt(metricsResult.rows[0].total_tokens, 10) || 0,
      requests: parseInt(metricsResult.rows[0].total_requests, 10) || 0,
    };

    // Fetch Activity Logs (paginated)
    const activityResult = await pool.query(
      `SELECT
         ul.created_at AS timestamp,
         ul.provider,
         ul.model,
         ul.api_key_id,
         ul.total_tokens AS tokens,
         ul.cost,
         CAST(ul.response_time AS TEXT) AS response_time_text,
         ul.fallback_reason AS finish_reason,
         ak.name AS app_name
       FROM usage_logs ul
       LEFT JOIN api_keys ak ON ul.api_key_id = ak.id AND ul.user_id = ak.user_id
       WHERE ul.user_id = $1 AND ul.created_at >= $2 AND ul.created_at <= $3 ${activityWhereClause}
       ORDER BY ul.created_at DESC
       LIMIT $${activityParamIndex} OFFSET $${activityParamIndex + 1}`,
      activityQueryParams
    );

    const activity: UserActivityLog[] = activityResult.rows.map(row => {
      // Log the raw response_time_text value and its type for each row
      console.log(`[userActivity.ts MAP] raw row.response_time_text: ${row.response_time_text}, type: ${typeof row.response_time_text}`);

      const rtString = row.response_time_text;
      const mappedResponseTime = (rtString !== null && typeof rtString !== 'undefined' && !isNaN(parseFloat(rtString))) 
        ? Math.round(parseFloat(rtString) * 1000) 
        : null;
      
      // Log the processed responseTime
      console.log(`[userActivity.ts MAP] mappedResponseTime from text: ${mappedResponseTime}`);

      return {
        timestamp: row.timestamp.toISOString(),
        provider: row.provider,
        model: row.model,
        api_key_id: row.api_key_id,
        app: row.app_name,
        tokens: parseInt(row.tokens, 10),
        cost: row.cost ? parseFloat(row.cost) : null,
        responseTime: mappedResponseTime,
        finish: row.finish_reason,
      };
    });
    
    // Fetch total count for pagination (with filters)
    // Reset queryParams for total count, just need user, dates, and filters
    const totalCountQueryParams: any[] = [userId, fromDate, toDate];
    let totalCountParamIndex = 4;
    let totalCountWhereClause = '';
    if (filterProvider) {
      totalCountWhereClause += ` AND provider = $${totalCountParamIndex}`;
      totalCountQueryParams.push(filterProvider as string);
      totalCountParamIndex++;
    }
    if (filterModel) {
      totalCountWhereClause += ` AND model = $${totalCountParamIndex}`;
      totalCountQueryParams.push(filterModel as string);
      totalCountParamIndex++;
    }
    if (filterApiKeyId) {
      totalCountWhereClause += ` AND api_key_id = $${totalCountParamIndex}`;
      totalCountQueryParams.push(parseInt(filterApiKeyId as string, 10));
      // totalCountParamIndex++; // No need to increment here as it's the last one for this query
    }

    const totalActivityResult = await pool.query(
        `SELECT COUNT(*) FROM usage_logs WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3 ${totalCountWhereClause}`,
        totalCountQueryParams
    );
    const totalLogs = parseInt(totalActivityResult.rows[0].count, 10);

    const response: UserActivityResponse & { totalPages: number; currentPage: number } = {
      metrics,
      activity,
      totalPages: Math.ceil(totalLogs / limitNum),
      currentPage: pageNum,
    };

    // --- Debug Log --- Added
    console.log('[DEBUG] Activity API Response Data:', JSON.stringify(response, null, 2));
    // --- End Debug Log ---

    res.json(response);

  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

// GET /api/user/activity/export - Export user activity logs as CSV
router.get('/activity/export', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: number }).id;
    if (!userId) {
      return res.status(403).json({ error: 'User ID not found in token' });
    }

    let { 
      from, 
      to, 
      provider: filterProvider,
      model: filterModel,
      apiKeyId: filterApiKeyId 
    } = req.query;

    const toDate = to ? new Date(to as string) : new Date();
    const fromDate = from ? new Date(from as string) : new Date(new Date().setDate(toDate.getDate() - 30));

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format for export. Please use YYYY-MM-DD.' });
    }
    
    const queryParams: any[] = [userId, fromDate, toDate];
    let whereClause = '';
    let paramIndex = 4;

    if (filterProvider) {
      whereClause += ` AND ul.provider = $${paramIndex}`;
      queryParams.push(filterProvider as string);
      paramIndex++;
    }
    if (filterModel) {
      whereClause += ` AND ul.model = $${paramIndex}`;
      queryParams.push(filterModel as string);
      paramIndex++;
    }
    if (filterApiKeyId) {
      whereClause += ` AND ul.api_key_id = $${paramIndex}`;
      queryParams.push(parseInt(filterApiKeyId as string, 10));
      paramIndex++;
    }

    // Fetch ALL Activity Logs (no pagination for export)
    const activityResult = await pool.query(
      `SELECT
         ul.created_at AS timestamp,
         ul.provider,
         ul.model,
         ul.api_key_id,
         ak.name AS app_name,
         ul.prompt_tokens,
         ul.completion_tokens,
         ul.total_tokens AS tokens,
         ul.cost,
         ul.response_time AS responseTime,
         ul.fallback_reason AS finish
       FROM usage_logs ul
       LEFT JOIN api_keys ak ON ul.api_key_id = ak.id AND ul.user_id = ak.user_id
       WHERE ul.user_id = $1 AND ul.created_at >= $2 AND ul.created_at <= $3 ${whereClause}
       ORDER BY ul.created_at DESC`,
      queryParams
    );

    // Convert to CSV
    const csvHeader = ["Timestamp", "Provider", "Model", "App/Key Name", "Prompt Tokens", "Completion Tokens", "Total Tokens", "Cost", "Response Time (ms)", "Details (Finish Reason)"].join(',');
    const csvRows = activityResult.rows.map(row => [
      new Date(row.timestamp).toLocaleString(), // Format timestamp
      row.provider || 'N/A',
      row.model || 'N/A',
      row.app_name || 'N/A',
      row.api_key_id || 'N/A',
      row.prompt_tokens || 0,
      row.completion_tokens || 0,
      row.tokens || 0,
      row.cost ? row.cost.toFixed(4) : '0.0000',
      (row.responseTime !== null && typeof row.responseTime !== 'undefined' && !isNaN(parseFloat(row.responseTime.toString()))) ? Math.round(parseFloat(row.responseTime.toString()) * 1000) : 'N/A',
      row.finish || 'N/A'
    ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')); // Escape quotes and wrap in quotes

    const csvData = [csvHeader, ...csvRows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fusion_activity_export.csv"');
    res.status(200).send(csvData);

  } catch (error) {
    console.error('Error exporting user activity:', error);
    res.status(500).json({ error: 'Failed to export user activity' });
  }
});

export default router; 