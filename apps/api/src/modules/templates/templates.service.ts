import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TemplatesService {
  private readonly jwtSecret: string;

  constructor(private readonly db: DbService) {
    this.jwtSecret = process.env.JWT_SECRET || 'bexo-super-secret-jwt-key-2026';
  }

  async getTemplates() {
    const res = await this.db.query('SELECT * FROM templates WHERE is_active = true;');
    return res.rows;
  }

  async getThemesForTemplate(templateId: string) {
    const res = await this.db.query('SELECT * FROM theme_variants WHERE template_id = $1;', [templateId]);
    return res.rows;
  }

  /**
   * Generates a short-lived (15 minutes) preview token for draft comparison.
   */
  async generatePreviewToken(userId: string): Promise<{ token: string }> {
    const token = jwt.sign({ sub: userId, type: 'preview' }, this.jwtSecret, { expiresIn: '15m' });
    
    // Save draft token on portfolio row
    await this.db.query(
      'INSERT INTO portfolios (user_id, handle, draft_preview_token) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET draft_preview_token = EXCLUDED.draft_preview_token;',
      [userId, `temp-handle-${userId.substring(0, 8)}`, token]
    );

    return { token };
  }

  /**
   * Resolves a draft preview token, fetching all unpublished wizard sections.
   */
  async resolvePreviewToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      if (decoded.type !== 'preview') {
        throw new UnauthorizedException('Invalid token type.');
      }

      const userId = decoded.sub;

      // 1. Fetch draft portfolio config
      const portfolioRes = await this.db.query(
        'SELECT * FROM portfolios WHERE user_id = $1;',
        [userId]
      );
      if (portfolioRes.rows.length === 0) {
        throw new NotFoundException('Portfolio configuration not found.');
      }

      const portfolio = portfolioRes.rows[0];

      // 2. Fetch profile details
      const profileRes = await this.db.query(
        'SELECT * FROM profiles WHERE user_id = $1;',
        [userId]
      );
      if (profileRes.rows.length === 0) {
        throw new NotFoundException('Profile not found.');
      }

      const profile = profileRes.rows[0];

      // 3. Fetch all profile sections
      const sectionsRes = await this.db.query(
        'SELECT type, entries FROM profile_sections WHERE profile_id = $1;',
        [profile.id]
      );

      // Map sections to a key-value dictionary
      const sections: Record<string, any[]> = {};
      sectionsRes.rows.forEach(row => {
        sections[row.type] = row.entries;
      });

      return {
        portfolio,
        profile,
        sections,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired draft preview token.');
    }
  }
}
