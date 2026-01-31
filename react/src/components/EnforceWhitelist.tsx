import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";
import {useEffect, useRef, useState} from "react";
import ws from "@/websocket.ts";

function EnforceWhitelist() {
    const idRef = useRef(1);

    const [enforceWhitelistEnabled, setEnforceWhitelistEnabled] = useState(false);

    useEffect(() => {
        const currentId = `enforce_whitelist-${idRef.current++}`;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                setEnforceWhitelistEnabled(message.result);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Request the current whitelist status from the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/enforce_allowlist",
            }
        ));

        return () => {
            ws.removeEventListener('message', handleMessage);
        }
    }, []);

    const handleEnforceWhitelistChange = (checked: boolean) => {
        const currentId = idRef.current++;


        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if (!("error" in message)) {
                    setEnforceWhitelistEnabled(message.result);
                } else {
                    console.error("Failed to change enforce whitelist setting:", message.error);
                }
                ws.removeEventListener('message', handleMessage);
            }
        }

        ws.addEventListener('message', handleMessage);

        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/enforce_allowlist/set",
                params: [checked],
            }
        ));

    }

    return (
        <div className="flex flex-row">
            <Switch checked={enforceWhitelistEnabled}
                    onCheckedChange={checked => handleEnforceWhitelistChange(checked as boolean)}
                    id="enforce-whitelist"/>
            <Label htmlFor="enforce-whitelist" className="ml-2">Enforce Whitelist</Label>
        </div>
    );
}

export default EnforceWhitelist;