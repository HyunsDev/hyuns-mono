import { NavLink } from 'react-router-dom';

import { buttonVariants, cn } from '@workspace/ui';

const links = [
  { to: '/profile', label: '프로필' },
  { to: '/sessions', label: '세션 관리' },
];

export function AppNavigation() {
  return (
    <nav className="flex flex-wrap items-center gap-2">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            cn(
              buttonVariants({
                size: 'sm',
                variant: isActive ? 'default' : 'ghost',
              }),
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
