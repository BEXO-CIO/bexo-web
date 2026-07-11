import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  onModuleInit() {
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/bexo';
    this.pool = new Pool({
      connectionString: databaseUrl,
      max: 20, // max number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  // Helper to run queries on the pool
  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  // Helper to obtain a client for transactional queries
  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  // Helper to run queries inside a transaction helper
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
