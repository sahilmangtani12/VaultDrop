import useSession from '@/Session';
import { Link, Navigate } from 'react-router';
import LoadKey from './LoadKey';
import CreateKey from './CreateKey';
import { Clock } from 'react-feather';
import { Spinner } from '@/util';

function KeyContent() {
  const { status } = useSession();
  if (status === "registered_key_disabled") {
    return (
      <div className="py-10 text-center max-w-md mx-auto">
        <div className="glass rounded-2xl p-4 inline-block mb-4">
          <Clock className="text-white/50" size={48} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Awaiting admin approval
        </h2>
        <p className="text-white/35 text-sm mb-4 leading-relaxed">
          Each new key must be enabled by an admin to prevent misuse.
          Please contact the admin for approval.
        </p>
        <Link className="text-white/50 hover:text-white/70 text-sm transition-colors duration-300" to="/docs/contact">
          Contact Admin →
        </Link>
      </div>
    );
  }
  if (status === "registered") {
    return (
      <LoadKey />
    );
  }

  if (status === "registered_without_key") {
    return (
      <CreateKey />
    );
  }
  return (
    <div className="flex justify-center mt-10">
      <Spinner />
    </div>
  );
}




export default function ManageKey() {
  const { user, status } = useSession();

  if (!user) {
    return <Navigate to="/signin" />;
  }
  if (status === "authenticated") {
    return <Navigate to="/manage" />;
  }

  return (
    <div className="max-w-4xl mx-auto pt-4">
      <h1 className="text-3xl font-bold text-white mb-2">
        Load your encryption key
      </h1>
      <div className="text-sm text-white/35 leading-relaxed mb-8 space-y-2">
        <p>
          VaultDrop uses asymmetric key pairs for data encryption.
        </p>
        <p>Each key has two parts:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-white/30">
          <li>
            A <span className="text-white/50 font-medium">public key</span> used to encrypt data.
            It is stored on VaultDrop and is public information.
          </li>
          <li>
            A <span className="text-white/50 font-medium">private key</span> used to decrypt data.
            It should <span className="text-white/50 font-medium">never</span> be shared — only you should have it.
          </li>
        </ul>
      </div>
      <KeyContent />
    </div>
  );
}
