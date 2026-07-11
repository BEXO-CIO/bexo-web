import { Client } from 'pg';

async function runSeed() {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/bexo';
  console.log('Seeding database:', databaseUrl.split('@')[1] || 'localhost');

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    await client.connect();

    console.log('Clearing existing data...');
    await client.query('TRUNCATE users, profiles, profile_sections, assets, entry_links, organizations, activation_keys, templates, theme_variants, portfolios, subscriptions, payments, analytics_events CASCADE;');

    console.log('Seeding templates...');
    const templates = [
      { id: 'minimal', name: 'Minimalist Portfolio', version: '1.0.0', thumbnail_url: 'https://cdn.mybexo.com/templates/minimal.png', tier: 'free' },
      { id: 'editorial', name: 'Editorial Portfolio', version: '1.0.0', thumbnail_url: 'https://cdn.mybexo.com/templates/editorial.png', tier: 'free' },
      { id: 'bold', name: 'Bold Portfolio', version: '1.0.0', thumbnail_url: 'https://cdn.mybexo.com/templates/bold.png', tier: 'paid' },
    ];

    for (const t of templates) {
      await client.query(
        'INSERT INTO templates (id, name, version, thumbnail_url, tier) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING;',
        [t.id, t.name, t.version, t.thumbnail_url, t.tier]
      );
    }

    console.log('Seeding theme variants...');
    const themeVariants = [
      {
        template_id: 'minimal',
        name: 'Classic Cream',
        tokens: {
          colors: { primary: '#B24C3B', background: '#F9F6F0', text: '#1E1E1E' },
          fonts: { heading: 'Playfair Display', body: 'Inter' }
        }
      },
      {
        template_id: 'minimal',
        name: 'Dark Slate',
        tokens: {
          colors: { primary: '#3B82F6', background: '#1E293B', text: '#F8FAFC' },
          fonts: { heading: 'Inter', body: 'Inter' }
        }
      },
      {
        template_id: 'editorial',
        name: 'Warm Ivory',
        tokens: {
          colors: { primary: '#D97706', background: '#FFFDF9', text: '#27272A' },
          fonts: { heading: 'Lora', body: 'PT Serif' }
        }
      }
    ];

    for (const tv of themeVariants) {
      await client.query(
        'INSERT INTO theme_variants (template_id, name, tokens) VALUES ($1, $2, $3);',
        [tv.template_id, tv.name, JSON.stringify(tv.tokens)]
      );
    }

    console.log('Seeding organizations...');
    const orgResult = await client.query(
      'INSERT INTO organizations (name, contact_email, plan_type) VALUES ($1, $2, $3) RETURNING id;',
      ['BEXO Demo College', 'partner@democollege.edu', 'enterprise']
    );
    const orgId = orgResult.rows[0].id;

    console.log('Seeding activation keys...');
    const keys = [
      { code: 'BEXO-DEMO-KEY1', org_id: orgId, batch_id: '809b0b41-949e-4a67-b50a-cd07bf0167c1', status: 'unused', expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { code: 'BEXO-DEMO-KEY2', org_id: orgId, batch_id: '809b0b41-949e-4a67-b50a-cd07bf0167c1', status: 'unused', expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { code: 'BEXO-DEMO-KEY3', org_id: orgId, batch_id: '809b0b41-949e-4a67-b50a-cd07bf0167c1', status: 'unused', expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    ];

    for (const k of keys) {
      await client.query(
        'INSERT INTO activation_keys (code, org_id, batch_id, status, expires_at) VALUES ($1, $2, $3, $4, $5);',
        [k.code, k.org_id, k.batch_id, k.status, k.expires_at]
      );
    }

    console.log('Seeding test users...');
    // Seed verified user
    const userResult = await client.query(
      "INSERT INTO users (phone, phone_verified_at, email, oauth_provider, oauth_id, name, dob) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;",
      ['+919876543210', new Date(), 'student@democollege.edu', 'google', 'google-oauth-12345', 'Kavin Balaji', '2004-05-15']
    );
    const userId = userResult.rows[0].id;

    // Seed profile
    const profileResult = await client.query(
      'INSERT INTO profiles (user_id, headline, career_goal, bio, completion_pct) VALUES ($1, $2, $3, $4, $5) RETURNING id;',
      [userId, 'Aspiring Full Stack Engineer', 'Seeking to build scalable distributed systems', 'I love coding and design.', 80]
    );
    const profileId = profileResult.rows[0].id;

    // Seed profile sections
    const sections = [
      {
        profile_id: profileId,
        type: 'about',
        entries: [{ headline: 'Aspiring Full Stack Engineer', bio: 'I love coding and design.' }],
        reviewed_at: new Date(),
        position: 0
      },
      {
        profile_id: profileId,
        type: 'education',
        entries: [{ degree: 'B.E. Computer Science', college: 'PSG Tech', year: '2026', cgpa: '9.2' }],
        reviewed_at: new Date(),
        position: 1
      },
      {
        profile_id: profileId,
        type: 'projects',
        entries: [{ title: 'BEXO Platform', description: 'Student portfolio builder monorepo.', tech_stack: ['NestJS', 'React', 'Postgres'] }],
        reviewed_at: new Date(),
        position: 2
      }
    ];

    for (const sec of sections) {
      await client.query(
        'INSERT INTO profile_sections (profile_id, type, entries, reviewed_at, position) VALUES ($1, $2, $3, $4, $5);',
        [sec.profile_id, sec.type, sec.entries, sec.reviewed_at, sec.position]
      );
    }

    console.log('Seeding complete.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSeed();
