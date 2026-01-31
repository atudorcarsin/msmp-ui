import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";
import {useEffect, useRef, useState} from "react";
import ws from "@/websocket.ts";

function AcceptTransfers() {
    const idRef = useRef(1);

    const [acceptTransfers, setAcceptTransfers] = useState(false);

    useEffect(() => {
        const currentId = `accept_transfers-${idRef.current++}`;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                setAcceptTransfers(message.result);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Request the current accept transfer status from the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/accept_transfers",
            }
        ));

        return () => {
            ws.removeEventListener('message', handleMessage);
        }
    }, []);

    const handleAcceptTransfersChange = (checked: boolean) => {
        const currentId = idRef.current++;


        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if (!("error" in message)) {
                    setAcceptTransfers(message.result);
                } else {
                    console.error("Failed to change accept transfers setting:", message.error);
                }
                ws.removeEventListener('message', handleMessage);
            }
        }

        ws.addEventListener('message', handleMessage);

        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/accept_transfers/set",
                params: [checked],
            }
        ));

    }

    return (
        <div className="flex flex-row">
            <Switch checked={acceptTransfers}
                    onCheckedChange={checked => handleAcceptTransfersChange(checked as boolean)}
                    id="accept-transfers"/>
            <Label htmlFor="accept-transfers" className="ml-2">Accept Transfers</Label>
        </div>
    );
}

export default AcceptTransfers;