import { useEffect } from 'react';

export default function useViewportHeight() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return undefined;
    const root = document.documentElement;
    const update = () => {
      root.style.setProperty('--vvh', `${vv.height}px`);
      root.classList.toggle('kb-open', window.innerHeight - vv.height > 150);
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      root.style.removeProperty('--vvh');
      root.classList.remove('kb-open');
    };
  }, []);
}