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

const NeuralNetwork = ({ onNodeClick }) => {
  const graphRef = useRef();
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
    const leftMargin = 380; // clears the hero text block
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

  // Node x/y were computed to map 1:1 onto this canvas (see graphData above),
  // so center on the canvas midpoint at zoom 1 rather than zoomToFit - fitting
  // would rescale the intentional layout and push nodes under the hero text.
  const resetView = () => {
    graphRef.current?.centerAt(dimensions.width / 2, dimensions.height / 2, 0);
    graphRef.current?.zoom(1, 0);
  };

  useEffect(() => {
    const t = setTimeout(resetView, 300);
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
      linkColor={(link) => (link.__ghost ? 'rgba(0,0,0,0)' : COLORS.link)}
      linkWidth={1}
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
        const r = getNodeRadius(node);
        const color = getNodeColor(node);
        const isMe = node.type === 'me';

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
