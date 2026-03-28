import { Mail } from "react-feather";
import useSession from "@/Session";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import ProviderButton from "./ProviderButton";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const { signIn, provider, user, error, clearError } = useSession();

  if (user) {
    return <Navigate to="/key" />
  }


  return (
    <div className="max-w-lg mx-auto pt-4">
      {error && (
        <div className="glass rounded-xl px-4 py-3 mb-6 border-red/30 border flex items-center justify-between">
          <div>
            <span className="font-semibold text-red text-sm">Error: </span>
            <span className="text-white/70 text-sm">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-white/40 hover:text-white/70 transition-colors text-lg ml-3"
          >
            &times;
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold text-white mb-2">
        Sign in to your account
      </h1>
      <p className="text-white/35 text-sm mb-8">
        Access your encrypted files securely.
      </p>

      <div hidden={!provider} className="mb-6">
        <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
          OpenID
        </h2>
        <ProviderButton provider={provider} />
      </div>

      <form onSubmit={async (e) => {
        e.preventDefault()
        await signIn(email);
        navigate("/email");
      }}>
        <label htmlFor="email">
          <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">
            Email
          </span>
          <input
            className="glass w-full rounded-xl px-4 py-3 mt-2 mb-4 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="email"
            type="email"
          />
        </label>
        <button
          className="w-full glass-strong rounded-xl px-4 py-3 inline-flex items-center justify-center text-white font-medium text-sm hover:bg-white/[0.12] transition-all duration-300"
          type="submit"
        >
          <Mail size={18} className="mr-2.5 text-white/60" />
          Sign in with email
        </button>
      </form>
    </div>
  );
}
