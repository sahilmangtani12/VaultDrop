import { OpenIDProvider } from "@/lib/api/types/auth";

export default function ProviderButton({ provider }: { provider: OpenIDProvider | null }) {
  if (!provider) {
    return null;
  }
  const { logo_uri, name } = provider;
  return (
    <a
      href="/api/v1/auth/login"
      className="glass rounded-xl px-4 py-3 inline-flex items-center justify-center text-white font-medium text-sm hover:bg-white/[0.12] transition-all duration-300 w-full"
    >
      <img src={logo_uri} alt={`${name} logo`} className="h-5 w-5 mr-2.5 rounded" />
      <span>Sign in with {name}</span>
    </a>
  );
}
