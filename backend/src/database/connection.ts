import * as sql from 'mssql';
import { MemorySqlEngine } from './sqlEngine';

export interface DatabaseConfig {
  connectionString?: string;
  server?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  isMemoryMode: boolean;
}

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: sql.ConnectionPool | null = null;
  private memoryEngine: MemorySqlEngine | null = null;
  private config: DatabaseConfig;
  private isConnected = false;

  private constructor() {
    const connStr = process.env.AZURE_SQL_CONNECTION_STRING || '';
    const server = process.env.DB_SERVER || '';
    const database = process.env.DB_DATABASE || '';
    const user = process.env.DB_USER || '';
    const password = process.env.DB_PASSWORD || '';
    const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433;

    // Use memory engine if no Azure SQL credentials / connection string is provided
    const hasSqlCredentials = !!connStr || (!!server && !!database && !!user && !!password);

    this.config = {
      connectionString: connStr || undefined,
      server: server || undefined,
      port,
      database: database || undefined,
      user: user || undefined,
      password: password || undefined,
      isMemoryMode: !hasSqlCredentials,
    };
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isConnected) return;

    if (this.config.isMemoryMode) {
      this.memoryEngine = new MemorySqlEngine();
      this.isConnected = true;
      return;
    }

    try {
      if (this.config.connectionString) {
        this.pool = await new sql.ConnectionPool(this.config.connectionString).connect();
      } else {
        this.pool = await new sql.ConnectionPool({
          server: this.config.server!,
          port: this.config.port,
          database: this.config.database!,
          user: this.config.user!,
          password: this.config.password!,
          options: {
            encrypt: true,
            trustServerCertificate: true,
          },
        }).connect();
      }
      this.isConnected = true;
    } catch (err) {
      // Fallback safely to memory engine if external connection fails,
      // avoiding service outage in local environment while logging sanitized notice
      console.warn('Azure SQL connection unavailable; falling back to local SQL engine.');
      this.config.isMemoryMode = true;
      this.memoryEngine = new MemorySqlEngine();
      this.isConnected = true;
    }
  }

  public isMemory(): boolean {
    return this.config.isMemoryMode;
  }

  public getMemoryEngine(): MemorySqlEngine {
    if (!this.memoryEngine) {
      this.memoryEngine = new MemorySqlEngine();
    }
    return this.memoryEngine;
  }

  public async getPool(): Promise<sql.ConnectionPool> {
    if (!this.isConnected || !this.pool) {
      await this.initialize();
    }
    if (!this.pool) {
      throw new Error('SQL Connection pool not initialized');
    }
    return this.pool;
  }

  public async isHealthy(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }
      if (this.config.isMemoryMode) {
        return true;
      }
      if (this.pool && this.pool.connected) {
        const req = this.pool.request();
        await req.query('SELECT 1 AS Health');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
    this.isConnected = false;
  }
}

export const db = DatabaseConnection.getInstance();
