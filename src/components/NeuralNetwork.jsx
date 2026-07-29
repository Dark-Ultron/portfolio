import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import resumeData from '../data/resume.json';
import { COLORS, FONTS } from '../theme';

// Layer order defines the classic neural-network layout: skills (input) fan
// into projects, projects roll up into experience, experience feeds "me" (output).
const LAYER_ORDER = ['skill', 'project', 'experience', 'me'];

const getNodeColor = (node) => COLORS.node[node.type] || COLORS.textPrimary;

const getNodeVal = (node) => {
  switch (node.type) {
    case 'me': return 20;
    case 'experience': return 12;
    case 'project': return 8;
    case 'skill': return 5;
    default: return 3;
  }
};

const getNodeRadius = (node) => Math.sqrt(getNodeVal(node)) * 4;

// Skill labels sit left of their node, "me" sits right of its node, everything
// else sits below - keeping labels out of the neighboring layer's column.
const getLabelPlacement = (node) => {
  if (node.type === 'skill') return 'left';
  if (node.type === 'me') return 'right';
  return 'bottom';
};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Page-load reveal: one wave per layer (skills first, "me" last), tracing the
// same forward-propagation direction as the particle animation. Read every
// frame off Date.now() rather than driven by React state - autoPauseRedraw
// already keeps the canvas repainting continuously for the "me" pulse, so
// this rides that same loop for free. Starts once the camera has settled
// (see readyRef below) rather than at raw mount - react-force-graph-2d does
// its own initial auto-fit that the resetView effect already overrides after
// 300ms, and until that fires, nodes past the skill column sit outside its
// auto-fit framing regardless of any reveal logic here.
const REVEAL_LAYER_DELAY = 90;
const REVEAL_DURATION = 380;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const NeuralNetwork = ({ onNodeClick }) => {
  const graphRef = useRef();
  const hoveredNodeRef = useRef(null);
  const readyRef = useRef(false);
  const revealStartRef = useRef(0);
  // Computed once - doesn't need to react to a mid-session OS preference change.
  const reducedMotion = useMemo(prefersReducedMotion, []);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const graphData = useMemo(() => {
    // Clears the hero text block horizontally: skill labels are drawn to the
    // LEFT of their node (see getLabelPlacement), so the widest label ("Label
    // Studio", ~86px) needs its own left edge past the hero's right edge
    // (measured ~352px) - not just the node dot itself. 480 leaves ~27px of
    // clearance; rows that fall within the hero's vertical range no longer
    // overlap it since the label text itself stays clear.
    const leftMargin = 480;
    const rightMargin = 160;
    const topMargin = 160; // clears the hero text block
    const bottomMargin = 60;
    const usableWidth = Math.max(dimensions.width - leftMargin - rightMargin, 300);
    const usableHeight = Math.max(dimensions.height - topMargin - bottomMargin, 300);
    const columnGap = usableWidth / (LAYER_ORDER.length - 1);

    const positioned = [];
    LAYER_ORDER.forEach((type, layerIndex) => {
      const layerNodes = resumeData.nodes.filter((n) => n.type === type);
      const rowGap = usableHeight / (layerNodes.length + 1);
      const x = leftMargin + columnGap * layerIndex;
      layerNodes.forEach((node, i) => {
        const y = topMargin + rowGap * (i + 1);
        positioned.push({ ...node, x, y, fx: x, fy: y });
      });
    });

    const links = resumeData.links.map((l) => ({ ...l }));
    // Mirrored "ghost" links (source/target swapped, line hidden via linkColor)
    // carry the backward-pass particles - force-graph's particle speed can't
    // safely go negative, so a real link can't flow both directions itself.
    const ghostLinks = reducedMotion
      ? []
      : resumeData.links.map((l) => ({ source: l.target, target: l.source, __ghost: true }));

    return { nodes: positioned, links: [...links, ...ghostLinks] };
  }, [dimensions, reducedMotion]);

  // Adjacency for hover-highlight, built from the real links only (ghost
  // links are the same edges reversed, so they'd add nothing here).
  const linksByNode = useMemo(() => {
    const map = new Map();
    resumeData.links.forEach(({ source, target }) => {
      if (!map.has(source)) map.set(source, new Set());
      if (!map.has(target)) map.set(target, new Set());
      map.get(source).add(target);
      map.get(target).add(source);
    });
    return map;
  }, []);

  // Node x/y were computed to map 1:1 onto this canvas (see graphData above),
  // so center on the canvas midpoint at zoom 1 rather than zoomToFit - fitting
  // would rescale the intentional layout and push nodes under the hero text.
  const resetView = () => {
    graphRef.current?.centerAt(dimensions.width / 2, dimensions.height / 2, 0);
    graphRef.current?.zoom(1, 0);
  };

  useEffect(() => {
    readyRef.current = false;
    const t = setTimeout(() => {
      resetView();
      revealStartRef.current = Date.now();
      readyRef.current = true;
    }, 300);
    return () => clearTimeout(t);
  }, [graphData]);

  return (
    <ForceGraph2D
      ref={graphRef}
      width={dimensions.width}
      height={dimensions.height}
      graphData={graphData}
      cooldownTicks={0}
      autoPauseRedraw={false}
      nodeLabel="label"
      linkColor={(link) => {
        if (link.__ghost) return 'rgba(0,0,0,0)';
        const hovered = hoveredNodeRef.current;
        if (!hovered) return COLORS.link;
        const touchesHovered = link.source.id === hovered.id || link.target.id === hovered.id;
        return touchesHovered ? COLORS.linkHighlight : COLORS.linkDim;
      }}
      linkWidth={1}
      onNodeHover={(node) => { hoveredNodeRef.current = node; }}
      linkDirectionalParticles={reducedMotion ? 0 : 1}
      linkDirectionalParticleSpeed={0.004}
      linkDirectionalParticleWidth={(link) => (link.__ghost ? 2 : 3)}
      linkDirectionalParticleColor={(link) => (link.__ghost ? COLORS.particle.backward : COLORS.particle.forward)}
      backgroundColor={COLORS.bg}
      onNodeClick={(node) => {
        graphRef.current.centerAt(node.x, node.y, 600);
        graphRef.current.zoom(1.6, 600);
        onNodeClick(node);
      }}
      onBackgroundClick={resetView}
      nodeCanvasObject={(node, ctx, globalScale) => {
        // Nothing to draw correctly until the camera has settled onto the
        // real layout (see readyRef above) - draw calls before that would
        // just show nodes in the library's own, unrelated initial framing.
        if (!readyRef.current) {
          node.__nodeRadius = 0;
          return;
        }

        // Page-load reveal progress: 0 when the camera settles, 1 once this
        // node's layer-staggered fade+grow finishes. Reduced motion skips
        // straight to 1.
        const layerIndex = LAYER_ORDER.indexOf(node.type);
        const elapsed = Date.now() - revealStartRef.current;
        const reveal = reducedMotion
          ? 1
          : Math.min(1, Math.max(0, (elapsed - layerIndex * REVEAL_LAYER_DELAY) / REVEAL_DURATION));
        const revealEased = easeOutCubic(reveal);

        // Hover-highlight: dim everything not touching the hovered node.
        const hovered = hoveredNodeRef.current;
        const isDimmed = hovered && hovered.id !== node.id && !linksByNode.get(hovered.id)?.has(node.id);

        const r = getNodeRadius(node) * revealEased;
        const color = getNodeColor(node);
        const isMe = node.type === 'me';

        ctx.globalAlpha = (isDimmed ? 0.15 : 1) * revealEased;

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        if (isMe) {
          // The only glow on the page - the signal emerging from the network.
          // autoPauseRedraw={false} keeps the canvas repainting every frame,
          // so Date.now() here reads as a smooth pulse without any manual loop.
          ctx.shadowBlur = reducedMotion ? 18 : 18 + 6 * Math.sin(Date.now() / 300);
          ctx.shadowColor = color;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        if (!isMe) {
          // Flat + thin-stroke for everything else - precision over glow.
          ctx.lineWidth = 1;
          ctx.strokeStyle = COLORS.bg;
          ctx.stroke();
        }

        // Draw label, placed to avoid the neighboring layer's column
        const fontSize = Math.max(10, 12 / globalScale);
        ctx.font = `${fontSize}px ${FONTS.mono}`;
        ctx.fillStyle = COLORS.textPrimary;
        ctx.textBaseline = 'middle';

        const placement = getLabelPlacement(node);
        if (placement === 'left') {
          ctx.textAlign = 'right';
          ctx.fillText(node.label, node.x - r - 6, node.y);
        } else if (placement === 'right') {
          ctx.textAlign = 'left';
          ctx.fillText(node.label, node.x + r + 6, node.y);
        } else {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(node.label, node.x, node.y + r + 4);
        }

        ctx.globalAlpha = 1;
        node.__nodeRadius = r; // reused in nodePointerAreaPaint
      }}
      nodePointerAreaPaint={(node, color, ctx) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.__nodeRadius || getNodeRadius(node), 0, 2 * Math.PI, false);
        ctx.fill();
      }}
    />
  );
};

export default NeuralNetwork;
