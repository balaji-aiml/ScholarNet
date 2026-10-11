import { useEffect } from 'react';

export default function useViewportHeight() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return undefined;
    const root = document.documentElement;
    let baseline = Math.max(window.innerHeight, vv.height); // tallest height seen = keyboard closed

    const update = () => {
      if (vv.height > baseline) baseline = vv.height;
      const keyboardOpen = baseline - vv.height > 150;
      root.style.setProperty('--vvh', `${vv.height}px`);
      root.classList.toggle('kb-open', keyboardOpen);
      // iPhone scrolls the whole page when the chat box is focused; put it back
      if (keyboardOpen && document.activeElement?.closest('.chat-shell')) window.scrollTo(0, 0);
    };
    const onRotate = () => setTimeout(() => {
      baseline = Math.max(window.innerHeight, vv.height);
      update();
    }, 300);

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    window.addEventListener('orientationchange', onRotate);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      window.removeEventListener('orientationchange', onRotate);
      root.style.removeProperty('--vvh');
      root.classList.remove('kb-open');
    };
  }, []);
}