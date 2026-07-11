import { Pool } from 'pg';
import Redis from 'ioredis';

// Database connection singleton pool
const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/bexo_dev';
export const pgPool = new Pool({
  connectionString: databaseUrl,
});

// Redis connection singleton client
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redis = new Redis(redisUrl);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PortfolioData {
  portfolio: {
    id: string;
    user_id: string;
    handle: string;
    selected_template_id: string | null;
    selected_theme_id: string | null;
    is_published: boolean;
    is_indexable: boolean;
  };
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string;
    dob: string | null;
    profile_photo_asset_id: string | null;
  };
  profile: {
    id: string;
    headline: string | null;
    career_goal: string | null;
    bio: string | null;
    completion_pct: number;
  };
  sections: Record<string, any[]>;
  assets: any[];
  themeTokens: Record<string, any> | null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Fetch theme variant tokens by ID.
 */
async function getThemeTokens(
  client: { query: (sql: string, params?: any[]) => Promise<any> },
  themeId: string | null,
): Promise<Record<string, any> | null> {
  if (!themeId) return null;
  const res = await client.query(
    `SELECT tokens FROM theme_variants WHERE id = $1;`,
    [themeId],
  );
  return res.rows.length > 0 ? res.rows[0].tokens : null;
}

/**
 * Core fetch — shared by both handle-lookup and userId-lookup paths.
 * Joins users → profiles → profile_sections → assets in a single
 * transaction, and resolves theme tokens.
 */
async function buildPortfolioPayload(
  userId: string,
  portfolioRow: any,
  templateOverride: string | null,
): Promise<PortfolioData> {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');

    // User
    const userRes = await client.query(
      `SELECT id, name, email, phone, dob, profile_photo_asset_id
       FROM users WHERE id = $1;`,
      [userId],
    );
    const user = userRes.rows[0];

    // Profile
    const profileRes = await client.query(
      `SELECT id, headline, career_goal, bio, completion_pct
       FROM profiles WHERE user_id = $1;`,
      [userId],
    );
    const profile = profileRes.rows[0];

    // Sections — ordered by position
    const sectionsRes = await client.query(
      `SELECT type, entries FROM profile_sections
       WHERE profile_id = $1 ORDER BY position ASC;`,
      [profile.id],
    );
    const sections: Record<string, any[]> = {};
    for (const row of sectionsRes.rows) {
      sections[row.type] = row.entries;
    }

    // Assets
    const assetsRes = await client.query(
      `SELECT id, section_type, entry_id, kind, cdn_asset_id, size_bytes
       FROM assets WHERE user_id = $1;`,
      [userId],
    );
    const assets = assetsRes.rows;

    // Theme tokens
    const themeTokens = await getThemeTokens(client, portfolioRow.selected_theme_id);

    await client.query('COMMIT');

    return {
      portfolio: {
        ...portfolioRow,
        selected_template_id: templateOverride ?? portfolioRow.selected_template_id,
      },
      user,
      profile,
      sections,
      assets,
      themeTokens,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch a published portfolio by its public handle.
 * Used by /p/[handle] and the subdomain [handle] route.
 * Results are cached in Redis for 10 minutes.
 */
export async function getPortfolioData(handle: string): Promise<PortfolioData | null> {
  const cacheKey = `portfolio:handle:${handle}`;

  // 1. Redis hot cache
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`[Cache Hit] Portfolio data for handle: ${handle}`);
      return JSON.parse(cached) as PortfolioData;
    }
  } catch (err) {
    console.error(`[Redis Error] Failed to read cache:`, err);
  }

  console.log(`[Cache Miss] Querying PostgreSQL for handle: ${handle}`);

  // 2. PostgreSQL — find published portfolio
  const portfolioRes = await pgPool.query(
    `SELECT id, user_id, handle, selected_template_id, selected_theme_id,
            is_published, is_indexable
     FROM portfolios WHERE handle = $1 AND is_published = true;`,
    [handle],
  );

  if (portfolioRes.rows.length === 0) {
    return null;
  }

  const portfolio = portfolioRes.rows[0];
  const data = await buildPortfolioPayload(portfolio.user_id, portfolio, null);

  // 3. Write-back to Redis (600s / 10 min)
  try {
    await redis.setex(cacheKey, 600, JSON.stringify(data));
    console.log(`[Cache Write] Cached portfolio data for handle: ${handle}`);
  } catch (err) {
    console.error(`[Redis Error] Failed to write cache:`, err);
  }

  return data;
}

/**
 * Fetch portfolio data by user ID for the live preview route.
 * Does NOT require `is_published = true` — this lets the web app's
 * template picker render a preview of draft data.
 *
 * If `templateOverride` is supplied it replaces the stored template
 * selection so the user can preview any template before publishing.
 *
 * Results are NOT cached (previews should always show latest data).
 */
export async function getPortfolioDataByUserId(
  userId: string,
  templateOverride: string | null = null,
): Promise<PortfolioData | null> {
  // Check user exists
  const userCheck = await pgPool.query(
    `SELECT id FROM users WHERE id = $1;`,
    [userId],
  );
  if (userCheck.rows.length === 0) return null;

  // Check profile exists
  const profileCheck = await pgPool.query(
    `SELECT id FROM profiles WHERE user_id = $1;`,
    [userId],
  );
  if (profileCheck.rows.length === 0) return null;

  // Try to find an existing portfolio row — may not exist yet if user
  // hasn't published before. Synthesise a stub in that case.
  const portfolioRes = await pgPool.query(
    `SELECT id, user_id, handle, selected_template_id, selected_theme_id,
            is_published, is_indexable
     FROM portfolios WHERE user_id = $1;`,
    [userId],
  );

  const portfolioRow = portfolioRes.rows.length > 0
    ? portfolioRes.rows[0]
    : {
        id: null,
        user_id: userId,
        handle: '',
        selected_template_id: templateOverride || 'minimal',
        selected_theme_id: null,
        is_published: false,
        is_indexable: false,
      };

  return buildPortfolioPayload(userId, portfolioRow, templateOverride);
}
