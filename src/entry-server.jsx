import { renderToStaticMarkup } from 'react-dom/server';
import ResumeContent from './components/ResumeContent';

// Prerenders the same sr-only resume copy App.jsx already ships for
// screen readers and JS-executing crawlers, so a plain fetch (curl,
// non-JS bots) sees it too. Renders invisibly (.sr-only) - never the
// visible page - since main.jsx uses createRoot (not hydrateRoot) and
// would otherwise flash this content before replacing it on mount.
export function render() {
  return renderToStaticMarkup(<ResumeContent visuallyHidden />);
}
