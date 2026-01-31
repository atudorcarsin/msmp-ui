import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";
import {useEffect, useRef, useState} from "react";
import ws from "@/websocket.ts";

function Autosave() {
    const idRef = useRef(1);

    const [autosaveEnabled, setAutosaveEnabled] = useState(false);

    useEffect(() => {
        const currentId = `autosave-${idRef.current++}`;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                setAutosaveEnabled(message.result);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Request the current autosave status from the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/autosave",
            }
        ));

        return () => {
            ws.removeEventListener('message', handleMessage);
        }
    }, []);

    const handleAutosaveChange = (checked: boolean) => {
        const currentId = idRef.current++;


        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if (!("error" in message)) {
                    setAutosaveEnabled(message.result);
                } else {
                    console.error("Failed to change autosave setting:", message.error);
                }
                ws.removeEventListener('message', handleMessage);
            }
        }

        ws.addEventListener('message', handleMessage);

        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/autosave/set",
                params: [checked],
            }
        ));

    }

    return (
        <div className="flex flex-row">
            <Switch checked={autosaveEnabled}
                    onCheckedChange={checked => handleAutosaveChange(checked as boolean)}
                    id="autosave"/>
            <Label htmlFor="autosave" className="ml-2">Autosave</Label>
        </div>
    );
}

export default Autosave;