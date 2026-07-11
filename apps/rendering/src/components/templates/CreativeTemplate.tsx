import React from 'react';
import { PortfolioData } from '../../lib/db';

export function CreativeTemplate({ data }: { data: PortfolioData }) {
  const { user, profile, sections, assets } = data;

  const profilePhotoAsset = user.profile_photo_asset_id
    ? assets.find(a => a.id === user.profile_photo_asset_id)
    : null;

  const avatarUrl = profilePhotoAsset
    ? `${process.env.NEXT_PUBLIC_CDN_BASE_URL || 'http://localhost:9000/bexo-assets'}/${profilePhotoAsset.cdn_asset_id}`
    : null;

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
    <div className="min-h-screen bg-[#0C0B0E] text-[#ECE6F0] font-sans antialiased overflow-x-hidden">

      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto py-20 px-6 sm:px-12 relative z-10 space-y-24">

        {/* ─── Header Block ─── */}
        <header className="flex flex-col-reverse sm:flex-row items-center gap-8 justify-between">
          <div className="space-y-4 text-center sm:text-left">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500/10 to-violet-500/10 border border-violet-500/20 text-violet-300">
              AVAILABLE FOR COLLABORATION
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 leading-none">
              {user.name || 'Creative Mind'}
            </h1>
            {profile.headline && (
              <p className="text-xl text-[#BCB5C4] font-medium max-w-lg">
                {profile.headline}
              </p>
            )}
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-[#7D7686]">
              {user.email && <span>{user.email}</span>}
              {user.phone && <span>{user.phone}</span>}
            </div>
          </div>

          {avatarUrl ? (
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-violet-600 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-1000" />
              <img
                src={avatarUrl}
                alt={user.name || 'Avatar'}
                className="relative w-32 h-32 rounded-full object-cover border-2 border-[#1E1C22]"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-[#1E1C22] border-2 border-violet-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-violet-500">
                {(user.name || 'C')[0]}
              </span>
            </div>
          )}
        </header>

        {/* ─── Bio / Story ─── */}
        {(profile.bio || about.length > 0) && (
          <section className="p-8 rounded-2xl bg-[#131118]/80 border border-[#23202C]/60 backdrop-blur-md space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
              STORY
            </h2>
            {profile.bio && (
              <p className="text-lg leading-relaxed text-[#BCB5C4] font-light whitespace-pre-line">
                {profile.bio}
              </p>
            )}
            {about.map((entry: any, i: number) => (
              <p key={i} className="text-base leading-relaxed text-[#BCB5C4] font-light whitespace-pre-line">
                {entry.content || entry.text || entry.description || ''}
              </p>
            ))}
          </section>
        )}

        {/* ─── Skills / Superpowers ─── */}
        {skills.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest font-black text-[#7D7686]">
              SUPERPOWERS
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {skills.map((sk: any, i: number) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#18161E] border border-[#2B2735] hover:border-violet-500/30 transition-all text-violet-200"
                >
                  {sk.name || sk}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ─── Showcase Projects ─── */}
        {projects.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-xs uppercase tracking-widest font-black text-[#7D7686]">
              SHOWCASE
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj: any, i: number) => (
                <div
                  key={i}
                  className="group relative p-6 rounded-2xl bg-[#131118] border border-[#23202C] hover:border-pink-500/30 hover:scale-[1.01] transition-all space-y-4"
                >
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-[#ECE6F0] text-lg group-hover:text-pink-400 transition-colors">
                      {proj.name || proj.title}
                    </h3>
                  </div>
                  {proj.description && (
                    <p className="text-sm text-[#BCB5C4] leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                  {proj.url && (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400 group-hover:underline"
                    >
                      Explore live link
                      <svg className="w-3.5 h-3.5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Research & Publications ─── */}
        {research.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-xs uppercase tracking-widest font-black text-[#7D7686]">
              RESEARCH
            </h2>
            <div className="space-y-6">
              {research.map((res: any, i: number) => (
                <div key={i} className="p-6 rounded-2xl bg-[#131118] border border-[#23202C] space-y-3">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-[#ECE6F0]">{res.title}</h3>
                    {res.year && (
                      <span className="text-xs font-mono text-violet-400">{res.year}</span>
                    )}
                  </div>
                  {(res.authors || res.journal || res.publisher) && (
                    <p className="text-sm text-[#BCB5C4] italic">
                      {res.authors || res.journal || res.publisher}
                    </p>
                  )}
                  {res.description && (
                    <p className="text-sm text-[#7D7686] leading-relaxed">{res.description}</p>
                  )}
                  {res.url && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400 hover:underline"
                    >
                      Read Paper →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Professional Journey / Experience ─── */}
        {experience.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-xs uppercase tracking-widest font-black text-[#7D7686]">
              JOURNEY
            </h2>
            <div className="relative border-l-2 border-[#23202C] pl-6 space-y-10 ml-3">
              {experience.map((exp: any, i: number) => (
                <div key={i} className="relative space-y-2">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#0C0B0E] border-2 border-violet-500" />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                    <h3 className="font-bold text-lg text-[#ECE6F0]">
                      {exp.role || exp.title}
                    </h3>
                    <span className="text-xs font-semibold font-mono text-violet-400">
                      {exp.startDate || exp.start_date || exp.duration || ''}{' '}
                      {exp.endDate || exp.end_date ? `— ${exp.endDate || exp.end_date}` : ''}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#7D7686] uppercase tracking-wider">
                    {exp.company || exp.organization}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-[#BCB5C4] leading-relaxed pt-1">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Education / Foundation ─── */}
        {education.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest font-black text-[#7D7686]">
              FOUNDATION
            </h2>
            <div className="space-y-6">
              {education.map((edu: any, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                  <div className="space-y-1">
                    <h3 className="font-bold text-[#ECE6F0]">
                      {edu.degree || edu.qualification}
                    </h3>
                    <p className="text-xs text-[#BCB5C4]">
                      {edu.school || edu.college || edu.university}
                    </p>
                  </div>
                  <span className="text-xs font-semibold font-mono text-[#7D7686]">
                    {edu.year || edu.duration || ''}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Certificates ─── */}
        {certificates.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-xs uppercase tracking-widest font-black text-[#7D7686]">
              CERTIFICATIONS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert: any, i: number) => (
                <div key={i} className="p-5 rounded-2xl bg-[#131118] border border-[#23202C] hover:border-violet-500/30 transition-all space-y-2">
                  <h3 className="font-bold text-sm text-[#ECE6F0]">
                    {cert.title || cert.name}
                  </h3>
                  {cert.issuer && (
                    <p className="text-xs text-[#BCB5C4]">{cert.issuer}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-[#7D7686]">
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
                      className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400 hover:underline"
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
          <section className="space-y-8">
            <h2 className="text-xs uppercase tracking-widest font-black text-[#7D7686]">
              ACHIEVEMENTS
            </h2>
            <div className="space-y-4">
              {achievements.map((ach: any, i: number) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="mt-0.5 w-6 h-6 flex-shrink-0 rounded-full bg-gradient-to-br from-pink-500/20 to-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                    <span className="text-[10px] text-violet-300">★</span>
                  </span>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-[#ECE6F0]">{ach.title}</h3>
                    {ach.issuer && (
                      <p className="text-xs text-[#BCB5C4]">{ach.issuer}</p>
                    )}
                    {ach.year && (
                      <span className="text-xs font-mono text-[#7D7686]">{ach.year}</span>
                    )}
                    {ach.description && (
                      <p className="text-xs text-[#7D7686] leading-relaxed">{ach.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Contact ─── */}
        {contact.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest font-black text-[#7D7686]">
              GET IN TOUCH
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contact.map((c: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-[#131118] border border-[#23202C] space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#7D7686] font-bold">
                    {c.label || c.type || 'Contact'}
                  </span>
                  {c.url ? (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-pink-400 hover:underline break-all"
                    >
                      {c.value || c.url}
                    </a>
                  ) : (
                    <span className="block text-sm text-[#BCB5C4] break-all">
                      {c.value || c.email || c.phone || ''}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Footer / Connect Links ─── */}
        <footer className="border-t border-[#23202C] pt-12 flex flex-col items-center gap-6">
          {links.length > 0 && (
            <div className="flex gap-6 text-sm">
              {links.map((link: any, i: number) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#BCB5C4] hover:text-pink-400 transition-colors font-bold uppercase tracking-wider text-xs"
                >
                  {link.platform || link.label}
                </a>
              ))}
            </div>
          )}
          <p className="text-[10px] text-[#524D5B]">
            DESIGNED ON BEXO PORTFOLIO NETWORK.
          </p>
        </footer>

      </div>
    </div>
  );
}
