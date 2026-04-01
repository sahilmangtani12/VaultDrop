import { sections, BASE_PATH, type Endpoint, type ApiSection } from './apiData';

interface PostmanItem {
    name: string;
    request: {
        method: string;
        header: Array<{ key: string; value: string; type: string }>;
        url: {
            raw: string;
            host: string[];
            path: string[];
            variable?: Array<{ key: string; value: string }>;
        };
        body?: {
            mode: string;
            raw: string;
            options: { raw: { language: string } };
        };
    };
}

interface PostmanFolder {
    name: string;
    description: string;
    item: PostmanItem[];
}

function buildUrl(ep: Endpoint) {
    const raw = `{{baseUrl}}${BASE_PATH}${ep.path}`;
    const parts = `${BASE_PATH}${ep.path}`.split('/').filter(Boolean);
    const variables = (ep.params ?? [])
        .filter((p) => p.in === 'path')
        .map((p) => ({ key: p.name, value: p.example ?? `{{${p.name}}}` }));

    return {
        raw,
        host: ['{{baseUrl}}'],
        path: parts,
        ...(variables.length ? { variable: variables } : {}),
    };
}

function buildItem(ep: Endpoint): PostmanItem {
    const headers: Array<{ key: string; value: string; type: string }> = [
        { key: 'Content-Type', value: 'application/json', type: 'text' },
    ];
    if (ep.auth) {
        headers.push({
            key: 'Authorization',
            value: 'Bearer {{token}}',
            type: 'text',
        });
    }
    (ep.params ?? [])
        .filter((p) => p.in === 'header')
        .forEach((p) => {
            headers.push({ key: p.name, value: p.example ?? '', type: 'text' });
        });

    const item: PostmanItem = {
        name: ep.summary,
        request: {
            method: ep.method,
            header: headers,
            url: buildUrl(ep),
        },
    };

    if (ep.body) {
        item.request.body = {
            mode: 'raw',
            raw: ep.body.example,
            options: { raw: { language: 'json' } },
        };
    }

    return item;
}

function buildFolder(section: ApiSection): PostmanFolder {
    return {
        name: section.tag,
        description: section.description,
        item: section.endpoints.map(buildItem),
    };
}

export function generatePostmanCollection(baseUrl: string) {
    const collection = {
        info: {
            name: 'VaultDrop API',
            description:
                'Complete API collection for VaultDrop — end-to-end encrypted file storage platform.\n\nBase URL: ' +
                baseUrl +
                BASE_PATH,
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        },
        variable: [
            { key: 'baseUrl', value: baseUrl, type: 'string' },
            { key: 'token', value: '', type: 'string' },
        ],
        item: sections.map(buildFolder),
    };
    return JSON.stringify(collection, null, 2);
}

export function downloadCollection(baseUrl: string) {
    const json = generatePostmanCollection(baseUrl);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VaultDrop_API.postman_collection.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
