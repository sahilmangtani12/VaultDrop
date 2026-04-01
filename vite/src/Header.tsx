
import { Link, useLocation } from 'react-router';
import {
  UserPlus,
  Key,
  Share2,
  Home,
  User as UserIcon,
  LogOut,
  Settings,
  Menu as FeatherMenu,
  X,
  Play,
} from 'react-feather';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';

import NavItem from './NavItem';
import useSession from './Session';
import { useState, useRef, useLayoutEffect } from 'react';

const usePage = () => {
  const { pathname } = useLocation()
  const page = pathname?.split('/')[1] || 'start';
  return page;
};

type PageStatus = 'complete' | 'enabled' | 'disabled' | 'active';

/* Liquid-glass sliding indicator behind the active tab */
function NavIndicator({ containerRef, activeIndex }: { containerRef: React.RefObject<HTMLDivElement | null>; activeIndex: number }) {
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || activeIndex < 0) {
      setStyle({ opacity: 0 });
      return;
    }
    const children = container.children;
    // count only NavItem-like elements (skip dividers etc.)
    let navIndex = 0;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      // skip dividers (w-px elements)
      if (child.dataset.navitem === undefined) continue;
      if (navIndex === activeIndex) {
        const left = child.offsetLeft;
        const width = child.offsetWidth;
        setStyle({
          transform: `translateX(${left}px)`,
          width: `${width}px`,
          opacity: 1,
        });
        return;
      }
      navIndex++;
    }
    setStyle({ opacity: 0 });
  }, [activeIndex, containerRef]);

  return (
    <div
      className="absolute top-1 bottom-1 rounded-xl bg-white/[0.08] pointer-events-none"
      style={{
        ...style,
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), width 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
      }}
    />
  );
}


export default function Header() {
  const { user, key, signOut } = useSession();
  const page = usePage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const hasUser = !!user;
  const hasKey = !!key;

  const state: { [key: string]: PageStatus } = {
    start: 'complete',
    signin: (hasUser) ? 'complete' : 'enabled',
    key: (hasUser) ? (hasKey) ? 'complete' : 'enabled' : 'disabled',
    manage: (hasKey) ? 'enabled' : 'disabled',
    simulate: 'enabled',
    profile: (hasUser) ? 'enabled' : 'disabled',
  };
  state[page] = 'active';

  // Map page to nav index for the indicator
  const navOrder = ['start', 'manage', 'simulate'];
  const activeIndex = navOrder.indexOf(page);

  const getSignIn = () => {
    if (hasUser) {
      return (
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shrink-0">
            <UserIcon size={14} />
          </MenuButton>

          <MenuItems
            transition
            className="absolute right-0 mt-3 w-48 origin-top-right rounded-2xl bg-[#0f111a]/95 backdrop-blur-3xl border border-white/10 shadow-2xl focus:outline-none overflow-hidden transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <div className="p-1.5 flex flex-col gap-0.5">
               <MenuItem>
                 <Link to="/profile" className="group flex items-center gap-3 w-full px-3 py-2.5 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors">
                    <Settings size={14} className="text-white/40 group-hover:text-white/80" /> Settings
                 </Link>
               </MenuItem>
               <MenuItem>
                 <Link to="/key" className="group flex items-center gap-3 w-full px-3 py-2.5 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors">
                    <Key size={14} className="text-white/40 group-hover:text-white/80" /> Encryption Key
                 </Link>
               </MenuItem>
               <div className="h-px bg-white/5 my-1 mx-2" />
               <MenuItem>
                 <button onClick={() => signOut()} className="group flex items-center gap-3 w-full px-3 py-2.5 text-[13px] font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left">
                    <LogOut size={14} className="opacity-70 group-hover:opacity-100" /> Sign Out
                 </button>
               </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      );
    }
    return (
      <NavItem href="/signin" state="enabled" label="Sign In">
        <UserIcon size={14} />
      </NavItem>
    );
  };

  return (
    <nav className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-6xl">
      <div className="glass-strong rounded-2xl px-3 py-1.5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img
            className="w-7 h-7 object-contain"
            src="/images/vaultdrop-logo.png"
            width={28}
            height={28}
            alt="VaultDrop"
          />
          <span className="text-white/90 font-semibold text-xs tracking-wide hidden sm:inline">
            VaultDrop
          </span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-white/50 hover:text-white/90 p-1.5 rounded-lg hover:bg-white/[0.06] transition-all duration-200 ml-auto mr-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={16} /> : <FeatherMenu size={16} />}
        </button>

        {/* Desktop Nav — compact horizontal with liquid indicator */}
        <div ref={navRef} className="hidden lg:flex items-center gap-0.5 relative">
          <NavIndicator containerRef={navRef} activeIndex={activeIndex} />
          <NavItem href="/" state={state.start} label="Home">
            <Home size={14} />
          </NavItem>
          <NavItem href="/manage" state={state.manage} label="Files">
            <Share2 size={14} />
          </NavItem>
          <NavItem href="/simulate" state={state.simulate} label="Simulate">
            <Play size={14} />
          </NavItem>
          <div className="w-px h-5 bg-white/[0.08] mx-1" />
          {getSignIn()}
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="glass-strong rounded-2xl mt-1.5 px-3 py-2 flex flex-wrap gap-1.5 justify-center animate-fade-in">
          <NavItem href="/" state={state.start} label="Home">
            <Home size={14} />
          </NavItem>
          <NavItem href="/manage" state={state.manage} label="Manage">
            <Share2 size={14} />
          </NavItem>
          <NavItem href="/simulate" state={state.simulate} label="Simulate">
            <Play size={14} />
          </NavItem>
          <div className="w-px h-5 bg-white/[0.08]" />
          {getSignIn()}
        </div>
      )}
    </nav>
  );
}
