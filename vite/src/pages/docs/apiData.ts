export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface Param {
    name: string;
    in: 'path' | 'header' | 'query';
    required?: boolean;
    description?: string;
    example?: string;
}

export interface Endpoint {
    method: Method;
    path: string;
    operationId: string;
    summary: string;
    description: string;
    auth?: string;
    scope?: string;
    params?: Param[];
    body?: { type: string; example: string };
    response?: { type: string; example: string };
}

export interface ApiSection {
    tag: string;
    icon: string;
    description: string;
    endpoints: Endpoint[];
}

export const BASE_PATH = '/api/v1';

export const sections: ApiSection[] = [
    {
        tag: 'Util',
        icon: '⚡',
        description: 'Health check and server metadata. No authentication required.',
        endpoints: [
            {
                method: 'GET', path: '/healthy', operationId: 'healthy',
                summary: 'Health Check',
                description: 'Returns whether the server is running and healthy.',
                response: { type: '{ healthy: boolean }', example: '{\n  "healthy": true\n}' },
            },
            {
                method: 'GET', path: '/info', operationId: 'info',
                summary: 'Server Info',
                description: 'Returns server version, branding, and configuration metadata.',
                response: { type: 'ServerInfo', example: '{\n  "version": "2.0.0",\n  "branding": {\n    "organization": { "name": "Example Corp" },\n    "department": { "name": "Engineering" }\n  }\n}' },
            },
        ],
    },
    {
        tag: 'Auth',
        icon: '🔐',
        description: 'Authentication via email magic links or OpenID Connect.',
        endpoints: [
            {
                method: 'GET', path: '/auth/provider', operationId: 'authProvider',
                summary: 'Get OIDC Provider',
                description: 'Returns the configured OpenID Connect provider, or null.',
                response: { type: 'OpenIDProvider | null', example: '{\n  "name": "Google",\n  "url": "https://accounts.google.com"\n}' },
            },
            {
                method: 'POST', path: '/auth/signIn', operationId: 'signIn',
                summary: 'Email Sign-In',
                description: 'Sends a verification magic link to the provided email. Rate-limited per IP.',
                body: { type: '{ email: string }', example: '{\n  "email": "user@example.com"\n}' },
                response: { type: 'SignInResponse', example: '{\n  "success": true,\n  "message": "Verification email sent"\n}' },
            },
            {
                method: 'POST', path: '/auth/verify', operationId: 'verifyEmail',
                summary: 'Verify Email Token',
                description: 'Validates the magic link token and returns a session JWT.',
                body: { type: '{ token: string }', example: '{\n  "token": "eyJhbGciOi..."\n}' },
                response: { type: 'string', example: '"eyJhbGciOiJSUzI1NiIs..."' },
            },
            {
                method: 'GET', path: '/auth/login', operationId: 'loginRedirect',
                summary: 'OIDC Login Redirect',
                description: 'Redirects to the OpenID Connect provider for OAuth login.',
                response: { type: '302 Redirect', example: 'Redirects to OIDC provider URL' },
            },
            {
                method: 'GET', path: '/auth/callback', operationId: 'loginCallback',
                summary: 'OIDC Callback',
                description: 'Handles the OIDC callback. Redirects to frontend with session token.',
                params: [{ name: 'state', in: 'query', description: 'OAuth state parameter' }],
                response: { type: '302 Redirect', example: 'Redirects to /signin/success/{token}' },
            },
            {
                method: 'GET', path: '/auth/info', operationId: 'authInfo',
                summary: 'Session Info',
                description: 'Returns the authenticated user from the current JWT session.',
                auth: 'Bearer', scope: 'any',
                response: { type: 'User', example: '{\n  "sub": "user-123",\n  "email": "user@example.com",\n  "admin": false\n}' },
            },
            {
                method: 'POST', path: '/auth/refresh', operationId: 'refreshToken',
                summary: 'Refresh Token',
                description: 'Issues a new JWT from an existing valid token.',
                auth: 'Bearer', scope: 'base',
                body: { type: '{ token: string }', example: '{\n  "token": "eyJhbGciOi..."\n}' },
                response: { type: 'string', example: '"eyJhbGciOiJSUzI1NiIs..."' },
            },
        ],
    },
    {
        tag: 'User',
        icon: '👤',
        description: 'User management, public key registration, and admin controls.',
        endpoints: [
            {
                method: 'GET', path: '/user/me', operationId: 'me',
                summary: 'Current User', description: 'Returns current user profile with keys.',
                auth: 'Bearer', scope: 'base',
                response: { type: 'UserResponse', example: '{\n  "sub": "user-123",\n  "email": "user@example.com",\n  "admin": false,\n  "keys": [{ "hash": "abc...", "enabled": true }]\n}' },
            },
            {
                method: 'GET', path: '/user/list', operationId: 'listUsers',
                summary: 'List Users', description: 'Lists all registered users.',
                auth: 'Bearer', scope: 'api',
                response: { type: 'UserResponse[]', example: '[{ "sub": "user-123", "email": "user@example.com" }]' },
            },
            {
                method: 'POST', path: '/user/add', operationId: 'addUser',
                summary: 'Add User', description: 'Register a new user account.',
                auth: 'Bearer', scope: 'api',
                body: { type: 'UserAddBody', example: '{\n  "sub": "new-user",\n  "email": "new@example.com"\n}' },
                response: { type: 'UserResponse (201)', example: '{ "sub": "new-user", "email": "new@example.com" }' },
            },
            {
                method: 'POST', path: '/user/find', operationId: 'findUser',
                summary: 'Find User', description: 'Look up a user by subject identifier.',
                auth: 'Bearer', scope: 'api',
                body: { type: '{ sub: string }', example: '{\n  "sub": "user-123"\n}' },
                response: { type: 'UserResponse | null', example: '{ "sub": "user-123", "email": "user@example.com" }' },
            },
            {
                method: 'GET', path: '/user/findKey/{hash}', operationId: 'findKey',
                summary: 'Find by Key Hash', description: 'Find user by public key SHA-256 hash. No auth.',
                params: [{ name: 'hash', in: 'path', required: true, description: 'SHA-256 hash of the public key', example: 'abc123def456' }],
                response: { type: 'UserResponse | null', example: '{ "sub": "user-123", "email": "user@example.com" }' },
            },
            {
                method: 'POST', path: '/user/remove', operationId: 'removeUser',
                summary: 'Remove User', description: 'Delete a user account.',
                auth: 'Bearer', scope: 'api',
                body: { type: '{ sub: string }', example: '{\n  "sub": "user-123"\n}' },
            },
            {
                method: 'POST', path: '/user/admin', operationId: 'setAdmin',
                summary: 'Set Admin', description: 'Grant or revoke admin privileges.',
                auth: 'Bearer', scope: 'admin',
                body: { type: '{ sub: string, admin: boolean }', example: '{\n  "sub": "user-123",\n  "admin": true\n}' },
                response: { type: 'UserResponse | null', example: '{ "sub": "user-123", "admin": true }' },
            },
            {
                method: 'POST', path: '/user/key/add', operationId: 'addKey',
                summary: 'Add Public Key', description: 'Register an RSA public key for the current user.',
                auth: 'Bearer', scope: 'base',
                body: { type: 'KeyAddBody', example: '{\n  "key": "-----BEGIN PUBLIC KEY-----\\n...\\n-----END PUBLIC KEY-----"\n}' },
                response: { type: 'PublicKey (201)', example: '{ "hash": "abc...", "enabled": false }' },
            },
            {
                method: 'POST', path: '/user/key/enable', operationId: 'enableKey',
                summary: 'Enable/Disable Key', description: 'Toggle a public key\'s enabled status.',
                auth: 'Bearer', scope: 'api',
                body: { type: 'KeyEnableBody', example: '{\n  "hash": "abc...",\n  "enabled": true\n}' },
                response: { type: 'PublicKey', example: '{ "hash": "abc...", "enabled": true }' },
            },
            {
                method: 'POST', path: '/user/key/remove', operationId: 'removeKey',
                summary: 'Remove Key', description: 'Delete a registered public key.',
                auth: 'Bearer', scope: 'api',
                body: { type: 'KeyRemoveBody', example: '{\n  "hash": "abc..."\n}' },
            },
        ],
    },
    {
        tag: 'Token',
        icon: '🎟️',
        description: 'API access token lifecycle management.',
        endpoints: [
            {
                method: 'POST', path: '/token/add', operationId: 'addToken',
                summary: 'Create Token', description: 'Generate a new long-lived API token.',
                auth: 'Bearer', scope: 'api',
                body: { type: 'TokenAddBody', example: '{\n  "name": "CI Pipeline"\n}' },
                response: { type: 'TokenResponse', example: '{ "id": 1, "name": "CI Pipeline", "token": "tok_..." }' },
            },
            {
                method: 'GET', path: '/token/list', operationId: 'listTokens',
                summary: 'List Tokens', description: 'List all API tokens for the current user.',
                auth: 'Bearer', scope: 'api',
                response: { type: 'TokenResponse[]', example: '[{ "id": 1, "name": "CI Pipeline" }]' },
            },
            {
                method: 'POST', path: '/token/remove', operationId: 'removeToken',
                summary: 'Revoke Token', description: 'Permanently revoke an API token.',
                auth: 'Bearer', scope: 'api',
                body: { type: '{ tokenId: string }', example: '{\n  "tokenId": "1"\n}' },
            },
        ],
    },
    {
        tag: 'Upload',
        icon: '📤',
        description: 'Chunked file upload with SHA-256 integrity verification.',
        endpoints: [
            {
                method: 'POST', path: '/upload/start', operationId: 'startUpload',
                summary: 'Start Upload', description: 'Initialize a new chunked upload session. Returns 201.',
                auth: 'Bearer', scope: 'api',
                body: { type: 'UploadStartBody', example: '{\n  "fileName": "report.pdf",\n  "directory": "mnemonic-abc",\n  "size": 1048576\n}' },
                response: { type: 'File (201)', example: '{ "mnemonic": "upload-xyz", "fileName": "report.pdf" }' },
            },
            {
                method: 'PUT', path: '/upload/{mnemonic}/chunk', operationId: 'chunkUpload',
                summary: 'Upload Chunk', description: 'Upload a single chunk with integrity headers.',
                auth: 'Bearer', scope: 'api',
                params: [
                    { name: 'mnemonic', in: 'path', required: true, description: 'Upload session mnemonic' },
                    { name: 'Content-Range', in: 'header', required: true, description: 'Byte range', example: 'bytes 0-65535/1048576' },
                    { name: 'Digest', in: 'header', required: true, description: 'SHA-256 hash', example: 'sha-256=abc123...' },
                ],
                response: { type: 'Chunk (201)', example: '{ "hash": "abc...", "start": 0, "end": 65535 }' },
            },
            {
                method: 'POST', path: '/upload/{mnemonic}/finish', operationId: 'finishUpload',
                summary: 'Finish Upload', description: 'Finalize: assemble chunks, verify integrity, create inode.',
                auth: 'Bearer', scope: 'api',
                params: [{ name: 'mnemonic', in: 'path', required: true }],
                response: { type: 'File', example: '{ "mnemonic": "file-xyz", "fileName": "report.pdf" }' },
            },
            {
                method: 'POST', path: '/upload/{mnemonic}/cancel', operationId: 'cancelUpload',
                summary: 'Cancel Upload', description: 'Cancel and clean up an in-progress upload.',
                auth: 'Bearer', scope: 'api',
                params: [{ name: 'mnemonic', in: 'path', required: true }],
            },
            {
                method: 'PUT', path: '/upload/stream/{mnemonic}/{filename}', operationId: 'streamUpload',
                summary: 'Stream Upload', description: 'Upload a complete file as a single stream (small files).',
                auth: 'Bearer', scope: 'api',
                params: [
                    { name: 'mnemonic', in: 'path', required: true },
                    { name: 'filename', in: 'path', required: true },
                ],
                response: { type: 'File', example: '{ "mnemonic": "file-xyz" }' },
            },
            {
                method: 'GET', path: '/upload/unfinished', operationId: 'unfinishedUploads',
                summary: 'List Unfinished', description: 'List all in-progress uploads for the current user.',
                auth: 'Bearer', scope: 'api',
                response: { type: 'FileUpload[]', example: '[{ "mnemonic": "upload-xyz", "progress": 0.5 }]' },
            },
            {
                method: 'POST', path: '/upload/cleanup', operationId: 'cleanupUploads',
                summary: 'Cleanup Uploads', description: 'Remove all stale unfinished uploads.',
                auth: 'Bearer', scope: 'api',
            },
        ],
    },
    {
        tag: 'Download',
        icon: '📥',
        description: 'File decryption and binary download.',
        endpoints: [
            {
                method: 'POST', path: '/download/{mnemonic}/decrypt', operationId: 'decryptDataset',
                summary: 'Decrypt File', description: 'Decrypt a file using the user\'s RSA-wrapped AES key. Returns a temporary download token.',
                auth: 'Bearer', scope: 'api',
                params: [{ name: 'mnemonic', in: 'path', required: true, description: 'File mnemonic' }],
                body: { type: '{ key: string }', example: '{\n  "key": "base64-encoded-aes-key"\n}' },
                response: { type: 'TokenResponse', example: '{ "token": "download-token-xyz" }' },
            },
            {
                method: 'GET', path: '/download', operationId: 'downloadDataset',
                summary: 'Download File', description: 'Download a decrypted file using a temporary token. Returns binary stream.',
                auth: 'Bearer',
                response: { type: 'Binary stream', example: 'Content-Disposition: attachment; filename="report.pdf"' },
            },
            {
                method: 'GET', path: '/download/{uid}/chunk/{hash}', operationId: 'downloadChunk',
                summary: 'Download Chunk', description: 'Download a specific raw chunk by storage UID and hash.',
                auth: 'Bearer', scope: 'api',
                params: [
                    { name: 'uid', in: 'path', required: true, description: 'Storage UID' },
                    { name: 'hash', in: 'path', required: true, description: 'SHA-256 chunk hash' },
                ],
                response: { type: 'application/octet-stream', example: 'Raw binary data' },
            },
        ],
    },
    {
        tag: 'Filesystem',
        icon: '📁',
        description: 'Virtual encrypted filesystem — directories, files, permissions, and search.',
        endpoints: [
            {
                method: 'GET', path: '/fs/list', operationId: 'listHome',
                summary: 'List Home', description: 'List the user\'s home directory contents.',
                auth: 'Bearer', scope: 'api',
                response: { type: 'ListResponse', example: '{ "nodes": [...], "parents": [...] }' },
            },
            {
                method: 'GET', path: '/fs/list/shared', operationId: 'listShared',
                summary: 'List Shared', description: 'List files shared with the current user.',
                auth: 'Bearer', scope: 'api',
                response: { type: 'ListResponse', example: '{ "nodes": [...] }' },
            },
            {
                method: 'GET', path: '/fs/{mnemonic}/list', operationId: 'listInodes',
                summary: 'List Directory', description: 'List contents of a specific directory.',
                auth: 'Bearer', scope: 'api',
                params: [{ name: 'mnemonic', in: 'path', required: true }],
                response: { type: 'ListResponse', example: '{ "nodes": [...] }' },
            },
            {
                method: 'GET', path: '/fs/{mnemonic}/file', operationId: 'fileInfo',
                summary: 'File Info', description: 'Get file metadata for download (chunks, encrypted keys, hashes).',
                auth: 'Bearer', scope: 'api',
                params: [{ name: 'mnemonic', in: 'path', required: true }],
                response: { type: 'FileDownload', example: '{ "chunks": [...], "keys": [...] }' },
            },
            {
                method: 'GET', path: '/fs/{mnemonic}/file/list', operationId: 'listFiles',
                summary: 'List Files (Recursive)', description: 'Recursively list all files in a directory.',
                auth: 'Bearer', scope: 'api',
                params: [{ name: 'mnemonic', in: 'path', required: true }],
                response: { type: 'FileKeys[]', example: '[{ "mnemonic": "...", "data": { "size": 1024 } }]' },
            },
            {
                method: 'GET', path: '/fs/{mnemonic}/parent/list', operationId: 'listParents',
                summary: 'List Parents', description: 'Get breadcrumb path (parent chain) for an inode.',
                auth: 'Bearer', scope: 'api',
                params: [{ name: 'mnemonic', in: 'path', required: true }],
                response: { type: 'InodeMembers[]', example: '[{ "mnemonic": "...", "name": "Documents" }]' },
            },
            {
                method: 'GET', path: '/fs/{mnemonic}/tree', operationId: 'inodeTree',
                summary: 'Directory Tree', description: 'Get full recursive tree of a directory.',
                auth: 'Bearer', scope: 'api',
                params: [{ name: 'mnemonic', in: 'path', required: true }],
                response: { type: 'InodeTree', example: '{ "name": "root", "children": [...] }' },
            },
            {
                method: 'POST', path: '/fs/directory/add', operationId: 'addDirectory',
                summary: 'Create Directory', description: 'Create a new directory.',
                auth: 'Bearer', scope: 'api',
                body: { type: 'AddDirectoryBody', example: '{\n  "name": "Projects",\n  "parent": "mnemonic-abc"\n}' },
                response: { type: 'Directory', example: '{ "mnemonic": "dir-xyz", "name": "Projects" }' },
            },
            {
                method: 'POST', path: '/fs/resolve', operationId: 'resolve',
                summary: 'Resolve Path', description: 'Resolve a path string to an inode.',
                auth: 'Bearer', scope: 'api',
                body: { type: '{ path: string | null }', example: '{\n  "path": "/Documents/Reports"\n}' },
                response: { type: 'Inode | null', example: '{ "mnemonic": "...", "name": "Reports" }' },
            },
            {
                method: 'POST', path: '/fs/move', operationId: 'moveInode',
                summary: 'Move Inodes', description: 'Move inodes to a new parent directory.',
                auth: 'Bearer', scope: 'api',
                body: { type: 'MoveInodeBody', example: '{\n  "mnemonics": ["file-1", "file-2"],\n  "target": "dir-xyz"\n}' },
            },
            {
                method: 'POST', path: '/fs/{mnemonic}/member/add', operationId: 'addMembers',
                summary: 'Add Member', description: 'Share access with another user.',
                auth: 'Bearer', scope: 'api',
                params: [{ name: 'mnemonic', in: 'path', required: true }],
                body: { type: 'MemberAddBody', example: '{\n  "sub": "user-456",\n  "permission": 1\n}' },
            },
            {
                method: 'POST', path: '/fs/{mnemonic}/member/set', operationId: 'setAccess',
                summary: 'Set Permission', description: 'Change a member\'s permission level (0=none, 1=read, 2=write).',
                auth: 'Bearer', scope: 'api',
                params: [{ name: 'mnemonic', in: 'path', required: true }],
                body: { type: 'SetAccessBody', example: '{\n  "sub": "user-456",\n  "permission": 2\n}' },
            },
            {
                method: 'POST', path: '/fs/{mnemonic}/duplicate', operationId: 'duplicateInode',
                summary: 'Duplicate', description: 'Create a copy of an inode.',
                auth: 'Bearer', scope: 'api',
                params: [{ name: 'mnemonic', in: 'path', required: true }],
                response: { type: 'Inode', example: '{ "mnemonic": "copy-xyz" }' },
            },
            {
                method: 'POST', path: '/fs/{mnemonic}/remove', operationId: 'removeInode',
                summary: 'Trash Inode', description: 'Move an inode to trash.',
                auth: 'Bearer', scope: 'api',
                params: [{ name: 'mnemonic', in: 'path', required: true }],
            },
            {
                method: 'POST', path: '/fs/{mnemonic}/destroy', operationId: 'destroyInode',
                summary: 'Destroy Inode', description: 'Permanently delete an inode and its data.',
                auth: 'Bearer', scope: 'api',
                params: [{ name: 'mnemonic', in: 'path', required: true }],
            },
            {
                method: 'POST', path: '/fs/search', operationId: 'searchFs',
                summary: 'Start Search', description: 'Start an async search job.',
                auth: 'Bearer', scope: 'api',
                body: { type: 'InodeSearchBody', example: '{\n  "query": "report",\n  "mnemonic": "dir-abc"\n}' },
                response: { type: '{ jobId: string }', example: '{ "jobId": "job-123" }' },
            },
            {
                method: 'POST', path: '/fs/search/{jobId}', operationId: 'searchResults',
                summary: 'Search Results', description: 'Get results of a search job.',
                auth: 'Bearer', scope: 'api',
                params: [{ name: 'jobId', in: 'path', required: true }],
                response: { type: 'InodeSearchResults', example: '{ "results": [...], "done": true }' },
            },
            {
                method: 'POST', path: '/fs/search/{jobId}/cancel', operationId: 'searchCancel',
                summary: 'Cancel Search', description: 'Cancel a running search job.',
                auth: 'Bearer', scope: 'api',
                params: [{ name: 'jobId', in: 'path', required: true }],
            },
        ],
    },
    {
        tag: 'File Data',
        icon: '🗄️',
        description: 'Administrative storage management. Admin scope required.',
        endpoints: [
            {
                method: 'GET', path: '/filedata/orphaned', operationId: 'listOrphaned',
                summary: 'List Orphaned', description: 'Find file data not referenced by any inode.',
                auth: 'Bearer', scope: 'admin',
                response: { type: 'FileData[]', example: '[{ "uid": "storage-123", "size": 1024 }]' },
            },
            {
                method: 'POST', path: '/filedata/{uid}/remove', operationId: 'removeFileData',
                summary: 'Remove File Data', description: 'Delete unreferenced file data from storage.',
                auth: 'Bearer', scope: 'admin',
                params: [{ name: 'uid', in: 'path', required: true, description: 'Storage UID' }],
            },
            {
                method: 'GET', path: '/filedata/checkIntegrity', operationId: 'checkIntegrity',
                summary: 'Integrity Check', description: 'Run full integrity verification on all stored data.',
                auth: 'Bearer', scope: 'admin',
                response: { type: 'IntegrityCheckResult', example: '{ "total": 100, "valid": 98, "corrupt": 2 }' },
            },
        ],
    },
    {
        tag: 'Jobs',
        icon: '⏳',
        description: 'Background job monitoring. Admin scope required.',
        endpoints: [
            {
                method: 'GET', path: '/job/list', operationId: 'listJobs',
                summary: 'List Jobs', description: 'List all active background jobs.',
                auth: 'Bearer', scope: 'admin',
                response: { type: 'Job[]', example: '[{ "id": "job-1", "type": "integrity", "status": "running" }]' },
            },
        ],
    },
];
