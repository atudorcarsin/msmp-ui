import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";
import {useEffect, useRef, useState} from "react";
import ws from "@/websocket.ts";

function Whitelist() {
    const idRef = useRef(1);

    const [whitelistEnabled, setWhitelistEnabled] = useState(false);

    useEffect(() => {
        const currentId = `whitelist-${idRef.current++}`;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                setWhitelistEnabled(message.result);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Request the current whitelist status from the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/use_allowlist",
            }
        ));

        return () => {
            ws.removeEventListener('message', handleMessage);
        }
    }, []);

    const handleWhitelistChange = (checked: boolean) => {
        const currentId = idRef.current++;


        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if (!("error" in message)) {
                    setWhitelistEnabled(message.result);
                } else {
                    console.error("Failed to change whitelist setting:", message.error);
                }
                ws.removeEventListener('message', handleMessage);
            }
        }

        ws.addEventListener('message', handleMessage);

        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/use_allowlist/set",
                params: [checked],
            }
        ));

    }

    return (
        <div className="flex flex-row">
            <Switch checked={whitelistEnabled}
                    onCheckedChange={checked => handleWhitelistChange(checked as boolean)}
                    id="whitelist"/>
            <Label htmlFor="whitelist" className="ml-2">Whitelist</Label>
        </div>
    );
}

export default Whitelist;