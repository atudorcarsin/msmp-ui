import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";
import {useEffect, useRef, useState} from "react";
import ws from "@/websocket.ts";

function StatusReplies() {
    const idRef = useRef(1);

    const [statusReplies, setStatusReplies] = useState(false);

    useEffect(() => {
        const currentId = `status_replies-${idRef.current++}`;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                setStatusReplies(message.result);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Request the current status replies setting from the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/status_replies",
            }
        ));

        return () => {
            ws.removeEventListener('message', handleMessage);
        }
    }, []);

    const handleStatusRepliesChange = (checked: boolean) => {
        const currentId = idRef.current++;


        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if (!("error" in message)) {
                    setStatusReplies(message.result);
                } else {
                    console.error("Failed to change status replies setting:", message.error);
                }
                ws.removeEventListener('message', handleMessage);
            }
        }

        ws.addEventListener('message', handleMessage);

        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/status_replies/set",
                params: [checked],
            }
        ));

    }

    return (
        <div className="flex flex-row">
            <Switch checked={statusReplies}
                    onCheckedChange={checked => handleStatusRepliesChange(checked as boolean)}
                    id="status-replies"/>
            <Label htmlFor="status-replies" className="ml-2">Status Replies</Label>
        </div>
    );
}

export default StatusReplies;