import React, { useState, useEffect } from 'react';
import NeuralNetwork from './components/NeuralNetwork';
import NodeDetails from './components/NodeDetails';
import ResumeContent from './components/ResumeContent';
import { COLORS, FONTS } from './theme';
import resumeData from './data/resume.json';

const { location, education, contacts: CONTACTS } = resumeData.profile;

const LEGEND = [
  { type: 'me', label: 'Me' },
  { type: 'experience', label: 'Experience' },
  { type: 'project', label: 'Project' },
  { type: 'skill', label: 'Skill' },
];

const monoLabelStyle = {
  fontFamily: FONTS.mono,
  fontSize: '0.75rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: COLORS.textMuted,
};

const contactLinkStyle = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.4rem',
  fontFamily: FONTS.mono,
  fontSize: '0.8rem',
  textDecoration: 'none',
  color: COLORS.textMuted,
};

// Below this width the layered graph has no room to work (verified broken at
// 390px, clean at 1000px this session) - render the resume as a normal page
// instead. Gated here (not CSS) so NeuralNetwork actually unmounts - its
// render loop runs continuously and shouldn't paint an invisible canvas.
const NARROW_QUERY = '(max-width: 900px)';

function useIsNarrow() {
  const [isNarrow, setIsNarrow] = useState(() => window.matchMedia(NARROW_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY);
    const onChange = (e) => setIsNarrow(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isNarrow;
}

function App() {
  const [selectedNode, setSelectedNode] = useState(null);
  const isNarrow = useIsNarrow();

  if (isNarrow) {
    return <ResumeContent visuallyHidden={false} />;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <h1 style={{
          fontFamily: FONTS.display,
          fontSize: '3rem',
          fontWeight: 600,
          margin: 0,
          color: COLORS.textPrimary,
        }}>
          Nishant Raj
        </h1>
        <p style={{ ...monoLabelStyle, fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
          Machine Learning Engineer
        </p>
        <p style={{
          fontFamily: FONTS.mono,
          fontSize: '0.8rem',
          color: COLORS.textMuted,
          opacity: 0.7,
          marginTop: '1.5rem',
          marginBottom: '1rem'
        }}>
          Drag nodes to explore • Click for details
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', pointerEvents: 'auto' }}>
          {CONTACTS.map(({ label, value, href, download }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
              download={download}
              style={contactLinkStyle}
            >
              <span>{label}</span>
              <span style={{ opacity: 0.5 }}>→</span>
              <span style={{ color: COLORS.textPrimary }}>{value}</span>
            </a>
          ))}
          <div style={{ ...contactLinkStyle, marginTop: '0.35rem' }}>
            <span>location</span>
            <span style={{ opacity: 0.5 }}>→</span>
            <span style={{ color: COLORS.textPrimary }}>{location}</span>
          </div>
          <div style={{ ...contactLinkStyle, alignItems: 'flex-start' }}>
            <span>education</span>
            <span style={{ opacity: 0.5 }}>→</span>
            <span style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: COLORS.textPrimary }}>{education.degree}</span>
              <span style={{ opacity: 0.7, fontSize: '0.72rem' }}>{education.institution}</span>
            </span>
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '1.5rem',
        left: '2rem',
        zIndex: 10,
        display: 'flex',
        gap: '1.25rem',
        pointerEvents: 'none'
      }}>
        {LEGEND.map(({ type, label }) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: COLORS.node[type],
              display: 'inline-block'
            }} />
            <span style={{ ...monoLabelStyle, fontSize: '0.7rem' }}>{label}</span>
          </div>
        ))}
      </div>

      <NeuralNetwork onNodeClick={setSelectedNode} />

      <NodeDetails
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />

      <ResumeContent visuallyHidden />
    </div>
  );
}

export default App;
