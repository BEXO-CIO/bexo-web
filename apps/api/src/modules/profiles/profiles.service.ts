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

  async patchProfile(userId: string, data: { headline?: string; career_goal?: string; bio?: string }) {
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
}
