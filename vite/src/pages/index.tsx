import BrowserSupport from "@/util/BrowserSupport";
import { Link } from "react-router";
import { Shield, Share2, Key, ArrowRight, Lock, Cloud, HardDrive } from "react-feather";


function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-6 cursor-default">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.06] text-white/70 mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white/90 mb-1.5">{title}</h3>
      <p className="text-xs text-white/35 leading-relaxed">{description}</p>
    </div>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass rounded-2xl px-6 py-4 text-center">
      <div className="text-xl font-bold text-white/90">{value}</div>
      <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}


export default function Home() {
  return (
    <div className="min-h-screen -mx-6 -mb-6">
      <BrowserSupport />

      {/* ── Hero ── */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          {/* Copy */}
          <div className="flex-1 space-y-7 text-center lg:text-left stagger">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-white/50 text-[11px] font-medium tracking-wide">
              <Lock size={12} className="text-white/40" />
              Zero-Knowledge Encryption
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-white leading-[1.15]">
              Your files.
              <br />
              Your keys.
              <br />
              <span className="text-white/30">Your control.</span>
            </h1>

            <p className="text-[15px] text-white/35 max-w-md mx-auto lg:mx-0 leading-relaxed">
              VaultDrop is an end-to-end encrypted file storage platform.
              Files are encrypted client-side before they leave your browser.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <Link
                to="/signin"
                className="glass-strong inline-flex items-center gap-2 text-white font-medium text-sm px-6 py-3 rounded-xl hover:bg-white/[0.15] transition-all duration-300 group"
              >
                Get Started
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-300" />
              </Link>
              <Link
                to="/docs"
                className="glass inline-flex items-center text-white/50 hover:text-white/80 font-medium text-sm px-5 py-3 rounded-xl transition-all duration-300"
              >
                Documentation
              </Link>
            </div>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 animate-float">
            <img
              alt="VaultDrop Logo"
              width={200}
              height={200}
              className="w-48 h-48 lg:w-64 lg:h-64 object-contain opacity-85"
              src="/images/vaultdrop-logo.png"
            />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-3">
          <StatPill value="256-bit" label="AES Encryption" />
          <StatPill value="E2E" label="Client-Side" />
          <StatPill value="100%" label="Open Source" />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 stagger">
            <h2 className="text-2xl sm:text-3xl font-bold text-white/90 mb-3">
              Why VaultDrop?
            </h2>
            <p className="text-white/30 max-w-lg mx-auto text-sm">
              Built for teams that refuse to compromise on data privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
            <FeatureCard
              icon={<Shield size={18} />}
              title="End-to-End Encryption"
              description="Data is encrypted client-side using AES-256. Your keys never touch any server."
            />
            <FeatureCard
              icon={<Share2 size={18} />}
              title="Granular Access Control"
              description="Share with fine-grained permissions. Cryptographically enforce who accesses your data."
            />
            <FeatureCard
              icon={<Key size={18} />}
              title="You Own Your Keys"
              description="RSA key pairs generated on your device. No backdoors, no master keys."
            />
            <FeatureCard
              icon={<Cloud size={18} />}
              title="Cloud-Native Storage"
              description="Upload and organize files in encrypted virtual directories from any modern browser."
            />
            <FeatureCard
              icon={<HardDrive size={18} />}
              title="Chunked Transfers"
              description="Large files are split, hashed, and uploaded in parallel. Resume interrupted transfers."
            />
            <FeatureCard
              icon={<Lock size={18} />}
              title="Zero-Knowledge"
              description="The server only sees ciphertext. We cannot read your data even if we wanted to."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
