import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";
import {useEffect, useRef, useState} from "react";
import ws from "@/websocket.ts";

function ForceGamemode() {
    const idRef = useRef(1);

    const [forceGamemode, setForceGamemode] = useState(false);

    useEffect(() => {
        const currentId = `force_gamemode-${idRef.current++}`;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                setForceGamemode(message.result);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Request the current force gamemode status from the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/force_game_mode",
            }
        ));

        return () => {
            ws.removeEventListener('message', handleMessage);
        }
    }, []);

    const handleForceGamemodeChange = (checked: boolean) => {
        const currentId = idRef.current++;


        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if (!("error" in message)) {
                    setForceGamemode(message.result);
                } else {
                    console.error("Failed to change force gamemode setting:", message.error);
                }
                ws.removeEventListener('message', handleMessage);
            }
        }

        ws.addEventListener('message', handleMessage);

        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/force_game_mode/set",
                params: [checked],
            }
        ));

    }

    return (
        <div className="flex flex-row">
            <Switch checked={forceGamemode}
                    onCheckedChange={checked => handleForceGamemodeChange(checked as boolean)}
                    id="force-gamemode"/>
            <Label htmlFor="force-gamemode" className="ml-2">Force Gamemode</Label>
        </div>
    );
}

export default ForceGamemode;