import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Status, StatusIndicator, StatusLabel} from "@/components/ui/status.tsx";
import {useEffect, useRef, useState} from "react";
import ws from "@/websocket.ts";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";

import Autosave from "@/components/Autosave.tsx";
import Whitelist from "@/components/Whitelist.tsx";
import EnforceWhitelist from "@/components/EnforceWhitelist.tsx";
import AllowFlight from "@/components/AllowFlight.tsx";
import ForceGamemode from "@/components/ForceGamemode.tsx";
import AcceptTransfers from "@/components/AcceptTransfers.tsx";
import HideOnlinePlayers from "@/components/HideOnlinePlayers.tsx";
import StatusReplies from "@/components/StatusReplies.tsx";
import Difficulty from "@/components/Difficulty.tsx";

function Server() {
    const idRef = useRef(1);

    const [serverStatus, setServerStatus] = useState<{started: boolean, version: {protocol: number, name: string}}>();
    const [flushWhenSaving, setFlushWhenSaving] = useState(false);
    const [message, setMessage]  = useState("");
    const [overlayMessage, setOverlayMessage] = useState(false);


    useEffect(() => {
        const currentId = idRef.current++;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                setServerStatus(message.result);
            }
        };

        ws.addEventListener('message', handleMessage);

        // Request the current server status from the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:server/status",
            }
        ));

        return () => {
            ws.removeEventListener('message', handleMessage);
        }
    }, []);

    const handleSaveWorld = () => {
        const currentId = idRef.current++;

        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:server/save",
                params: [flushWhenSaving],
            }
        ));
    }

    const handleStopServer = () => {
        const currentId = idRef.current++;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                // Optionally handle server stop confirmation here
                if (message.result) {
                    window.location.pathname = "/config";
                }

            }

            ws.removeEventListener('message', handleMessage);
        }

        ws.addEventListener('message', handleMessage);

        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:server/stop",
            }
        ));

    }

    const handleBroadcastMessage = () => {
        const currentId = idRef.current++;

        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:server/system_message",
                params: [{
                    overlay: overlayMessage,
                    message: {
                        literal: message,
                    },
                }],
            }
        ));
    }

    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
    }

    return (
        <div className="flex flex-col">
            <div>
                <Card className="w-96">
                    <CardHeader>
                        <CardTitle>Server Control</CardTitle>
                        <CardDescription>Main control features</CardDescription>
                        <CardAction>
                            <div className="flex flex-col items-end">
                                <Status status="online">
                                    <StatusIndicator/>
                                    <StatusLabel/>
                                </Status>
                                <p className="text-xs text-gray-400 font-bold mt-1">Version: {serverStatus?.version.name}</p>
                            </div>

                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <div className="flex">
                            <div className="flex flex-col">
                                <Button onClick={handleSaveWorld} className="bg-blue-500 text-white mr-3 mb-2">Save World</Button>
                                <div className="flex flex-row">
                                    <Checkbox
                                        id="flush"
                                        checked={flushWhenSaving}
                                        onCheckedChange={(checked) => setFlushWhenSaving(checked as boolean)}
                                    />
                                    <Label htmlFor="flush" className="ml-1">Flush</Label>
                                </div>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Stop Server</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action will shut down the server.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className="bg-red-500 text-gray-50" onClick={handleStopServer}>
                                            Stop Server
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                    </CardContent>
                    <CardFooter>
                        <div className="flex flex-col">
                            <p className="mb-1">Broadcast a message:</p>
                            <Input value={message} onChange={handleMessageChange} className="w-80" placeholder="Enter Message"/>
                            <div className="flex flex-row mt-2">
                                <Checkbox checked={overlayMessage}
                                          onCheckedChange={(checked) => setOverlayMessage(checked as boolean)}
                                          id="overlay"
                                />
                                <Label htmlFor="overlay" className="ml-1">Overlay</Label>
                            </div>
                            <Button onClick={handleBroadcastMessage} className="w-24 mt-2">Send</Button>
                        </div>

                    </CardFooter>
                </Card>
            </div>

            <h2 className="mt-3 text-xl">Server Settings</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2 bg-gray-800 p-3 rounded-lg mb-2">
                <Autosave/>
                <Whitelist/>
                <EnforceWhitelist/>
                <AllowFlight/>
                <ForceGamemode/>
                <AcceptTransfers/>
                <HideOnlinePlayers/>
                <StatusReplies/>
            </div>

            <Difficulty/>

        </div>
    );

}

export default Server;