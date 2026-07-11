import * as React from 'react';
import { useLocation } from 'wouter';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { client } from '../lib/api';
import { MediaUpload } from '../components/MediaUpload';

const SUGGESTED_SKILLS = [
  'Python', 'React', 'Machine Learning', 'Data Analysis', 'Public Speaking',
  'Research', 'TypeScript', 'Product Management', 'UI/UX', 'SQL',
  'Leadership', 'Communication',
];

const SOCIAL_PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/yourname' },
  { key: 'github', label: 'GitHub', placeholder: 'github.com/yourname' },
  { key: 'portfolio', label: 'Portfolio', placeholder: 'yoursite.com' },
];

const BIO_LIMIT = 280;

type SubTab = 'about' | 'education' | 'experience' | 'projects' | 'certificates' | 'achievements' | 'research' | 'contact';

export default function Step6About() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = React.useState<SubTab>('about');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // 1. About & Skills & Links
  const [bio, setBio] = React.useState('');
  const [skills, setSkills] = React.useState<string[]>([]);
  const [customSkill, setCustomSkill] = React.useState('');
  const [links, setLinks] = React.useState<Record<string, string>>({});

  // 2. Education State
  const [education, setEducation] = React.useState<any[]>([]);
  const [eduSchool, setEduSchool] = React.useState('');
  const [eduDegree, setEduDegree] = React.useState('');
  const [eduYear, setEduYear] = React.useState('');
  const [eduGrade, setEduGrade] = React.useState('');
  const [editingEduIdx, setEditingEduIdx] = React.useState<number | null>(null);

  // 3. Experience State
  const [experience, setExperience] = React.useState<any[]>([]);
  const [expCompany, setExpCompany] = React.useState('');
  const [expRole, setExpRole] = React.useState('');
  const [expStart, setExpStart] = React.useState('');
  const [expEnd, setExpEnd] = React.useState('');
  const [expDesc, setExpDesc] = React.useState('');
  const [editingExpIdx, setEditingExpIdx] = React.useState<number | null>(null);

  // 4. Projects State
  const [projects, setProjects] = React.useState<any[]>([]);
  const [projName, setProjName] = React.useState('');
  const [projDesc, setProjDesc] = React.useState('');
  const [projUrl, setProjUrl] = React.useState('');
  const [projAssetId, setProjAssetId] = React.useState<string | null>(null);
  const [editingProjIdx, setEditingProjIdx] = React.useState<number | null>(null);

  // 5. Certificates State
  const [certificates, setCertificates] = React.useState<any[]>([]);
  const [certTitle, setCertTitle] = React.useState('');
  const [certIssuer, setCertIssuer] = React.useState('');
  const [certDate, setCertDate] = React.useState('');
  const [certId, setCertId] = React.useState('');
  const [certUrl, setCertUrl] = React.useState('');
  const [certAssetId, setCertAssetId] = React.useState<string | null>(null);
  const [editingCertIdx, setEditingCertIdx] = React.useState<number | null>(null);

  // 6. Achievements State
  const [achievements, setAchievements] = React.useState<any[]>([]);
  const [achTitle, setAchTitle] = React.useState('');
  const [achIssuer, setAchIssuer] = React.useState('');
  const [achYear, setAchYear] = React.useState('');
  const [achDesc, setAchDesc] = React.useState('');
  const [achAssetId, setAchAssetId] = React.useState<string | null>(null);
  const [editingAchIdx, setEditingAchIdx] = React.useState<number | null>(null);

  // 7. Research State
  const [research, setResearch] = React.useState<any[]>([]);
  const [resTitle, setResTitle] = React.useState('');
  const [resYear, setResYear] = React.useState('');
  const [resAuthors, setResAuthors] = React.useState('');
  const [resDesc, setResDesc] = React.useState('');
  const [resUrl, setResUrl] = React.useState('');
  const [resAssetId, setResAssetId] = React.useState<string | null>(null);
  const [editingResIdx, setEditingResIdx] = React.useState<number | null>(null);

  // 8. Contact State
  const [contact, setContact] = React.useState<any[]>([]);
  const [conLabel, setConLabel] = React.useState('Email');
  const [conValue, setConValue] = React.useState('');
  const [editingConIdx, setEditingConIdx] = React.useState<number | null>(null);

  // We maintain a list of all user assets fetched to supply to MediaUpload triggers
  const [userAssets, setUserAssets] = React.useState<any[]>([]);

  // Load existing profile & section records on mount
  React.useEffect(() => {
    async function loadAllData() {
      try {
        const prof = await client.getProfile();
        if (prof.bio) setBio(prof.bio);

        const sectionsToLoad = [
          { type: 'skills', setter: (ent: any[]) => setSkills(ent.map(e => e.name || e)) },
          {
            type: 'links',
            setter: (ent: any[]) => {
              const l: Record<string, string> = {};
              ent.forEach(e => {
                if (e.platform) l[e.platform] = e.url;
              });
              setLinks(l);
            },
          },
          { type: 'education', setter: setEducation },
          { type: 'experience', setter: setExperience },
          { type: 'projects', setter: setProjects },
          { type: 'certificates', setter: setCertificates },
          { type: 'achievements', setter: setAchievements },
          { type: 'research', setter: setResearch },
          { type: 'contact', setter: setContact },
        ];

        for (const { type, setter } of sectionsToLoad) {
          try {
            const sec = await client.getProfileSection(type);
            if (sec && sec.entries) {
              setter(sec.entries);
            }
          } catch (e) {
            // section does not exist yet for user
          }
        }
      } catch (err) {
        console.error('Mount loading failed:', err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadAllData();
  }, []);

  // 2-second debounced autosave hook
  React.useEffect(() => {
    if (!isLoaded) return;

    const timer = setTimeout(async () => {
      try {
        if (bio) {
          await client.patchProfile({ bio });
        }
        await client.patchProfileSection('skills', { entries: skills.map(name => ({ name })), reviewed_at: new Date().toISOString() });
        
        const linkEntries = Object.entries(links).filter(([, url]) => !!url);
        await client.patchProfileSection('links', { entries: linkEntries.map(([platform, url]) => ({ platform, url })), reviewed_at: new Date().toISOString() });
        
        await client.patchProfileSection('education', { entries: education, reviewed_at: new Date().toISOString() });
        await client.patchProfileSection('experience', { entries: experience, reviewed_at: new Date().toISOString() });
        await client.patchProfileSection('projects', { entries: projects, reviewed_at: new Date().toISOString() });
        await client.patchProfileSection('certificates', { entries: certificates, reviewed_at: new Date().toISOString() });
        await client.patchProfileSection('achievements', { entries: achievements, reviewed_at: new Date().toISOString() });
        await client.patchProfileSection('research', { entries: research, reviewed_at: new Date().toISOString() });
        await client.patchProfileSection('contact', { entries: contact, reviewed_at: new Date().toISOString() });
      } catch (err) {
        console.error('Autosave failed:', err);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    bio, skills, links, education, experience, projects,
    certificates, achievements, research, contact, isLoaded
  ]);

  const toggleSkill = (s: string) =>
    setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const addCustomSkill = () => {
    const s = customSkill.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setCustomSkill('');
  };

  // Education Helpers
  const saveEducation = () => {
    if (!eduSchool.trim() || !eduDegree.trim()) return;
    const entry = { school: eduSchool, degree: eduDegree, year: eduYear, grade: eduGrade };
    if (editingEduIdx !== null) {
      setEducation(prev => prev.map((e, idx) => idx === editingEduIdx ? entry : e));
      setEditingEduIdx(null);
    } else {
      setEducation(prev => [...prev, entry]);
    }
    setEduSchool('');
    setEduDegree('');
    setEduYear('');
    setEduGrade('');
  };

  // Experience Helpers
  const saveExperience = () => {
    if (!expCompany.trim() || !expRole.trim()) return;
    const entry = { company: expCompany, role: expRole, startDate: expStart, endDate: expEnd, description: expDesc };
    if (editingExpIdx !== null) {
      setExperience(prev => prev.map((e, idx) => idx === editingExpIdx ? entry : e));
      setEditingExpIdx(null);
    } else {
      setExperience(prev => [...prev, entry]);
    }
    setExpCompany('');
    setExpRole('');
    setExpStart('');
    setExpEnd('');
    setExpDesc('');
  };

  // Projects Helpers
  const saveProject = () => {
    if (!projName.trim() || !projDesc.trim()) return;
    // Generate UUID if creating new entry
    const entryId = editingProjIdx !== null && projects[editingProjIdx]?.id 
      ? projects[editingProjIdx].id 
      : crypto.randomUUID();
    const entry = { id: entryId, name: projName, description: projDesc, url: projUrl, asset_id: projAssetId };
    if (editingProjIdx !== null) {
      setProjects(prev => prev.map((e, idx) => idx === editingProjIdx ? entry : e));
      setEditingProjIdx(null);
    } else {
      setProjects(prev => [...prev, entry]);
    }
    setProjName('');
    setProjDesc('');
    setProjUrl('');
    setProjAssetId(null);
  };

  // Certificates Helpers
  const saveCertificate = () => {
    if (!certTitle.trim() || !certIssuer.trim()) return;
    const entryId = editingCertIdx !== null && certificates[editingCertIdx]?.id 
      ? certificates[editingCertIdx].id 
      : crypto.randomUUID();
    const entry = { id: entryId, title: certTitle, issuer: certIssuer, date: certDate, credential_id: certId, url: certUrl, asset_id: certAssetId };
    if (editingCertIdx !== null) {
      setCertificates(prev => prev.map((e, idx) => idx === editingCertIdx ? entry : e));
      setEditingCertIdx(null);
    } else {
      setCertificates(prev => [...prev, entry]);
    }
    setCertTitle('');
    setCertIssuer('');
    setCertDate('');
    setCertId('');
    setCertUrl('');
    setCertAssetId(null);
  };

  // Achievements Helpers
  const saveAchievement = () => {
    if (!achTitle.trim() || !achIssuer.trim()) return;
    const entryId = editingAchIdx !== null && achievements[editingAchIdx]?.id 
      ? achievements[editingAchIdx].id 
      : crypto.randomUUID();
    const entry = { id: entryId, title: achTitle, issuer: achIssuer, year: achYear, description: achDesc, asset_id: achAssetId };
    if (editingAchIdx !== null) {
      setAchievements(prev => prev.map((e, idx) => idx === editingAchIdx ? entry : e));
      setEditingAchIdx(null);
    } else {
      setAchievements(prev => [...prev, entry]);
    }
    setAchTitle('');
    setAchIssuer('');
    setAchYear('');
    setAchDesc('');
    setAchAssetId(null);
  };

  // Research Helpers
  const saveResearch = () => {
    if (!resTitle.trim()) return;
    const entryId = editingResIdx !== null && research[editingResIdx]?.id 
      ? research[editingResIdx].id 
      : crypto.randomUUID();
    const entry = { id: entryId, title: resTitle, year: resYear, authors: resAuthors, description: resDesc, url: resUrl, asset_id: resAssetId };
    if (editingResIdx !== null) {
      setResearch(prev => prev.map((e, idx) => idx === editingResIdx ? entry : e));
      setEditingResIdx(null);
    } else {
      setResearch(prev => [...prev, entry]);
    }
    setResTitle('');
    setResYear('');
    setResAuthors('');
    setResDesc('');
    setResUrl('');
    setResAssetId(null);
  };

  // Contact Helpers
  const saveContact = () => {
    if (!conValue.trim()) return;
    const entry = { label: conLabel, value: conValue };
    if (editingConIdx !== null) {
      setContact(prev => prev.map((e, idx) => idx === editingConIdx ? entry : e));
      setEditingConIdx(null);
    } else {
      setContact(prev => [...prev, entry]);
    }
    setConLabel('Email');
    setConValue('');
  };

  const handleSaveAndContinue = async () => {
    setLoading(true);
    setError('');
    try {
      if (bio) {
        await client.patchProfile({ bio });
      }
      await client.patchProfileSection('skills', { entries: skills.map(name => ({ name })), reviewed_at: new Date().toISOString() });
      
      const linkEntries = Object.entries(links).filter(([, url]) => !!url);
      await client.patchProfileSection('links', { entries: linkEntries.map(([platform, url]) => ({ platform, url })), reviewed_at: new Date().toISOString() });

      await client.patchProfileSection('education', { entries: education, reviewed_at: new Date().toISOString() });
      await client.patchProfileSection('experience', { entries: experience, reviewed_at: new Date().toISOString() });
      await client.patchProfileSection('projects', { entries: projects, reviewed_at: new Date().toISOString() });
      await client.patchProfileSection('certificates', { entries: certificates, reviewed_at: new Date().toISOString() });
      await client.patchProfileSection('achievements', { entries: achievements, reviewed_at: new Date().toISOString() });
      await client.patchProfileSection('research', { entries: research, reviewed_at: new Date().toISOString() });
      await client.patchProfileSection('contact', { entries: contact, reviewed_at: new Date().toISOString() });

      navigate('/step/7');
    } catch (e: any) {
      setError(e.message || 'Failed to save profile data.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.875rem',
    border: '1px solid #DDD0BC',
    borderRadius: 8,
    backgroundColor: 'white',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    color: '#1C1A18',
  };

  const tabItem = (tab: SubTab, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
        activeTab === tab ? 'bg-[#C1440E] text-white' : 'text-[#9B8570] hover:bg-[#F5EEE4] hover:text-[#5C4A35]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <OnboardingLayout currentStep={6}>
      <div style={{ animation: 'fade-in 0.3s ease-out' }} className="space-y-6">
        <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#C1440E' }}>Step 6 of 9</p>
        <h1 className="text-3xl font-serif" style={{ color: '#1C1A18' }}>Build your Portfolio Sections</h1>
        
        {/* Horizontal Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-[#DDD0BC]/60 pb-3">
          {tabItem('about', 'About & Skills')}
          {tabItem('education', 'Education')}
          {tabItem('experience', 'Experience')}
          {tabItem('projects', 'Projects')}
          {tabItem('certificates', 'Certificates')}
          {tabItem('achievements', 'Achievements')}
          {tabItem('research', 'Research')}
          {tabItem('contact', 'Contact')}
        </div>

        {/* Tab contents */}
        <div className="mt-4 min-h-[300px]">
          
          {/* TAB 1: ABOUT & SKILLS */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <label className="text-sm font-semibold" style={{ color: '#1C1A18' }}>Bio</label>
                  <span className="text-xs" style={{ color: bio.length > BIO_LIMIT ? '#D32F2F' : '#9B8570' }}>
                    {bio.length}/{BIO_LIMIT}
                  </span>
                </div>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={4}
                  placeholder="Final-year Computer Science student, ML enthusiast..."
                  style={{ ...inputStyle, resize: 'vertical', fontSize: 14 }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A18' }}>Skills</label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {SUGGESTED_SKILLS.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleSkill(s)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium transition"
                      style={{
                        backgroundColor: skills.includes(s) ? '#C1440E' : '#F5EEE4',
                        color: skills.includes(s) ? 'white' : '#5C4A35',
                        border: `1px solid ${skills.includes(s) ? '#A33509' : '#DDD0BC'}`,
                      }}
                    >
                      {skills.includes(s) ? '✓ ' : '+ '}{s}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={customSkill}
                    onChange={e => setCustomSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
                    placeholder="Add custom skill…"
                    style={inputStyle}
                  />
                  <button onClick={addCustomSkill} className="px-4 bg-[#F5EEE4] border border-[#DDD0BC] rounded-lg text-xs font-semibold text-[#5C4A35]">Add</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A18' }}>Links</label>
                <div className="space-y-2">
                  {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs font-medium w-16 text-right text-[#9B8570]">{label}</span>
                      <input
                        value={links[key] ?? ''}
                        onChange={e => setLinks(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={placeholder}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDUCATION */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#DDD0BC]/60 space-y-4">
                <h3 className="font-serif font-bold text-sm text-[#1C1A18]">{editingEduIdx !== null ? 'Edit entry' : 'Add Education'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={eduSchool} onChange={e => setEduSchool(e.target.value)} placeholder="School/University" style={inputStyle} />
                  <input value={eduDegree} onChange={e => setEduDegree(e.target.value)} placeholder="Degree/Qualification" style={inputStyle} />
                  <input value={eduYear} onChange={e => setEduYear(e.target.value)} placeholder="Year/Duration (e.g. 2020 - 2024)" style={inputStyle} />
                  <input value={eduGrade} onChange={e => setEduGrade(e.target.value)} placeholder="Grade/GPA (optional)" style={inputStyle} />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEducation} className="px-4 py-2 bg-[#C1440E] text-white text-xs font-bold rounded-lg hover:bg-[#A33509]">Save</button>
                  {editingEduIdx !== null && <button onClick={() => setEditingEduIdx(null)} className="px-4 py-2 border border-[#DDD0BC] text-xs font-semibold rounded-lg bg-white">Cancel</button>}
                </div>
              </div>

              <div className="space-y-3">
                {education.map((e, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-[#DDD0BC]/40 bg-white">
                    <div>
                      <div className="font-bold text-[#1C1A18] text-sm">{e.school}</div>
                      <div className="text-xs text-[#5C4A35]">{e.degree} {e.year ? `(${e.year})` : ''}</div>
                      {e.grade && <div className="text-[10px] text-[#9B8570] font-mono">Grade: {e.grade}</div>}
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => {
                        setEditingEduIdx(idx);
                        setEduSchool(e.school);
                        setEduDegree(e.degree);
                        setEduYear(e.year || '');
                        setEduGrade(e.grade || '');
                      }} className="text-[#C1440E] font-medium">Edit</button>
                      <button onClick={() => setEducation(prev => prev.filter((_, i) => i !== idx))} className="text-[#9B8570]">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#DDD0BC]/60 space-y-4">
                <h3 className="font-serif font-bold text-sm text-[#1C1A18]">{editingExpIdx !== null ? 'Edit entry' : 'Add Experience'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={expCompany} onChange={e => setExpCompany(e.target.value)} placeholder="Company/Organization" style={inputStyle} />
                  <input value={expRole} onChange={e => setExpRole(e.target.value)} placeholder="Role/Title" style={inputStyle} />
                  <input value={expStart} onChange={e => setExpStart(e.target.value)} placeholder="Start Date" style={inputStyle} />
                  <input value={expEnd} onChange={e => setExpEnd(e.target.value)} placeholder="End Date (optional)" style={inputStyle} />
                </div>
                <textarea value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="Description..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                <div className="flex gap-2">
                  <button onClick={saveExperience} className="px-4 py-2 bg-[#C1440E] text-white text-xs font-bold rounded-lg hover:bg-[#A33509]">Save</button>
                  {editingExpIdx !== null && <button onClick={() => setEditingExpIdx(null)} className="px-4 py-2 border border-[#DDD0BC] text-xs font-semibold rounded-lg bg-white">Cancel</button>}
                </div>
              </div>

              <div className="space-y-3">
                {experience.map((e, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-[#DDD0BC]/40 bg-white">
                    <div>
                      <div className="font-bold text-[#1C1A18] text-sm">{e.role}</div>
                      <div className="text-xs text-[#5C4A35]">{e.company} | {e.startDate} {e.endDate ? `- ${e.endDate}` : ''}</div>
                      {e.description && <p className="text-xs text-[#9B8570] mt-1">{e.description}</p>}
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => {
                        setEditingExpIdx(idx);
                        setExpCompany(e.company);
                        setExpRole(e.role);
                        setExpStart(e.startDate || '');
                        setExpEnd(e.endDate || '');
                        setExpDesc(e.description || '');
                      }} className="text-[#C1440E] font-medium">Edit</button>
                      <button onClick={() => setExperience(prev => prev.filter((_, i) => i !== idx))} className="text-[#9B8570]">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#DDD0BC]/60 space-y-4">
                <h3 className="font-serif font-bold text-sm text-[#1C1A18]">{editingProjIdx !== null ? 'Edit entry' : 'Add Project'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={projName} onChange={e => setProjName(e.target.value)} placeholder="Project Name/Title" style={inputStyle} />
                  <input value={projUrl} onChange={e => setProjUrl(e.target.value)} placeholder="Project URL (optional)" style={inputStyle} />
                </div>
                <textarea value={projDesc} onChange={e => setProjDesc(e.target.value)} placeholder="Project description..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                
                {/* Media upload slot */}
                {editingProjIdx !== null && projects[editingProjIdx] && (
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#1C1A18]">Project Media Attachment</label>
                    <MediaUpload
                      sectionType="project"
                      entryId={projects[editingProjIdx].id}
                      currentAssetId={projAssetId}
                      assetsList={userAssets}
                      onUploadSuccess={(asset) => {
                        setProjAssetId(asset.id);
                        setUserAssets(prev => [...prev, asset]);
                        // update array item immediately
                        setProjects(prev => prev.map((item, i) => i === editingProjIdx ? { ...item, asset_id: asset.id } : item));
                      }}
                      onDeleteSuccess={() => {
                        setProjAssetId(null);
                        setProjects(prev => prev.map((item, i) => i === editingProjIdx ? { ...item, asset_id: null } : item));
                      }}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={saveProject} className="px-4 py-2 bg-[#C1440E] text-white text-xs font-bold rounded-lg hover:bg-[#A33509]">Save</button>
                  {editingProjIdx !== null && <button onClick={() => setEditingProjIdx(null)} className="px-4 py-2 border border-[#DDD0BC] text-xs font-semibold rounded-lg bg-white">Cancel</button>}
                </div>
              </div>

              <div className="space-y-3">
                {projects.map((e, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-[#DDD0BC]/40 bg-white">
                    <div>
                      <div className="font-bold text-[#1C1A18] text-sm">{e.name}</div>
                      {e.url && <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C1440E] hover:underline">{e.url}</a>}
                      <p className="text-xs text-[#9B8570] mt-1">{e.description}</p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => {
                        setEditingProjIdx(idx);
                        setProjName(e.name);
                        setProjDesc(e.description);
                        setProjUrl(e.url || '');
                        setProjAssetId(e.asset_id || null);
                      }} className="text-[#C1440E] font-medium">Edit</button>
                      <button onClick={() => setProjects(prev => prev.filter((_, i) => i !== idx))} className="text-[#9B8570]">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#DDD0BC]/60 space-y-4">
                <h3 className="font-serif font-bold text-sm text-[#1C1A18]">{editingCertIdx !== null ? 'Edit entry' : 'Add Certificate'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={certTitle} onChange={e => setCertTitle(e.target.value)} placeholder="Certificate Title/Name" style={inputStyle} />
                  <input value={certIssuer} onChange={e => setCertIssuer(e.target.value)} placeholder="Issuing Organization" style={inputStyle} />
                  <input value={certDate} onChange={e => setCertDate(e.target.value)} placeholder="Date Issued" style={inputStyle} />
                  <input value={certId} onChange={e => setCertId(e.target.value)} placeholder="Credential ID" style={inputStyle} />
                  <input value={certUrl} onChange={e => setCertUrl(e.target.value)} placeholder="Credential URL" style={inputStyle} />
                </div>

                {editingCertIdx !== null && certificates[editingCertIdx] && (
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#1C1A18]">Certificate Verification File</label>
                    <MediaUpload
                      sectionType="certificate"
                      entryId={certificates[editingCertIdx].id}
                      currentAssetId={certAssetId}
                      assetsList={userAssets}
                      onUploadSuccess={(asset) => {
                        setCertAssetId(asset.id);
                        setUserAssets(prev => [...prev, asset]);
                        setCertificates(prev => prev.map((item, i) => i === editingCertIdx ? { ...item, asset_id: asset.id } : item));
                      }}
                      onDeleteSuccess={() => {
                        setCertAssetId(null);
                        setCertificates(prev => prev.map((item, i) => i === editingCertIdx ? { ...item, asset_id: null } : item));
                      }}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={saveCertificate} className="px-4 py-2 bg-[#C1440E] text-white text-xs font-bold rounded-lg hover:bg-[#A33509]">Save</button>
                  {editingCertIdx !== null && <button onClick={() => setEditingCertIdx(null)} className="px-4 py-2 border border-[#DDD0BC] text-xs font-semibold rounded-lg bg-white">Cancel</button>}
                </div>
              </div>

              <div className="space-y-3">
                {certificates.map((e, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-[#DDD0BC]/40 bg-white">
                    <div>
                      <div className="font-bold text-[#1C1A18] text-sm">{e.title}</div>
                      <div className="text-xs text-[#5C4A35]">{e.issuer} {e.date ? `| ${e.date}` : ''}</div>
                      {e.credential_id && <div className="text-[10px] text-[#9B8570] font-mono">Credential ID: {e.credential_id}</div>}
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => {
                        setEditingCertIdx(idx);
                        setCertTitle(e.title);
                        setCertIssuer(e.issuer);
                        setCertDate(e.date || '');
                        setCertId(e.credential_id || '');
                        setCertUrl(e.url || '');
                        setCertAssetId(e.asset_id || null);
                      }} className="text-[#C1440E] font-medium">Edit</button>
                      <button onClick={() => setCertificates(prev => prev.filter((_, i) => i !== idx))} className="text-[#9B8570]">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#DDD0BC]/60 space-y-4">
                <h3 className="font-serif font-bold text-sm text-[#1C1A18]">{editingAchIdx !== null ? 'Edit entry' : 'Add Achievement'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={achTitle} onChange={e => setAchTitle(e.target.value)} placeholder="Achievement Title" style={inputStyle} />
                  <input value={achIssuer} onChange={e => setAchIssuer(e.target.value)} placeholder="Awarding Organization" style={inputStyle} />
                  <input value={achYear} onChange={e => setAchYear(e.target.value)} placeholder="Year/Date" style={inputStyle} />
                </div>
                <textarea value={achDesc} onChange={e => setAchDesc(e.target.value)} placeholder="Description..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

                {editingAchIdx !== null && achievements[editingAchIdx] && (
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#1C1A18]">Award File / Photo</label>
                    <MediaUpload
                      sectionType="achievement"
                      entryId={achievements[editingAchIdx].id}
                      currentAssetId={achAssetId}
                      assetsList={userAssets}
                      onUploadSuccess={(asset) => {
                        setAchAssetId(asset.id);
                        setUserAssets(prev => [...prev, asset]);
                        setAchievements(prev => prev.map((item, i) => i === editingAchIdx ? { ...item, asset_id: asset.id } : item));
                      }}
                      onDeleteSuccess={() => {
                        setAchAssetId(null);
                        setAchievements(prev => prev.map((item, i) => i === editingAchIdx ? { ...item, asset_id: null } : item));
                      }}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={saveAchievement} className="px-4 py-2 bg-[#C1440E] text-white text-xs font-bold rounded-lg hover:bg-[#A33509]">Save</button>
                  {editingAchIdx !== null && <button onClick={() => setEditingAchIdx(null)} className="px-4 py-2 border border-[#DDD0BC] text-xs font-semibold rounded-lg bg-white">Cancel</button>}
                </div>
              </div>

              <div className="space-y-3">
                {achievements.map((e, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-[#DDD0BC]/40 bg-white">
                    <div>
                      <div className="font-bold text-[#1C1A18] text-sm">{e.title}</div>
                      <div className="text-xs text-[#5C4A35]">{e.issuer} {e.year ? `(${e.year})` : ''}</div>
                      {e.description && <p className="text-xs text-[#9B8570] mt-1">{e.description}</p>}
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => {
                        setEditingAchIdx(idx);
                        setAchTitle(e.title);
                        setAchIssuer(e.issuer);
                        setAchYear(e.year || '');
                        setAchDesc(e.description || '');
                        setAchAssetId(e.asset_id || null);
                      }} className="text-[#C1440E] font-medium">Edit</button>
                      <button onClick={() => setAchievements(prev => prev.filter((_, i) => i !== idx))} className="text-[#9B8570]">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: RESEARCH */}
          {activeTab === 'research' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#DDD0BC]/60 space-y-4">
                <h3 className="font-serif font-bold text-sm text-[#1C1A18]">{editingResIdx !== null ? 'Edit entry' : 'Add Research Publication'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={resTitle} onChange={e => setResTitle(e.target.value)} placeholder="Paper Title" style={inputStyle} />
                  <input value={resYear} onChange={e => setResYear(e.target.value)} placeholder="Year Published" style={inputStyle} />
                  <input value={resAuthors} onChange={e => setResAuthors(e.target.value)} placeholder="Authors / Journal / Publisher" style={inputStyle} />
                  <input value={resUrl} onChange={e => setResUrl(e.target.value)} placeholder="DOI or Paper Link" style={inputStyle} />
                </div>
                <textarea value={resDesc} onChange={e => setResDesc(e.target.value)} placeholder="Abstract/Description..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

                {editingResIdx !== null && research[editingResIdx] && (
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#1C1A18]">Paper PDF Upload</label>
                    <MediaUpload
                      sectionType="research"
                      entryId={research[editingResIdx].id}
                      currentAssetId={resAssetId}
                      assetsList={userAssets}
                      onUploadSuccess={(asset) => {
                        setResAssetId(asset.id);
                        setUserAssets(prev => [...prev, asset]);
                        setResearch(prev => prev.map((item, i) => i === editingResIdx ? { ...item, asset_id: asset.id } : item));
                      }}
                      onDeleteSuccess={() => {
                        setResAssetId(null);
                        setResearch(prev => prev.map((item, i) => i === editingResIdx ? { ...item, asset_id: null } : item));
                      }}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={saveResearch} className="px-4 py-2 bg-[#C1440E] text-white text-xs font-bold rounded-lg hover:bg-[#A33509]">Save</button>
                  {editingResIdx !== null && <button onClick={() => setEditingResIdx(null)} className="px-4 py-2 border border-[#DDD0BC] text-xs font-semibold rounded-lg bg-white">Cancel</button>}
                </div>
              </div>

              <div className="space-y-3">
                {research.map((e, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-[#DDD0BC]/40 bg-white">
                    <div>
                      <div className="font-bold text-[#1C1A18] text-sm">{e.title}</div>
                      <div className="text-xs text-[#5C4A35]">{e.authors} | {e.year}</div>
                      {e.url && <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C1440E] hover:underline block truncate max-w-sm">{e.url}</a>}
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => {
                        setEditingResIdx(idx);
                        setResTitle(e.title);
                        setResYear(e.year || '');
                        setResAuthors(e.authors || '');
                        setResDesc(e.description || '');
                        setResUrl(e.url || '');
                        setResAssetId(e.asset_id || null);
                      }} className="text-[#C1440E] font-medium">Edit</button>
                      <button onClick={() => setResearch(prev => prev.filter((_, i) => i !== idx))} className="text-[#9B8570]">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: CONTACT */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#DDD0BC]/60 space-y-4">
                <h3 className="font-serif font-bold text-sm text-[#1C1A18]">{editingConIdx !== null ? 'Edit entry' : 'Add Contact details'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#9B8570] mb-1">Type/Label</label>
                    <select
                      value={conLabel}
                      onChange={e => setConLabel(e.target.value)}
                      className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                    >
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                      <option value="GitHub">GitHub</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Website">Personal Website</option>
                      <option value="Twitter">Twitter/X</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9B8570] mb-1">Contact value / URL</label>
                    <input value={conValue} onChange={e => setConValue(e.target.value)} placeholder="contact details..." style={inputStyle} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveContact} className="px-4 py-2 bg-[#C1440E] text-white text-xs font-bold rounded-lg hover:bg-[#A33509]">Save</button>
                  {editingConIdx !== null && <button onClick={() => setEditingConIdx(null)} className="px-4 py-2 border border-[#DDD0BC] text-xs font-semibold rounded-lg bg-white">Cancel</button>}
                </div>
              </div>

              <div className="space-y-3">
                {contact.map((e, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-[#DDD0BC]/40 bg-white">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#C1440E] tracking-wider">{e.label}</span>
                      <div className="font-bold text-[#1C1A18] text-sm mt-0.5">{e.value}</div>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => {
                        setEditingConIdx(idx);
                        setConLabel(e.label);
                        setConValue(e.value);
                      }} className="text-[#C1440E] font-medium">Edit</button>
                      <button onClick={() => setContact(prev => prev.filter((_, i) => i !== idx))} className="text-[#9B8570]">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {error && (
          <p className="text-sm font-medium text-center animate-pulse" style={{ color: '#E11D48' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSaveAndContinue}
          disabled={loading}
          className="w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 mt-8"
          style={{ backgroundColor: '#C1440E', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading && <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />}
          {loading ? 'Saving…' : 'Save & continue →'}
        </button>
      </div>
    </OnboardingLayout>
  );
}
