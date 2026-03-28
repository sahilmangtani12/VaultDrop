'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'react-feather';
import api from '@/lib/api';
import Token from './Token';

import { TokenAddBody, TokenResponse } from '@/lib/api/types';
import CreateTokenDialog from '@/dialog/CreateToken';
import ShowTokenDialog from '@/dialog/ShowToken';
import useSession from '@/Session';




export default function Tokens() {
  const { user, hasApi } = useSession();
  const [tokens, setTokens] = useState<TokenResponse[]>([]);
  const [showCreateToken, setShowCreateToken] = useState(false);
  const [tokenValue, setTokenValue] = useState<string | null>(null);

  const scopes = user?.scope.split(' ') || [];


  const fetchTokens = useCallback(async () => {
    if (!hasApi) {
      return;
    }

    const { data, error } = await api.token.list();
    if (!data || error) {
      console.error(error);
      return;
    }
    setTokens(data);
  }, [hasApi]);

  const addToken = async (req: TokenAddBody) => {
    const { data: token, error } = await api.token.add(req);
    if (error) {
      console.error(error);
      return;
    }
    setTokenValue(token.value);
    await fetchTokens();
  }

  const removeToken = async (tokenId: string) => {
    await api.token.remove(tokenId);
    await fetchTokens();
  };

  useEffect(() => {
    fetchTokens().catch(console.error);
  }, [fetchTokens]);

  return (
    <div>
      <CreateTokenDialog
        show={showCreateToken}
        scopes={scopes}
        onClose={() => setShowCreateToken(false)}
        onSubmit={(r) => void addToken(r).catch(console.error)}
      />
      <ShowTokenDialog
        token={tokenValue}
        onClose={() => setTokenValue(null)}
      />

      {tokens.map((t) => (
        <Token data={t} key={t.value} onRemove={() => void removeToken(t.id as string)} />
      ))}
      <div hidden={tokens.length > 0} className="glass rounded-xl p-4 mb-3 text-white/30 text-sm text-center italic">
        You have no access tokens.
      </div>
      <button
        className="glass-strong rounded-xl px-3 py-2 text-white font-medium text-sm inline-flex items-center hover:bg-white/[0.12] transition-all duration-300"
        type="button"
        onClick={() => setShowCreateToken(true)}
      >
        <Plus size={16} className="mr-1.5 text-white/60" />
        Generate new token
      </button>
    </div>
  );
}
