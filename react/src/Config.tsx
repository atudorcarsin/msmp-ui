import React from 'react';
import { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Checkbox} from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

import ws from "@/websocket"

function Config() {

    const [msmpApiAddress, setMsmpApiAddress] = React.useState(localStorage.getItem("msmp_api_url") ?? "");
    const [msmpApiPort, setMsmpApiPort] = React.useState(localStorage.getItem("msmp_api_port") ?? "");
    const [msmpApiSecret, setMsmpApiSecret] = React.useState(localStorage.getItem("msmp_api_secret") ?? "");
    const [msmpApiSecure, setMsmpApiSecure] = React.useState((localStorage.getItem("msmp_api_secure") ?? "false") === "true");

    const [isConnected, setIsConnected] = useState(false);

    const handleAddressChange = (e) => {
        setMsmpApiAddress(e.target.value);
        localStorage.setItem("msmp_api_url", e.target.value);
    }

    const handlePortChange = (e) => {
        setMsmpApiPort(e.target.value);
        localStorage.setItem("msmp_api_port", e.target.value);
    }

    const handleSecretChange = (e) => {
        setMsmpApiSecret(e.target.value);
        localStorage.setItem("msmp_api_secret", e.target.value);
    }

    const handleSecureChange = (checked: boolean) => {
        setMsmpApiSecure(checked);
        localStorage.setItem("msmp_api_secure", String(checked));
    }

    const handleConnect = () => {
        window.location.reload();
    }

    // Check WebSocket connection status on component mount and when WebSocket state changes
    useEffect(() => {
        const checkConnection = () => {
            setIsConnected(ws && ws.readyState === WebSocket.OPEN);
        };

        // Check initial state
        checkConnection();

        // Check connection state periodically or on ws events
        const interval = setInterval(checkConnection, 1000);

        if (ws) {
            ws.addEventListener('open', checkConnection);
            ws.addEventListener('close', checkConnection);
        }

        return () => {
            clearInterval(interval);
            if (ws) {
                ws.removeEventListener('open', checkConnection);
                ws.removeEventListener('close', checkConnection);
            }
        };
    }, []);

    return (
        <>
            <div className="flex items-center justify-center py-30">
                <Card className="w-[28rem]">
                    <CardHeader>
                        <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-col">
                                <CardTitle>MSMP API Configuration</CardTitle>
                                <CardDescription>Enter the details for your MSMP API</CardDescription>
                            </div>
                            {isConnected ?
                                (<Badge className="bg-green-500 mb-2">Connected</Badge>)
                                : (<Badge variant="destructive" className="mb-2">Not connected</Badge>)
                            }
                        </div>

                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="msmp-api-address">Address</Label>
                        <Input value={msmpApiAddress} onChange={handleAddressChange} id="msmp-api-address" placeholder="api.example.com" className="mb-4 mt-1"/>

                        <Label htmlFor="msmp-api-port">Port</Label>
                        <Input value={msmpApiPort} onChange={handlePortChange} id="msmp-api-port" placeholder="25575" className="mb-4 mt-1"/>

                        <Label htmlFor="msmp-api-secret">Secret Key</Label>
                        <Input value={msmpApiSecret} onChange={handleSecretChange} id="msmp-api-secret" placeholder="your_secret_key" className="mb-4 mt-1"/>

                        <div className="flex flex-row">
                            <Checkbox checked={msmpApiSecure} onCheckedChange={handleSecureChange} id="msmp-api-secure" className="m-1"/>
                            <Label htmlFor="msmp-api-secure">Use Secure Connection (WSS)</Label>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-row justify-between">
                        <Button onClick={handleConnect} className="bg-blue-500">Connect</Button>

                        {
                            isConnected && (
                                <a href="/">
                                    <Button>Return to home</Button>
                                </a>
                            )
                        }

                    </CardFooter>
                </Card>
            </div>
        </>
    )
}

export default Config