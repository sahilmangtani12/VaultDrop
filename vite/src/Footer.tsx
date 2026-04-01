import api from '@/lib/api';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { GitHub } from 'react-feather';

import type { DabihInfo } from './lib/api/types';

export default function Footer() {
  const [info, setInfo] = useState<DabihInfo | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      const { data } = await api.util.info();
      if (!data) {
        console.error('Failed to fetch info');
        return;
      }
      setInfo(data);
    };
    void fetchInfo();
  }, []);

  const branding = info?.branding;
  const department = branding?.department;
  const organization = branding?.organization;

  return (
    <footer className="relative z-10 mt-auto">
      <div className="glass-light rounded-t-3xl mx-4 mb-0">
        <div className="max-w-5xl mx-auto px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/vaultdrop-logo.png"
                  alt="VaultDrop"
                  className="w-6 h-6 object-contain"
                  width={24}
                  height={24}
                />
                <span className="text-white/90 font-semibold text-sm">VaultDrop</span>
              </div>
              <p className="text-xs leading-relaxed text-white/30">
                End-to-end encrypted cloud storage.
                <br />
                Your keys, your data.
              </p>
              {info?.version && (
                <p className="text-[10px] text-white/15 font-mono">v{info.version}</p>
              )}
            </div>

            {/* Links */}
            <div className="space-y-3">
              <h4 className="text-white/50 text-[10px] font-semibold uppercase tracking-[0.15em]">Resources</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link to="/docs" className="text-white/30 hover:text-white/70 transition-colors duration-300">Documentation</Link></li>
                <li><Link to="/docs/contact" className="text-white/30 hover:text-white/70 transition-colors duration-300">Contact</Link></li>
                <li><Link to="/docs/privacy" className="text-white/30 hover:text-white/70 transition-colors duration-300">Privacy Policy</Link></li>
                <li><Link to="/docs/data" className="text-white/30 hover:text-white/70 transition-colors duration-300">Data Policy</Link></li>
              </ul>
            </div>

            {/* Org */}
            <div className="space-y-3">
              {/* <h4 className="text-white/50 text-[10px] font-semibold uppercase tracking-[0.15em]">Organization</h4> */}
              <div className="space-y-1.5 text-xs">
                {/* {department && (
                  <a href={department.url ?? '#'} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/70 transition-colors duration-300 flex items-center gap-2">
                    {department.logo && <img src={department.logo} alt={department.name} className="w-4 h-4 object-contain opacity-40" />}
                    {department.name}
                  </a>
                )}
                {organization && (
                  <a href={organization.url ?? '#'} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/70 transition-colors duration-300 flex items-center gap-2">
                    {organization.logo && <img src={organization.logo} alt={organization.name} className="w-4 h-4 object-contain opacity-40" />}
                    {organization.name}
                  </a>
                )} */}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 pt-5 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-white/20">
            <p>© {new Date().getFullYear()} VaultDrop</p>
            <a
              href="https://github.com/sahilmangtani12/VaultSecure?tab=readme-ov-file"  /* repository URL stays same */
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white/50 transition-colors duration-300"
            >
              <GitHub size={11} />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
