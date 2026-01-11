const msmp_api_address = localStorage.getItem("msmp_api_url");
const msmp_api_port = localStorage.getItem("msmp_api_port");
const msmp_api_secure = localStorage.getItem("msmp_api_secure");
const msmp_api_secret = localStorage.getItem("msmp_api_secret");

const goToConfig = () => {
    if (!window.location.href.includes("config")) {
        window.location.href = "/config";
    }
};

let ws: WebSocket;

if (!msmp_api_address ||
    !msmp_api_port ||
    !msmp_api_secure ||
    !msmp_api_secret)
{
    goToConfig();
    ws = null as unknown as WebSocket;
}
else {
    let msmp_api_secure_bool: boolean = false;

    if (msmp_api_secure === "true") {
        msmp_api_secure_bool = true;
    }

    let msmp_proxy_secure_bool: boolean = false;

    if (import.meta.env.VITE_MSMP_PROXY_SECURE === "true") {
        msmp_proxy_secure_bool = true;
    }

    const proxy_protocol = msmp_proxy_secure_bool ? "wss" : "ws";
    const msmp_api_protocol = msmp_api_secure_bool ? "wss" : "ws";

    try {
        const ws_url = new URL(`${proxy_protocol}://${import.meta.env.VITE_MSMP_PROXY_ADDRESS}:${import.meta.env.VITE_MSMP_PROXY_PORT}`);
        ws_url.searchParams.append("target", `${msmp_api_protocol}://${msmp_api_address}:${msmp_api_port}`);
        ws_url.searchParams.append("secret", msmp_api_secret);

        ws = new WebSocket(ws_url.toString());

        ws.onopen = () => {
            console.log("Successfully connected to MSMP Proxy WebSocket");
        };

        ws.onerror = (e) => {
            console.error("WebSocket error:", e);
        };

        ws.onclose = () => {
            goToConfig();
        };
    }
    catch (e) {
        console.error("Invalid MSMP API URL:", e);

    }

}

export default ws;
