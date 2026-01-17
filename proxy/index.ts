import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, '..', '.env'),
});

const host = process.env.VITE_MSMP_PROXY_ADDRESS ?? '127.0.0.1';
const port = Number(process.env.VITE_MSMP_PROXY_PORT ?? 8080);

const wss = new WebSocketServer({ host, port });

wss.on('connection', (clientWs, req) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? `${host}:${port}`}`);
    const target = url.searchParams.get('target') ?? '';
    const secret = url.searchParams.get('secret') ?? '';

    if (!target || !secret) {
        clientWs.close(1008, 'Missing target or secret');
        return;
    }

    try {
        const upstreamWs = new WebSocket(target, {
            headers: {
                Authorization: `Bearer ${secret}`,
            },
        });

        upstreamWs.on('open', () => {
            // Connection succeeded, set up message forwarding
            console.log(`Connection Successful. Proxying WebSocket connection to ${target}`);


            clientWs.on('message', (data, isBinary) => {
                if (upstreamWs.readyState === WebSocket.OPEN) upstreamWs.send(data, { binary: isBinary });
            });

            upstreamWs.on('message', (data, isBinary) => {
                if (clientWs.readyState === WebSocket.OPEN) clientWs.send(data, { binary: isBinary });
            });

            clientWs.on('close', () => {
                try { upstreamWs.close(); } catch {}
            });

            clientWs.on('error', () => {
                try { upstreamWs.close(); } catch {}
            });
        });

        upstreamWs.on('error', (err) => {
            console.error('Upstream connection failed:', err.message);
            console.error(err);
            clientWs.close(1011, 'Upstream connection failed');
        });

        upstreamWs.on('close', (code, reason) => {
            try { clientWs.close(code, reason.toString()); } catch {}
        });
    }
    catch (err) {
        console.error('Failed to connect to upstream WebSocket:', err.message);
        console.error(err);
        clientWs.close(1011, 'Failed to connect to upstream WebSocket');
    }
});

wss.on('error', (err) => {
    console.error('WebSocket server error:', err.message);
    console.error(err);
})

console.log(`WS proxy listening on ws://${host}:${port}`);