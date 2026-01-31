import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";
import {useEffect, useRef, useState} from "react";
import ws from "@/websocket.ts";

function HideOnlinePlayers() {
    const idRef = useRef(1);

    const [hideOnlinePlayers, setHideOnlinePlayers] = useState(false);

    useEffect(() => {
        const currentId = `hide_online_players-${idRef.current++}`;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                setHideOnlinePlayers(message.result);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Request the current hide online players status from the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/hide_online_players",
            }
        ));

        return () => {
            ws.removeEventListener('message', handleMessage);
        }
    }, []);

    const handleHideOnlinePlayersChange = (checked: boolean) => {
        const currentId = idRef.current++;


        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if (!("error" in message)) {
                    setHideOnlinePlayers(message.result);
                } else {
                    console.error("Failed to change hide online players setting:", message.error);
                }
                ws.removeEventListener('message', handleMessage);
            }
        }

        ws.addEventListener('message', handleMessage);

        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/hide_online_players/set",
                params: [checked],
            }
        ));

    }

    return (
        <div className="flex flex-row">
            <Switch checked={hideOnlinePlayers}
                    onCheckedChange={checked => handleHideOnlinePlayersChange(checked as boolean)}
                    id="hide-online-players"/>
            <Label htmlFor="hide-online-players" className="ml-2">Hide Online Players</Label>
        </div>
    );
}

export default HideOnlinePlayers;