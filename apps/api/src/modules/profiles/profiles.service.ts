import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DbService } from '../../db/db.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly db: DbService) {}

  private readonly VALID_SECTION_TYPES = [
    'about',
    'education',
    'projects',
    'experience',
    'certificates',
    'achievements',
    'research',
    'contact'
  ];

  async getProfileByUserId(userId: string) {
    const res = await this.db.query('SELECT * FROM profiles WHERE user_id = $1;', [userId]);
    if (res.rows.length === 0) {
      throw new NotFoundException('Profile not found');
    }
    return res.rows[0];
  }

  async patchProfile(userId: string, data: { headline?: string; career_goal?: string; bio?: string; name?: string; dob?: string; profile_photo_asset_id?: string | null }) {
    // 1. Update user fields (name, dob, profile_photo_asset_id) if provided
    if (data.name !== undefined || data.dob !== undefined || data.profile_photo_asset_id !== undefined) {
      const userFields: string[] = [];
      const userValues: any[] = [];
      let idx = 1;
      
      if (data.name !== undefined) {
        userFields.push(`name = $${idx++}`);
        userValues.push(data.name);
      }
      if (data.dob !== undefined) {
        userFields.push(`dob = $${idx++}`);
        userValues.push(data.dob);
      }
      if (data.profile_photo_asset_id !== undefined) {
        userFields.push(`profile_photo_asset_id = $${idx++}`);
        userValues.push(data.profile_photo_asset_id);
      }
      
      userValues.push(userId);
      await this.db.query(
        `UPDATE users SET ${userFields.join(', ')} WHERE id = $${idx};`,
        userValues
      );
    }

    // 2. Update profile fields
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.headline !== undefined) {
      fields.push(`headline = $${paramIndex++}`);
      values.push(data.headline);
    }
    if (data.career_goal !== undefined) {
      fields.push(`career_goal = $${paramIndex++}`);
      values.push(data.career_goal);
    }
    if (data.bio !== undefined) {
      fields.push(`bio = $${paramIndex++}`);
      values.push(data.bio);
    }

    if (fields.length === 0) {
      return this.getProfileByUserId(userId);
    }

    values.push(userId);
    const queryText = `
      UPDATE profiles 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramIndex} 
      RETURNING *;
    `;

    const res = await this.db.query(queryText, values);
    if (res.rows.length === 0) {
      throw new NotFoundException('Profile not found');
    }
    return res.rows[0];
  }

  async getProfileSection(userId: string, type: string) {
    if (!this.VALID_SECTION_TYPES.includes(type)) {
      throw new BadRequestException(`Invalid section type: ${type}`);
    }

    const profile = await this.getProfileByUserId(userId);

    const res = await this.db.query(
      'SELECT * FROM profile_sections WHERE profile_id = $1 AND type = $2;',
      [profile.id, type]
    );

    if (res.rows.length === 0) {
      return { profile_id: profile.id, type, entries: [], reviewed_at: null, position: 0 };
    }

    return res.rows[0];
  }

  async patchProfileSection(userId: string, type: string, entries: any[], reviewedAt?: Date | null) {
    if (!this.VALID_SECTION_TYPES.includes(type)) {
      throw new BadRequestException(`Invalid section type: ${type}`);
    }

    const profile = await this.getProfileByUserId(userId);

    // Format entries as stringified JSON elements for PG jsonb[] conversion
    const entriesJsonArray = entries.map(e => JSON.stringify(e));

    await this.db.transaction(async (client) => {
      // Upsert the profile section record
      await client.query(
        `INSERT INTO profile_sections (profile_id, type, entries, reviewed_at) 
         VALUES ($1, $2, $3::jsonb[], $4)
         ON CONFLICT (profile_id, type) 
         DO UPDATE SET entries = EXCLUDED.entries, reviewed_at = EXCLUDED.reviewed_at;`,
        [profile.id, type, entriesJsonArray, reviewedAt || null]
      );

      // Recalculate completion score
      const sectionsRes = await client.query(
        'SELECT type, reviewed_at FROM profile_sections WHERE profile_id = $1;',
        [profile.id]
      );

      const reviewedCount = sectionsRes.rows.filter(s => s.reviewed_at !== null).length;
      
      // 8 sections, each reviewed section counts for 12.5% (total 100%)
      const score = Math.round((reviewedCount / 8) * 100);

      await client.query(
        'UPDATE profiles SET completion_pct = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;',
        [score, profile.id]
      );
    });

    return this.getProfileSection(userId, type);
  }

  async getCompletionScore(userId: string): Promise<{ score: number }> {
    const profile = await this.getProfileByUserId(userId);
    return { score: profile.completion_pct };
  }

  /**
   * Fetches the user's portfolio configuration row (or returns null if none exists).
   */
  async getPortfolioByUserId(userId: string) {
    const res = await this.db.query('SELECT * FROM portfolios WHERE user_id = $1;', [userId]);
    return res.rows.length > 0 ? res.rows[0] : null;
  }

  async publishPortfolio(userId: string, data?: { handle?: string; selected_template_id?: string; selected_theme_id?: string | null }) {
    // 1. Get existing portfolio
    const existCheck = await this.db.query('SELECT * FROM portfolios WHERE user_id = $1;', [userId]);
    
    let handle = data?.handle?.trim().toLowerCase();
    let templateId = data?.selected_template_id;
    let themeId = data?.selected_theme_id;

    if (existCheck.rows.length > 0) {
      const existing = existCheck.rows[0];
      if (!handle) handle = existing.handle;
      if (!templateId) templateId = existing.selected_template_id || 'editorial';
      if (!themeId) themeId = existing.selected_theme_id;
    }

    // 2. Generate slug if handle is empty
    if (!handle) {
      const userRes = await this.db.query('SELECT name FROM users WHERE id = $1;', [userId]);
      const name = userRes.rows[0]?.name;
      if (name) {
        handle = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (!handle || handle.length < 3) {
        handle = `user-${userId.substring(0, 8)}`;
      }

      // Ensure uniqueness
      let uniqueHandle = handle;
      let suffix = 1;
      while (true) {
        const taken = await this.db.query('SELECT id FROM portfolios WHERE handle = $1 AND user_id != $2;', [uniqueHandle, userId]);
        if (taken.rows.length === 0) {
          handle = uniqueHandle;
          break;
        }
        uniqueHandle = `${handle}-${suffix++}`;
      }
    } else {
      // Validate provided handle
      if (!/^[a-z0-9-]+$/.test(handle)) {
        throw new BadRequestException('Handle can only contain lowercase letters, numbers, and hyphens.');
      }
      if (handle.length < 3 || handle.length > 50) {
        throw new BadRequestException('Handle must be between 3 and 50 characters.');
      }

      // Check if taken
      const takenCheck = await this.db.query(
        'SELECT user_id FROM portfolios WHERE handle = $1 AND user_id != $2;',
        [handle, userId]
      );
      if (takenCheck.rows.length > 0) {
        throw new BadRequestException('This portfolio handle is already taken by another user.');
      }
    }

    if (!templateId) {
      templateId = 'editorial';
    }

    const now = new Date();
    let portfolioRow;

    if (existCheck.rows.length > 0) {
      const res = await this.db.query(
        `UPDATE portfolios 
         SET handle = $1, selected_template_id = $2, selected_theme_id = $3, is_published = true, published_at = $4
         WHERE user_id = $5 
         RETURNING *;`,
        [handle, templateId, themeId || null, now, userId]
      );
      portfolioRow = res.rows[0];
    } else {
      const res = await this.db.query(
        `INSERT INTO portfolios (user_id, handle, selected_template_id, selected_theme_id, is_published, published_at)
         VALUES ($1, $2, $3, $4, true, $5) 
         RETURNING *;`,
        [userId, handle, templateId, themeId || null, now]
      );
      portfolioRow = res.rows[0];
    }

    return {
      success: true,
      portfolio: portfolioRow,
    };
  }
}
