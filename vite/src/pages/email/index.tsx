import useSession from "@/Session";
import { Mail } from "react-feather";
import { Link, Navigate } from "react-router";


export default function Email() {

  const { user } = useSession();
  if (user) {
    return <Navigate to="/key" />
  }


  return (
    <div className="flex flex-col items-center pt-16 max-w-md mx-auto text-center">
      <div className="glass rounded-2xl p-4 mb-6">
        <Mail size={48} className="text-white/50" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">
        Check your email
      </h1>
      <p className="text-white/40 text-sm leading-relaxed mb-6">
        We have sent you an email with a link to sign in. Please check your inbox and click the link to continue.
      </p>
      <Link to="/" className="text-white/40 hover:text-white/70 text-sm transition-colors duration-300">
        ← Back to home
      </Link>
    </div>
  );
}
