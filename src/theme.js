// Single source of truth for the portfolio's color palette.
// "me" is the only warm color and the only glow on the page - the signal
// emerging from the network. Everything else is one cool tonal ramp that
// lightens toward "me", encoding the Skills -> Projects -> Experience -> Me
// funnel directly in color instead of arbitrary category hues.
const NODE_COLORS = {
  skill: '#7C8FA3',
  project: '#9AACBC',
  experience: '#C4D2DC',
  me: '#FF6A3D',
};

export const COLORS = {
  bg: '#0E0D0C',
  panelBg: 'rgba(15,13,12,0.94)',
  // Lighter than panelBg - a frosted backdrop for text that floats directly
  // over the canvas (hero block), not a fully opaque slide-in surface.
  scrimBg: 'rgba(14,13,12,0.6)',
  textPrimary: '#EDE8E0',
  textMuted: '#8C877E',
  hairline: 'rgba(237,232,224,0.08)',
  link: 'rgba(124,143,163,0.18)',
  // Hover-highlight variants of the same link color: dimmed for unrelated
  // links, brightened for links touching the hovered node.
  linkDim: 'rgba(124,143,163,0.03)',
  linkHighlight: 'rgba(124,143,163,0.55)',
  node: NODE_COLORS,
  particle: {
    // Forward pass (skill -> ... -> me): cool, matches the link/node ramp.
    forward: NODE_COLORS.project,
    // Backward pass (me -> ... -> skill): a dimmed ember, not a second true
    // accent - "me" stays the only fully-saturated warm thing on the page.
    backward: 'rgba(255,106,61,0.35)',
  },
};

export const FONTS = {
  display: '"Fraunces", Georgia, serif',
  mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
};
