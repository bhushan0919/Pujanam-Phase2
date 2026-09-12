import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * -----------
 * Scrolls the window to (0, 0) whenever the route changes.
 * Place this once inside <Router> in App.jsx — it renders nothing,
 * it only runs the side-effect.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
