import React from 'react';
import resumeData from '../data/resume.json';
import { COLORS, FONTS } from '../theme';
import { projectsForExperience, skillsForProject } from '../data/resumeHelpers';

const { profile, nodes } = resumeData;
const { location, education, contacts } = profile;

const me = nodes.find((n) => n.type === 'me');
const experiences = nodes.filter((n) => n.type === 'experience');
const skills = nodes.filter((n) => n.type === 'skill');

// Same content either way - only presentation changes. Hidden: hands the same
// data to screen readers and JS-rendering crawlers (Google) without disturbing
// the visible canvas UI. Visible: this *is* the mobile UI, where the canvas
// layout has no room to work (see App.jsx's isNarrow gate).
const ResumeContent = ({ visuallyHidden }) => {
  const styles = visuallyHidden
    ? {}
    : {
        page: {
          minHeight: '100vh',
          boxSizing: 'border-box',
          padding: '2.5rem 1.5rem',
          background: COLORS.bg,
          color: COLORS.textPrimary,
          fontFamily: FONTS.mono,
        },
        h1: { fontFamily: FONTS.display, fontSize: '2.25rem', fontWeight: 600, margin: 0 },
        role: { fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.textMuted, marginTop: '0.5rem' },
        meta: { fontSize: '0.85rem', color: COLORS.textMuted, marginTop: '1.25rem', lineHeight: 1.7 },
        link: { color: COLORS.node.me, textDecoration: 'none' },
        h2: { fontFamily: FONTS.display, fontSize: '1.4rem', fontWeight: 600, marginTop: '2.5rem', marginBottom: '0.75rem' },
        h3: { fontSize: '1rem', fontWeight: 600, margin: '1.25rem 0 0.25rem' },
        p: { fontSize: '0.9rem', color: COLORS.textMuted, lineHeight: 1.6, margin: 0 },
        list: { listStyle: 'none', padding: 0, margin: 0 },
        projectItem: { marginTop: '0.75rem' },
        skillList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
        skillChip: { fontSize: '0.8rem', color: COLORS.textMuted, border: `1px solid ${COLORS.hairline}`, borderRadius: '999px', padding: '0.2rem 0.6rem' },
      };

  return (
    <section className={visuallyHidden ? 'sr-only' : undefined} style={styles.page} aria-label="Resume">
      <h1 style={styles.h1}>{me.label}</h1>
      <p style={styles.role}>{me.details}</p>

      <div style={styles.meta}>
        <div>{location}</div>
        <div>{education.degree} — {education.institution}</div>
        <ul style={styles.list}>
          {contacts.map(({ label, value, href, download }) => (
            <li key={label}>
              {label}: <a href={href} download={download} style={styles.link}>{value}</a>
            </li>
          ))}
        </ul>
      </div>

      <h2 style={styles.h2}>Experience</h2>
      {experiences.map((exp) => (
        <div key={exp.id}>
          <h3 style={styles.h3}>{exp.label}</h3>
          <p style={styles.p}>{exp.details}</p>
          <ul style={styles.list}>
            {projectsForExperience(exp.id).map((proj) => (
              <li key={proj.id} style={styles.projectItem}>
                <strong>{proj.label}</strong>
                {proj.metric && (
                  <div>
                    <span style={{ fontFamily: FONTS.display, fontWeight: 600, fontSize: '1.1rem', color: COLORS.node.me }}>
                      {proj.metric.value}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: COLORS.textMuted, marginLeft: '0.5rem' }}>
                      {proj.metric.label}
                    </span>
                  </div>
                )}
                <p style={styles.p}>{proj.details}</p>
                {skillsForProject(proj.id).length > 0 && (
                  <ul style={{ ...styles.skillList, marginTop: '0.5rem' }}>
                    {skillsForProject(proj.id).map((skill) => (
                      <li key={skill.id} style={styles.skillChip}>{skill.label}</li>
                    ))}
                  </ul>
                )}
                {proj.link && <a href={proj.link} style={styles.link}>View repository →</a>}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h2 style={styles.h2}>Skills</h2>
      <ul style={styles.skillList}>
        {skills.map((skill) => (
          <li key={skill.id} style={styles.skillChip}>{skill.label}</li>
        ))}
      </ul>
    </section>
  );
};

export default ResumeContent;
