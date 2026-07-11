import React from 'react';
import { PortfolioData } from '../../lib/db';

export function MinimalTemplate({ data }: { data: PortfolioData }) {
  const { user, profile, sections, assets } = data;

  const profilePhotoAsset = user.profile_photo_asset_id
    ? assets.find(a => a.id === user.profile_photo_asset_id)
    : null;

  const avatarUrl = profilePhotoAsset
    ? `${process.env.NEXT_PUBLIC_CDN_BASE_URL || 'http://localhost:9000/bexo-assets'}/${profilePhotoAsset.cdn_asset_id}`
    : null;

  // All section types from migrations.sql
  const about = sections.about || [];
  const education = sections.education || [];
  const experience = sections.experience || [];
  const projects = sections.projects || [];
  const certificates = sections.certificates || [];
  const achievements = sections.achievements || [];
  const research = sections.research || [];
  const contact = sections.contact || [];
  const skills = sections.skills || [];
  const links = sections.links || [];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1A18] font-sans py-16 px-6 sm:px-12 md:px-24">
      <div className="max-w-3xl mx-auto space-y-16">

        {/* ─── Header ─── */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center gap-8 justify-between border-b border-[#DDD0BC]/60 pb-10">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-serif text-[#1C1A18] tracking-tight">
              {user.name || 'Anonymous User'}
            </h1>
            {profile.headline && (
              <p className="text-lg sm:text-xl font-light text-[#C1440E] max-w-xl">
                {profile.headline}
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-[#9B8570]">
              {user.email && <span>{user.email}</span>}
              {user.phone && <span>{user.phone}</span>}
              {user.dob && (
                <span>
                  Born{' '}
                  {new Date(user.dob).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>

          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user.name || 'Profile photo'}
              className="w-28 h-28 rounded-full object-cover border-2 border-[#ECD9C4] shadow-sm flex-shrink-0"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-[#F5EEE4] border-2 border-[#ECD9C4] flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-serif text-[#9B8570]">
                {(user.name || 'A')[0]}
              </span>
            </div>
          )}
        </header>

        {/* ─── About / Bio ─── */}
        {(profile.bio || about.length > 0) && (
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#9B8570]">About</h2>
            {profile.bio && (
              <p className="text-base sm:text-lg leading-relaxed text-[#5C4A35] font-light whitespace-pre-line">
                {profile.bio}
              </p>
            )}
            {profile.career_goal && (
              <p className="text-sm leading-relaxed text-[#9B8570] italic">
                Career Goal: {profile.career_goal}
              </p>
            )}
            {about.map((entry: any, i: number) => (
              <p key={i} className="text-base leading-relaxed text-[#5C4A35] font-light whitespace-pre-line">
                {entry.content || entry.text || entry.description || ''}
              </p>
            ))}
          </section>
        )}

        {/* ─── Experience ─── */}
        {experience.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#9B8570]">Experience</h2>
            <div className="space-y-8">
              {experience.map((exp: any, i: number) => (
                <div key={i} className="group relative space-y-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-lg text-[#1C1A18] group-hover:text-[#C1440E] transition-colors">
                      {exp.role || exp.title}
                    </h3>
                    <span className="text-xs text-[#9B8570] font-mono">
                      {exp.startDate || exp.start_date || exp.duration || ''}{' '}
                      {exp.endDate || exp.end_date ? `— ${exp.endDate || exp.end_date}` : ''}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#5C4A35]">
                    {exp.company || exp.organization}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-[#9B8570] leading-relaxed pt-1">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Education ─── */}
        {education.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#9B8570]">Education</h2>
            <div className="space-y-6">
              {education.map((edu: any, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-[#1C1A18]">
                      {edu.degree || edu.qualification}
                    </h3>
                    <span className="text-xs text-[#9B8570] font-mono">
                      {edu.year || edu.duration || ''}
                    </span>
                  </div>
                  <p className="text-sm text-[#5C4A35]">
                    {edu.school || edu.college || edu.university}
                  </p>
                  {edu.grade && (
                    <p className="text-xs text-[#9B8570] font-mono">
                      Grade: {edu.grade}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Projects ─── */}
        {projects.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#9B8570]">Projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj: any, i: number) => (
                <div key={i} className="p-5 rounded-lg border border-[#DDD0BC]/50 bg-[#FAF8F4] hover:border-[#C1440E]/30 transition-all space-y-3">
                  <h3 className="font-semibold text-[#1C1A18] text-base">
                    {proj.name || proj.title}
                  </h3>
                  {proj.description && (
                    <p className="text-xs text-[#5C4A35] leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                  {proj.url && (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-medium text-[#C1440E] hover:underline"
                    >
                      View Project →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Research & Publications ─── */}
        {research.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#9B8570]">Research & Publications</h2>
            <div className="space-y-6">
              {research.map((res: any, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-[#1C1A18]">
                      {res.title}
                    </h3>
                    {res.year && (
                      <span className="text-xs text-[#9B8570] font-mono">{res.year}</span>
                    )}
                  </div>
                  {(res.authors || res.journal || res.publisher) && (
                    <p className="text-sm text-[#5C4A35] italic">
                      {res.authors || res.journal || res.publisher}
                    </p>
                  )}
                  {res.description && (
                    <p className="text-xs text-[#9B8570] leading-relaxed pt-1">
                      {res.description}
                    </p>
                  )}
                  {res.url && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-medium text-[#C1440E] hover:underline"
                    >
                      Read Paper →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Certificates ─── */}
        {certificates.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#9B8570]">Certificates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certificates.map((cert: any, i: number) => (
                <div key={i} className="p-4 rounded-lg border border-[#DDD0BC]/50 bg-[#FAF8F4] space-y-2">
                  <h3 className="font-semibold text-sm text-[#1C1A18]">
                    {cert.title || cert.name}
                  </h3>
                  {cert.issuer && (
                    <p className="text-xs text-[#5C4A35]">{cert.issuer}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-[#9B8570]">
                    {cert.date && <span>{cert.date}</span>}
                    {cert.credential_id && (
                      <span className="font-mono">ID: {cert.credential_id}</span>
                    )}
                  </div>
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-medium text-[#C1440E] hover:underline"
                    >
                      Verify →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Achievements ─── */}
        {achievements.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#9B8570]">Achievements</h2>
            <div className="space-y-4">
              {achievements.map((ach: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-5 h-5 flex-shrink-0 rounded-full bg-[#C1440E]/10 flex items-center justify-center">
                    <span className="text-[10px] text-[#C1440E]">★</span>
                  </span>
                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-sm text-[#1C1A18]">
                      {ach.title}
                    </h3>
                    {ach.issuer && (
                      <p className="text-xs text-[#5C4A35]">{ach.issuer}</p>
                    )}
                    {ach.year && (
                      <p className="text-xs text-[#9B8570] font-mono">{ach.year}</p>
                    )}
                    {ach.description && (
                      <p className="text-xs text-[#9B8570] leading-relaxed">{ach.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Skills ─── */}
        {skills.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#9B8570]">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((sk: any, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#F5EEE4] border border-[#DDD0BC]/40 text-[#5C4A35]"
                >
                  {sk.name || sk}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ─── Contact ─── */}
        {contact.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#9B8570]">Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contact.map((c: any, i: number) => (
                <div key={i} className="flex flex-col p-3 rounded-lg border border-[#DDD0BC]/50 bg-[#FAF8F4]">
                  <span className="text-[10px] uppercase tracking-wider text-[#9B8570] font-semibold">
                    {c.label || c.type || 'Contact'}
                  </span>
                  {c.url ? (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#C1440E] hover:underline break-all"
                    >
                      {c.value || c.url}
                    </a>
                  ) : (
                    <span className="text-sm text-[#5C4A35] break-all">{c.value || c.email || c.phone || ''}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Footer / Links ─── */}
        <footer className="border-t border-[#DDD0BC]/40 pt-10 flex flex-col items-center gap-4">
          {links.length > 0 && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-sm">
              {links.map((link: any, i: number) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#9B8570] hover:text-[#C1440E] font-medium transition-colors"
                >
                  {link.platform || link.label}
                </a>
              ))}
            </div>
          )}
          <p className="text-[10px] text-[#DDD0BC] tracking-wider uppercase">
            Built on BEXO Portfolio Network
          </p>
        </footer>

      </div>
    </div>
  );
}
