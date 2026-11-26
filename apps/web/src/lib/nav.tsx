import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from 'react';

// Enrutado mínimo con la History API: 6 páginas no justifican un router.
export function usePath() {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => {
    const on = () => setPath(location.pathname);
    addEventListener('popstate', on);
    return () => removeEventListener('popstate', on);
  }, []);
  return path;
}

export function go(to: string) {
  history.pushState(null, '', to);
  dispatchEvent(new PopStateEvent('popstate'));
  scrollTo(0, 0);
}

export function Link({ to, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const path = usePath();
  function click(e: MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    go(to);
  }
  return <a href={to} onClick={click} aria-current={path === to ? 'page' : undefined} {...rest} />;
}
