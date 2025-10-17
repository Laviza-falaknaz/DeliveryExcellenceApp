import { getConnection, sql } from './db';
import type { Request } from 'express';

export async function logError(error: Error, req?: Request, userId?: number) {
  try {
    const pool = await getConnection();
    await pool.request()
      .input('userId', sql.Int, userId || null)
      .input('errorType', sql.NVarChar, error.name)
      .input('errorMessage', sql.NVarChar, error.message)
      .input('stackTrace', sql.NVarChar, error.stack || null)
      .input('requestUrl', sql.NVarChar, req?.originalUrl || null)
      .input('requestMethod', sql.NVarChar, req?.method || null)
      .input('ipAddress', sql.NVarChar, req?.ip || null)
      .input('userAgent', sql.NVarChar, req?.get('user-agent') || null)
      .query(`
        INSERT INTO error_logs (user_id, error_type, error_message, stack_trace, request_url, request_method, ip_address, user_agent)
        VALUES (@userId, @errorType, @errorMessage, @stackTrace, @requestUrl, @requestMethod, @ipAddress, @userAgent)
      `);
  } catch (logError) {
    console.error('Failed to log error to database:', logError);
  }
}

export async function logSystem(level: 'info' | 'warn' | 'error' | 'debug', message: string, metadata?: any) {
  try {
    const pool = await getConnection();
    await pool.request()
      .input('level', sql.NVarChar, level)
      .input('message', sql.NVarChar, message)
      .input('metadata', sql.NVarChar, metadata ? JSON.stringify(metadata) : null)
      .query(`
        INSERT INTO system_logs (log_level, message, metadata)
        VALUES (@level, @message, @metadata)
      `);
  } catch (logError) {
    console.error('Failed to log system event to database:', logError);
  }
}
