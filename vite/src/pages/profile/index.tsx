import Tokens from './Tokens';
import PublicKeys from './PublicKeys';
import useSession from '@/Session';
import { Navigate } from 'react-router';
import FileData from './FileData';
import Account from './Account';

export default function Profile() {
  const { user, isAdmin } = useSession();

  if (!user) {
    return (
      <Navigate to="/signin" />
    );
  }


  return (
    <div className="max-w-5xl mx-auto pt-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Settings
        </h1>
        <p className="text-white/30 text-sm">
          Configure VaultDrop settings for your account.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-white mb-1">
          Your Account
        </h2>
        <p className="text-white/30 text-xs mb-3">
          Account details and session info.
        </p>
        <Account />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-1">
          Access Tokens
        </h2>
        <p className="text-white/30 text-xs mb-3">
          API tokens enable other tools to work with VaultDrop.
        </p>
        <Tokens />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-1">
          Public Keys
        </h2>
        <p className="text-white/30 text-xs mb-3">
          Registered keys for all users. Root keys can recover data.
        </p>
        <PublicKeys />
      </section>

      <section hidden={!isAdmin}>
        <h2 className="text-lg font-semibold text-white mb-1">
          File Data
        </h2>
        <p className="text-white/30 text-xs mb-3">
          Administrative file storage overview.
        </p>
        <FileData />
      </section>
    </div>
  );
}
