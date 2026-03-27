import React from 'react';
import { Link } from 'react-router';

interface NavItemProps {
  state: string,
  label: string,
  href: string,
  children: React.ReactNode,
}

const stateStyles: Record<string, { text: string }> = {
  complete: {
    text: 'text-green',
  },
  enabled: {
    text: 'text-white/50 hover:text-white/80',
  },
  active: {
    text: 'text-white',
  },
  disabled: {
    text: 'text-white/20',
  },
};

export default function NavItem({
  state, label, href, children,
}: NavItemProps) {
  const styles = stateStyles[state] || stateStyles.disabled;

  const content = (
    <div
      data-navitem
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${styles.text} transition-all duration-300 relative z-10`}
    >
      <div className="flex items-center justify-center">
        {children}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider leading-none">
        {label}
      </span>
    </div>
  );

  if (state === 'disabled') {
    return <div className="opacity-30 cursor-not-allowed">{content}</div>;
  }

  if (state === 'active') {
    return content;
  }

  return <Link to={href}>{content}</Link>;
}
