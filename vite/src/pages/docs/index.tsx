import { useState, useMemo } from 'react';
import {
    ChevronDown, ChevronRight, Copy, Check, Download,
    ArrowLeft, Lock, Shield, Server, Code, Send, Search,
    ExternalLink,
} from 'react-feather';
import { Link } from 'react-router';
import { sections, BASE_PATH, type Endpoint, type Method, type ApiSection } from './apiData';
import { downloadCollection } from './postman';

/* ─── Helpers ──────────────────────── */

const methodColors: Record<Method, { badge: string; border: string; glow: string }> = {
    GET: { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', border: 'border-emerald-500/10', glow: 'hover:shadow-emerald-500/5' },
    POST: { badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30', border: 'border-blue-500/10', glow: 'hover:shadow-blue-500/5' },
    PUT: { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', border: 'border-amber-500/10', glow: 'hover:shadow-amber-500/5' },
    DELETE: { badge: 'bg-red-500/15 text-red-400 border-red-500/30', border: 'border-red-500/10', glow: 'hover:shadow-red-500/5' },
};

function CopyBtn({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }).catch(console.error);
    };
    return (
        <button type="button" onClick={copy} className="p-1 rounded-md hover:bg-white/[0.06] transition-colors text-white/25 hover:text-white/50" title="Copy">
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        </button>
    );
}

/* ─── Endpoint Card ───────────────── */

function EndpointCard({ ep, baseUrl }: { ep: Endpoint; baseUrl: string }) {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<'docs' | 'try'>('docs');
    const [bodyInput, setBodyInput] = useState(ep.body?.example ?? '');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState('');

    const fullUrl = `${baseUrl}${BASE_PATH}${ep.path}`;
    const c = methodColors[ep.method];

    const sendRequest = async () => {
        setLoading(true);
        setResponse('');
        try {
            let url = `${baseUrl}${BASE_PATH}${ep.path}`;
            // replace path params with placeholder
            url = url.replace(/\{(\w+)\}/g, ':$1');

            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

            const opts: RequestInit = { method: ep.method, headers };
            if (ep.body && (ep.method === 'POST' || ep.method === 'PUT')) {
                opts.body = bodyInput;
            }

            const res = await fetch(url, opts);
            const contentType = res.headers.get('content-type') ?? '';
            let text: string;
            if (contentType.includes('json')) {
                const json = await res.json();
                text = JSON.stringify(json, null, 2);
            } else {
                text = await res.text();
            }
            setResponse(`HTTP ${res.status} ${res.statusText}\n\n${text}`);
        } catch (err) {
            setResponse(`Error: ${err instanceof Error ? err.message : 'Network error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`rounded-xl border ${c.border} transition-all duration-200 ${c.glow} hover:shadow-lg overflow-hidden`}>
            {/* Header row */}
            <button
                type="button" onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
            >
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border shrink-0 ${c.badge}`}>
                    {ep.method}
                </span>
                <code className="text-white/60 text-xs font-mono flex-1 truncate">{BASE_PATH}{ep.path}</code>
                <span className="text-white/30 text-xs hidden md:inline truncate max-w-[200px]">{ep.summary}</span>
                {ep.auth && (
                    <Lock size={10} className="text-white/15 shrink-0" />
                )}
                {open ? <ChevronDown size={14} className="text-white/15 shrink-0" /> : <ChevronRight size={14} className="text-white/15 shrink-0" />}
            </button>

            {/* Expanded */}
            {open && (
                <div className="border-t border-white/[0.04] animate-fade-in">
                    {/* Tab bar */}
                    <div className="flex border-b border-white/[0.04]">
                        <button type="button" onClick={() => setTab('docs')}
                            className={`px-4 py-2 text-xs font-medium transition-colors ${tab === 'docs' ? 'text-white/80 border-b-2 border-white/20' : 'text-white/30 hover:text-white/50'}`}
                        >Documentation</button>
                        <button type="button" onClick={() => setTab('try')}
                            className={`px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${tab === 'try' ? 'text-white/80 border-b-2 border-white/20' : 'text-white/30 hover:text-white/50'}`}
                        ><Send size={10} /> Try It</button>
                    </div>

                    {tab === 'docs' ? (
                        <div className="px-4 py-4 space-y-4 text-xs">
                            <p className="text-white/50 leading-relaxed">{ep.description}</p>

                            {/* URL */}
                            <div>
                                <span className="text-white/20 font-semibold uppercase text-[10px] tracking-wider">URL</span>
                                <div className="flex items-center mt-1 glass rounded-lg px-3 py-2 font-mono text-[11px]">
                                    <span className="text-white/50 flex-1 break-all">{fullUrl}</span>
                                    <CopyBtn text={fullUrl} />
                                </div>
                            </div>

                            {/* Auth */}
                            {ep.auth && (
                                <div>
                                    <span className="text-white/20 font-semibold uppercase text-[10px] tracking-wider">Authorization</span>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="glass rounded-md px-2 py-1 text-white/50 font-mono text-[11px]">{ep.auth}</span>
                                        {ep.scope && <span className="text-white/20">scope:</span>}
                                        {ep.scope && <span className="glass rounded-md px-2 py-1 text-amber-400/60 font-mono text-[11px]">{ep.scope}</span>}
                                    </div>
                                </div>
                            )}

                            {/* Params */}
                            {ep.params && ep.params.length > 0 && (
                                <div>
                                    <span className="text-white/20 font-semibold uppercase text-[10px] tracking-wider">Parameters</span>
                                    <div className="mt-1 glass rounded-lg overflow-hidden">
                                        <table className="w-full text-[11px]">
                                            <thead>
                                                <tr className="border-b border-white/[0.04]">
                                                    <th className="text-left text-white/25 font-medium px-3 py-1.5">Name</th>
                                                    <th className="text-left text-white/25 font-medium px-3 py-1.5">In</th>
                                                    <th className="text-left text-white/25 font-medium px-3 py-1.5">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ep.params.map((p) => (
                                                    <tr key={p.name} className="border-b border-white/[0.02] last:border-0">
                                                        <td className="px-3 py-1.5 font-mono text-white/60">{p.name}{p.required && <span className="text-red ml-1">*</span>}</td>
                                                        <td className="px-3 py-1.5 text-white/30">{p.in}</td>
                                                        <td className="px-3 py-1.5 text-white/40">{p.description}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Request Body */}
                            {ep.body && (
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/20 font-semibold uppercase text-[10px] tracking-wider">Request Body</span>
                                        <span className="text-white/15 font-mono text-[10px]">{ep.body.type}</span>
                                    </div>
                                    <div className="mt-1 glass rounded-lg relative">
                                        <pre className="px-3 py-2.5 text-[11px] text-white/50 font-mono overflow-x-auto whitespace-pre">{ep.body.example}</pre>
                                        <div className="absolute top-1.5 right-1.5"><CopyBtn text={ep.body.example} /></div>
                                    </div>
                                </div>
                            )}

                            {/* Response */}
                            {ep.response && (
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/20 font-semibold uppercase text-[10px] tracking-wider">Response</span>
                                        <span className="text-white/15 font-mono text-[10px]">{ep.response.type}</span>
                                    </div>
                                    <div className="mt-1 glass rounded-lg relative">
                                        <pre className="px-3 py-2.5 text-[11px] text-emerald-400/60 font-mono overflow-x-auto whitespace-pre">{ep.response.example}</pre>
                                        <div className="absolute top-1.5 right-1.5"><CopyBtn text={ep.response.example} /></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Try It panel */
                        <div className="px-4 py-4 space-y-3 text-xs">
                            {/* Auth input */}
                            <div>
                                <label className="text-white/20 font-semibold uppercase text-[10px] tracking-wider">Bearer Token</label>
                                <input
                                    value={authToken} onChange={(e) => setAuthToken(e.target.value)}
                                    placeholder="Paste your JWT or API token..."
                                    className="w-full mt-1 glass rounded-lg px-3 py-2 text-[11px] text-white/60 font-mono placeholder-white/15 focus:outline-none focus:ring-1 focus:ring-white/10"
                                />
                            </div>

                            {/* Body editor */}
                            {ep.body && (
                                <div>
                                    <label className="text-white/20 font-semibold uppercase text-[10px] tracking-wider">Request Body</label>
                                    <textarea
                                        value={bodyInput} onChange={(e) => setBodyInput(e.target.value)}
                                        rows={Math.min(bodyInput.split('\n').length + 1, 12)}
                                        className="w-full mt-1 glass rounded-lg px-3 py-2 text-[11px] text-white/60 font-mono resize-y focus:outline-none focus:ring-1 focus:ring-white/10"
                                    />
                                </div>
                            )}

                            {/* Send */}
                            <button
                                type="button" onClick={sendRequest} disabled={loading}
                                className="glass-strong rounded-lg px-4 py-2 text-xs font-medium text-white/80 hover:bg-white/[0.12] transition-all duration-200 flex items-center gap-2 disabled:opacity-40"
                            >
                                {loading
                                    ? <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                                    : <Send size={12} />}
                                Execute
                            </button>

                            {/* Response */}
                            {response && (
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white/20 font-semibold uppercase text-[10px] tracking-wider">Response</span>
                                        <CopyBtn text={response} />
                                    </div>
                                    <pre className="glass rounded-lg px-3 py-2.5 text-[11px] font-mono text-white/50 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre">{response}</pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── Section ─────────────────────── */

function SectionPanel({ section, baseUrl }: { section: ApiSection; baseUrl: string }) {
    const [open, setOpen] = useState(true);
    const methods = section.endpoints.reduce((acc, e) => {
        acc[e.method] = (acc[e.method] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="glass-card rounded-2xl overflow-hidden" id={`section-${section.tag.toLowerCase().replace(/\s/g, '-')}`}>
            <button
                type="button" onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg">{section.icon}</span>
                    <div>
                        <h3 className="text-sm font-semibold text-white/90">{section.tag}</h3>
                        <p className="text-[11px] text-white/25 mt-0.5">{section.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="hidden sm:flex gap-1">
                        {Object.entries(methods).map(([m, count]) => (
                            <span key={m} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${methodColors[m as Method].badge}`}>
                                {count} {m}
                            </span>
                        ))}
                    </div>
                    {open ? <ChevronDown size={14} className="text-white/15" /> : <ChevronRight size={14} className="text-white/15" />}
                </div>
            </button>
            {open && (
                <div className="px-4 pb-4 space-y-2">
                    {section.endpoints.map((ep) => (
                        <EndpointCard key={ep.operationId} ep={ep} baseUrl={baseUrl} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Main Page ───────────────────── */

export default function Docs() {
    const [baseUrl, setBaseUrl] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }
        return 'http://localhost:8080';
    });
    const [filter, setFilter] = useState('');
    const [copiedBase, setCopiedBase] = useState(false);

    const totalEndpoints = sections.reduce((a, s) => a + s.endpoints.length, 0);

    const filtered = useMemo(() => {
        if (!filter) return sections;
        const q = filter.toLowerCase();
        return sections.map((s) => ({
            ...s,
            endpoints: s.endpoints.filter(
                (e) => e.summary.toLowerCase().includes(q) || e.path.toLowerCase().includes(q) || e.operationId.toLowerCase().includes(q) || e.method.toLowerCase().includes(q)
            ),
        })).filter((s) => s.endpoints.length > 0);
    }, [filter]);

    const copyBase = () => {
        navigator.clipboard.writeText(`${baseUrl}${BASE_PATH}`).then(() => {
            setCopiedBase(true);
            setTimeout(() => setCopiedBase(false), 1500);
        }).catch(console.error);
    };

    return (
        <div className="max-w-5xl mx-auto pt-4 pb-16">
            {/* Back */}
            <Link to="/" className="inline-flex items-center gap-1.5 text-white/25 hover:text-white/50 text-xs mb-6 transition-colors">
                <ArrowLeft size={12} /> Back to Home
            </Link>

            {/* Title */}
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold text-white">API Reference</h1>
                        <span className="glass rounded-full px-2.5 py-0.5 text-[10px] text-white/30 font-mono">v1</span>
                    </div>
                    <p className="text-white/30 text-sm max-w-2xl leading-relaxed">
                        Interactive documentation for the VaultDrop REST API.
                        Explore endpoints, view examples, and test requests directly from this page.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => downloadCollection(baseUrl)}
                    className="glass-strong rounded-xl px-4 py-2.5 text-xs font-medium text-white/70 hover:bg-white/[0.12] transition-all duration-200 flex items-center gap-2 shrink-0"
                >
                    <Download size={14} />
                    Export Postman Collection
                </button>
            </div>

            {/* Base URL */}
            <div className="glass-card rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Server size={14} className="text-white/30" />
                    <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Base URL</span>
                    <span className="text-[10px] text-white/15 font-mono ml-auto">Click to copy</span>
                </div>
                <div className="flex items-stretch gap-2">
                    <input
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        className="glass rounded-xl px-4 py-2.5 text-sm text-white/70 font-mono flex-1 focus:outline-none focus:ring-1 focus:ring-white/15 placeholder-white/15"
                        placeholder="http://localhost:8080"
                    />
                    <button
                        type="button" onClick={copyBase}
                        className="glass-strong rounded-xl px-4 py-2.5 text-xs font-medium text-white/60 hover:bg-white/[0.12] transition-all flex items-center gap-2 shrink-0"
                    >
                        {copiedBase ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        {copiedBase ? 'Copied!' : `${baseUrl}${BASE_PATH}`}
                    </button>
                </div>
                <p className="text-white/15 text-[10px] mt-2 flex items-center gap-1.5">
                    <ExternalLink size={9} />
                    Use this base URL in Postman, cURL, or any HTTP client. All endpoints are relative to this URL.
                </p>
            </div>

            {/* Quick stats + Auth info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
                <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                    <Code size={16} className="text-white/25 shrink-0" />
                    <div>
                        <div className="text-xs font-semibold text-white/60">{totalEndpoints} Endpoints</div>
                        <span className="text-[10px] text-white/25">{sections.length} modules</span>
                    </div>
                </div>
                <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                    <Shield size={16} className="text-white/25 shrink-0" />
                    <div>
                        <div className="text-xs font-semibold text-white/60">Bearer JWT Auth</div>
                        <span className="text-[10px] text-white/25">base · api · admin scopes</span>
                    </div>
                </div>
                <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                    <Lock size={16} className="text-white/25 shrink-0" />
                    <div>
                        <div className="text-xs font-semibold text-white/60">E2E Encrypted</div>
                        <span className="text-[10px] text-white/25">AES-256 + RSA key pairs</span>
                    </div>
                </div>
            </div>

            {/* Auth section */}
            <details className="glass-card rounded-2xl mb-6 group" open>
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none">
                    <div className="flex items-center gap-2">
                        <Lock size={14} className="text-white/30" />
                        <h2 className="text-sm font-semibold text-white/80">Authentication Guide</h2>
                    </div>
                    <ChevronDown size={14} className="text-white/15 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-xs text-white/40 space-y-3 leading-relaxed border-t border-white/[0.04] pt-4">
                    <p>
                        Pass a JWT token in the <code className="glass rounded px-1.5 py-0.5 text-white/50 font-mono text-[11px]">Authorization</code> header:
                    </p>
                    <div className="glass rounded-lg px-3 py-2.5 font-mono text-[11px] text-white/50 flex items-center justify-between">
                        <span>Authorization: Bearer {'<'}your-jwt-token{'>'}</span>
                        <CopyBtn text="Authorization: Bearer <your-jwt-token>" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        <div className="glass rounded-lg px-3 py-2.5">
                            <div className="text-white/60 font-semibold">base</div>
                            <div className="text-white/20 text-[10px] mt-0.5">Basic session — view profile, add keys</div>
                        </div>
                        <div className="glass rounded-lg px-3 py-2.5">
                            <div className="text-white/60 font-semibold">api</div>
                            <div className="text-white/20 text-[10px] mt-0.5">Full access — upload, download, manage files</div>
                        </div>
                        <div className="glass rounded-lg px-3 py-2.5">
                            <div className="text-white/60 font-semibold">admin</div>
                            <div className="text-white/20 text-[10px] mt-0.5">Administrative — user mgmt, file integrity</div>
                        </div>
                    </div>
                    <p className="text-white/25 text-[10px]">
                        Obtain a token via <code className="font-mono">POST /auth/signIn</code> → <code className="font-mono">POST /auth/verify</code>, or use a long-lived API token from Settings.
                    </p>
                </div>
            </details>

            {/* Search / TOC */}
            <div className="flex items-center gap-3 mb-4">
                <div className="glass rounded-xl flex items-center px-3 flex-1">
                    <Search size={14} className="text-white/20 shrink-0" />
                    <input
                        value={filter} onChange={(e) => setFilter(e.target.value)}
                        placeholder="Search endpoints... (e.g. upload, GET, listHome)"
                        className="w-full bg-transparent px-3 py-2.5 text-xs text-white/60 placeholder-white/15 focus:outline-none"
                    />
                    {filter && (
                        <button type="button" onClick={() => setFilter('')} className="text-white/20 hover:text-white/40 text-sm">×</button>
                    )}
                </div>
                <div className="text-white/15 text-[10px] shrink-0">{filtered.reduce((a, s) => a + s.endpoints.length, 0)} results</div>
            </div>

            {/* Table of contents */}
            <div className="flex flex-wrap gap-1.5 mb-6">
                {sections.map((s) => (
                    <a
                        key={s.tag}
                        href={`#section-${s.tag.toLowerCase().replace(/\s/g, '-')}`}
                        className="glass rounded-lg px-2.5 py-1 text-[10px] text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all font-medium"
                    >
                        {s.icon} {s.tag}
                    </a>
                ))}
            </div>

            {/* Sections */}
            <div className="space-y-4">
                {filtered.map((s) => (
                    <SectionPanel key={s.tag} section={s} baseUrl={baseUrl} />
                ))}
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-white/20 text-sm">No endpoints match your search.</div>
                )}
            </div>
        </div>
    );
}
