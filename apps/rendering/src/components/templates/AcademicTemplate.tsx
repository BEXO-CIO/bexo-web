import React from 'react';
import { PortfolioData } from '../../lib/db';

export function AcademicTemplate({ data }: { data: PortfolioData }) {
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
    <div className="min-h-screen bg-[#FDFDFD] text-[#2C2E35] font-sans antialiased">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row min-h-screen border-x border-[#E9EBEF]">

        {/* ─── Left Column — Sidebar ─── */}
        <aside className="w-full md:w-80 p-8 md:p-12 md:sticky md:top-0 md:h-screen flex flex-col gap-8 border-b md:border-b-0 md:border-r border-[#E9EBEF] bg-[#FAFBFD] overflow-y-auto">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.name || 'Profile photo'}
                className="w-32 h-32 rounded-lg object-cover border border-[#D5D9E2] shadow-sm"
              />
            ) : (
              <div className="w-32 h-32 rounded-lg bg-[#EAECEF] border border-[#D5D9E2] flex items-center justify-center">
                <span className="text-3xl font-serif text-[#7A8293]">
                  {(user.name || 'A')[0]}
                </span>
              </div>
            )}

            <div className="space-y-1 mt-2">
              <h1 className="text-2xl font-semibold text-[#111215] tracking-tight">{user.name || 'Anonymous'}</h1>
              {profile.headline && (
                <p className="text-xs font-medium text-[#495470] uppercase tracking-wider">{profile.headline}</p>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4 text-xs">
            <h2 className="font-semibold text-[#7A8293] uppercase tracking-widest text-[10px]">Contact Info</h2>
            <div className="space-y-2 text-[#495470]">
              {user.email && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#9EA6B5]">Email</span>
                  <a href={`mailto:${user.email}`} className="hover:underline font-mono truncate">{user.email}</a>
                </div>
              )}
              {user.phone && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#9EA6B5]">Phone</span>
                  <span className="font-mono">{user.phone}</span>
                </div>
              )}
              {user.dob && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#9EA6B5]">Date of Birth</span>
                  <span>{new Date(user.dob).toLocaleDateString()}</span>
                </div>
              )}
              {/* Additional contact entries from the contact section */}
              {contact.map((c: any, i: number) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[10px] text-[#9EA6B5]">{c.label || c.type || 'Contact'}</span>
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:underline font-mono truncate">
                      {c.value || c.url}
                    </a>
                  ) : (
                    <span className="font-mono truncate">{c.value || c.email || c.phone || ''}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {links.length > 0 && (
            <div className="space-y-3 text-xs">
              <h2 className="font-semibold text-[#7A8293] uppercase tracking-widest text-[10px]">Links</h2>
              <div className="flex flex-col gap-2">
                {links.map((link: any, i: number) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3A6073] hover:text-[#16222F] font-medium flex items-center gap-1.5 hover:underline"
                  >
                    <span>{link.platform || link.label}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="space-y-3 mt-auto hidden md:block">
              <h2 className="font-semibold text-[#7A8293] uppercase tracking-widest text-[10px]">Research Areas</h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((sk: any, i: number) => (
                  <span key={i} className="px-2 py-1 rounded bg-[#EAECEF]/60 border border-[#E1E3E6] text-[11px] text-[#495470]">
                    {sk.name || sk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ─── Right Column — Main Content ─── */}
        <main className="flex-1 p-8 md:p-12 space-y-12 overflow-y-auto">

          {/* Research Statement / Bio */}
          {(profile.bio || about.length > 0) && (
            <section className="space-y-3">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#7A8293] border-b border-[#E9EBEF] pb-1">
                Research Statement
              </h2>
              {profile.bio && (
                <p className="text-sm leading-relaxed text-[#495470] font-light whitespace-pre-line">
                  {profile.bio}
                </p>
              )}
              {about.map((entry: any, i: number) => (
                <p key={i} className="text-sm leading-relaxed text-[#495470] font-light whitespace-pre-line">
                  {entry.content || entry.text || entry.description || ''}
                </p>
              ))}
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#7A8293] border-b border-[#E9EBEF] pb-1">
                Education
              </h2>
              <div className="space-y-6">
                {education.map((edu: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-xs font-mono text-[#9EA6B5] w-16 flex-shrink-0 pt-0.5">
                      {edu.year || edu.duration || ''}
                    </span>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm text-[#111215]">
                        {edu.degree || edu.qualification}
                      </h3>
                      <p className="text-xs text-[#495470]">
                        {edu.school || edu.college || edu.university}
                      </p>
                      {edu.grade && (
                        <p className="text-xs font-mono text-[#9EA6B5]">Grade: {edu.grade}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Research & Publications */}
          {research.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#7A8293] border-b border-[#E9EBEF] pb-1">
                Publications & Research
              </h2>
              <div className="space-y-6">
                {research.map((res: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-xs font-mono text-[#9EA6B5] w-16 flex-shrink-0 pt-0.5">
                      {res.year || ''}
                    </span>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm text-[#111215]">
                        {res.title}
                      </h3>
                      {(res.authors || res.journal || res.publisher) && (
                        <p className="text-xs text-[#495470] italic">
                          {res.authors || res.journal || res.publisher || ''}
                        </p>
                      )}
                      {res.url && (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-[#3A6073] hover:underline block"
                        >
                          DOI / Paper Link →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Academic & Professional Appointments */}
          {experience.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#7A8293] border-b border-[#E9EBEF] pb-1">
                Academic & Professional Appointments
              </h2>
              <div className="space-y-6">
                {experience.map((exp: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-xs font-mono text-[#9EA6B5] w-16 flex-shrink-0 pt-0.5">
                      {exp.startDate || exp.start_date || exp.duration || ''}
                    </span>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm text-[#111215]">
                        {exp.role || exp.title}
                      </h3>
                      <p className="text-xs text-[#495470]">
                        {exp.company || exp.organization}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-[#7A8293] leading-relaxed pt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#7A8293] border-b border-[#E9EBEF] pb-1">
                Select Projects
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((proj: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg border border-[#E9EBEF] bg-[#FAFBFD] hover:border-[#D5D9E2] space-y-2">
                    <h3 className="font-semibold text-xs text-[#111215]">
                      {proj.name || proj.title}
                    </h3>
                    {proj.description && (
                      <p className="text-[11px] text-[#495470] leading-relaxed">
                        {proj.description}
                      </p>
                    )}
                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#3A6073] font-semibold hover:underline block pt-1"
                      >
                        View Project →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certificates */}
          {certificates.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#7A8293] border-b border-[#E9EBEF] pb-1">
                Certifications
              </h2>
              <div className="space-y-4">
                {certificates.map((cert: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-xs font-mono text-[#9EA6B5] w-16 flex-shrink-0 pt-0.5">
                      {cert.date || cert.year || ''}
                    </span>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm text-[#111215]">
                        {cert.title || cert.name}
                      </h3>
                      {cert.issuer && (
                        <p className="text-xs text-[#495470]">{cert.issuer}</p>
                      )}
                      {cert.credential_id && (
                        <p className="text-xs font-mono text-[#9EA6B5]">ID: {cert.credential_id}</p>
                      )}
                      {cert.url && (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-[#3A6073] hover:underline block"
                        >
                          Verify Credential →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Honors & Awards */}
          {achievements.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[#7A8293] border-b border-[#E9EBEF] pb-1">
                Honors & Awards
              </h2>
              <div className="space-y-4">
                {achievements.map((ach: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-xs font-mono text-[#9EA6B5] w-16 flex-shrink-0">
                      {ach.year || ''}
                    </span>
                    <div className="space-y-0.5">
                      <h3 className="font-semibold text-xs text-[#111215]">
                        {ach.title}
                      </h3>
                      {ach.issuer && (
                        <p className="text-[11px] text-[#495470]">{ach.issuer}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}
