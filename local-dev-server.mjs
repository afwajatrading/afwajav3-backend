import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import netlifyHandler from "./netlify/functions/app.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;
const host = process.env.HOST || "127.0.0.1";
const port = Number.parseInt(process.env.PORT || "4173", 10) || 4173;

const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".webp": "image/webp",
};

function resolveFilePath(requestUrl) {
    const safeUrl = new URL(requestUrl, `http://${host}:${port}`);
    const decodedPath = decodeURIComponent(safeUrl.pathname);
    const routeFiles = {
        "/about": "/about.html",
        "/services": "/services.html",
        "/logistics": "/logistics.html",
        "/terms": "/terms.html",
        "/refund-policy": "/refund-policy.html",
        "/contact": "/contact.html",
        "/faq": "/faq.html",
        "/info-tips": "/panduan.html",
        "/panduan": "/panduan.html",
        "/fleet": "/fleet.html",
        "/driver-transfer": "/driver-transfer.html",
        "/kereta-sewa-cyberjaya": "/kereta-sewa-cyberjaya.html",
        "/kereta-sewa-klia": "/kereta-sewa-klia.html",
        "/kereta-sewa-putrajaya": "/kereta-sewa-putrajaya.html",
    };
    const requestedPath = routeFiles[decodedPath] || (decodedPath === "/" ? "/index.html" : decodedPath);
    const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(rootDir, normalizedPath);

    if (!filePath.startsWith(rootDir)) {
        return null;
    }

    return filePath;
}

function sendText(response, statusCode, payload) {
    response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(payload);
}

function serveStaticFile(request, response) {
    const filePath = resolveFilePath(request.url || "/");

    if (!filePath) {
        sendText(response, 403, "Forbidden");
        return;
    }

    fs.stat(filePath, (statError, stats) => {
        if (statError) {
            sendText(response, 404, "Not Found");
            return;
        }

        const finalPath = stats.isDirectory() ? path.join(filePath, "index.html") : filePath;
        const extension = path.extname(finalPath).toLowerCase();
        const contentType = contentTypes[extension] || "application/octet-stream";

        fs.readFile(finalPath, (readError, fileBuffer) => {
            if (readError) {
                sendText(response, 500, "Internal Server Error");
                return;
            }

            response.writeHead(200, { "Content-Type": contentType });
            response.end(fileBuffer);
        });
    });
}

async function readRequestBody(request) {
    const chunks = [];

    for await (const chunk of request) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }

    return Buffer.concat(chunks);
}

async function proxyToNetlifyHandler(nodeRequest, nodeResponse) {
    const bodyBuffer = await readRequestBody(nodeRequest);
    const headers = new Headers();

    Object.entries(nodeRequest.headers).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((entry) => headers.append(key, entry));
            return;
        }

        if (value !== undefined) {
            headers.set(key, value);
        }
    });

    const request = new Request(`http://${host}:${port}${nodeRequest.url || "/"}`, {
        method: nodeRequest.method,
        headers,
        body: bodyBuffer.length > 0 ? bodyBuffer : undefined,
        duplex: "half",
    });

    const response = await netlifyHandler(request);

    nodeResponse.writeHead(response.status, Object.fromEntries(response.headers.entries()));

    if (!response.body) {
        nodeResponse.end();
        return;
    }

    const arrayBuffer = await response.arrayBuffer();
    nodeResponse.end(Buffer.from(arrayBuffer));
}

const server = http.createServer(async (request, response) => {
    try {
        const url = new URL(request.url || "/", `http://${host}:${port}`);

        if (url.pathname.startsWith("/api/") || url.pathname === "/dev/email-preview") {
            await proxyToNetlifyHandler(request, response);
            return;
        }

        serveStaticFile(request, response);
    } catch (error) {
        console.error("Local dev server error:", error);
        sendText(response, 500, "Internal Server Error");
    }
});

server.listen(port, host, () => {
    console.log(`Local dev server running at http://${host}:${port}`);
});
