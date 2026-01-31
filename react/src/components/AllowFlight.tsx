import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";
import {useEffect, useRef, useState} from "react";
import ws from "@/websocket.ts";

function AllowFlight() {
    const idRef = useRef(1);

    const [allowFlight, setAllowFlight] = useState(false);

    useEffect(() => {
        const currentId = `allow_flight-${idRef.current++}`;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                setAllowFlight(message.result);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Request the current allow flight status from the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/allow_flight",
            }
        ));

        return () => {
            ws.removeEventListener('message', handleMessage);
        }
    }, []);

    const handleAllowFlightChange = (checked: boolean) => {
        const currentId = idRef.current++;


        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if (!("error" in message)) {
                    setAllowFlight(message.result);
                } else {
                    console.error("Failed to change allow flight setting:", message.error);
                }
                ws.removeEventListener('message', handleMessage);
            }
        }

        ws.addEventListener('message', handleMessage);

        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/allow_flight/set",
                params: [checked],
            }
        ));

    }

    return (
        <div className="flex flex-row">
            <Switch checked={allowFlight}
                    onCheckedChange={checked => handleAllowFlightChange(checked as boolean)}
                    id="allow-flight"/>
            <Label htmlFor="allow-flight" className="ml-2">Allow Flight</Label>
        </div>
    );
}

export default AllowFlight;