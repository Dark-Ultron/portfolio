import resumeData from './resume.json';

const { nodes, links } = resumeData;

export const projectsForExperience = (expId) =>
  links
    .filter((l) => l.target === expId)
    .map((l) => nodes.find((n) => n.id === l.source))
    .filter((n) => n?.type === 'project');

export const skillsForProject = (projectId) =>
  links
    .filter((l) => l.target === projectId)
    .map((l) => nodes.find((n) => n.id === l.source))
    .filter((n) => n?.type === 'skill');
