import dotenv from 'dotenv';
dotenv.config();

import * as mysql from 'mysql2/promise';

export interface User {
  id: number;
  email: string;
  password_hash: string | null;
  name: string;
  role: 'user' | 'admin' | 'employer';
  email_verified: boolean;
  auth_provider: 'local' | 'google' | 'linkedin';
  provider_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary_min?: number;
  salary_max?: number;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  work_style: 'remote' | 'hybrid' | 'onsite';
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
  created_by: number; // User ID who created the job
  created_at: string;
  updated_at: string;
  is_active: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: number | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
}

export interface Notification {
  id: number;
  user_id: number;
  type: 'job_approved' | 'job_rejected' | 'general';
  title: string;
  message: string;
  related_job_id?: number | null;
  is_read: boolean;
  created_at: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  phone?: string;
  address?: string;
  bio?: string;
  skills: string; // JSON string of skills array
  experience_years?: number;
  education?: string;
  resume_url?: string;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: number;
  job_id: number;
  user_id: number;
  cover_letter?: string;
  resume_url?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_at: string;
  updated_at: string;
}

export class DatabaseManager {
  private connection: mysql.Connection | null = null;
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'find_job_red',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      timezone: '+00:00'
    });
  }

  async getConnection(): Promise<mysql.PoolConnection> {
    return await this.pool.getConnection();
  }

  async query(sql: string, values?: any[]): Promise<any> {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute(sql, values);
      return rows;
    } catch (error: any) {
      console.error('❌ Database query error:', {
        message: error.message,
        code: error.code,
        sql: sql.substring(0, 100) + '...',
        values: values
      });
      throw error;
    } finally {
      connection.release();
    }
  }

  async execute(sql: string, values?: any[]): Promise<any> {
    const connection = await this.getConnection();
    try {
      const [result] = await connection.execute(sql, values);
      return result;
    } catch (error: any) {
      console.error('❌ Database execute error:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sql: sql.substring(0, 100) + '...'
      });
      throw error;
    } finally {
      connection.release();
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  // Legacy method for compatibility
  getDb() {
    return {
      prepare: (sql: string) => {
        return {
          get: async (...params: any[]) => {
            const result = await this.query(sql, params);
            return result[0];
          },
          all: async (...params: any[]) => {
            return await this.query(sql, params);
          },
          run: async (...params: any[]) => {
            const result = await this.execute(sql, params);
            return {
              lastInsertRowid: result.insertId,
              lastInsertId: result.insertId,
              changes: result.affectedRows
            };
          }
        };
      }
    };
  }
}

export const dbManager = new DatabaseManager();
