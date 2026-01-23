import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useEffect, useRef, useState} from "react";
import ws from "@/websocket.ts";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";

function IPBans() {
    const idRef = useRef(1);

    const [bannedIPs, setBannedIPs] = useState<Array<{ip: string, source: string, reason: string}>>([]);
    const [bannedIP, setBannedIP] = useState("");
    const [banIPReason, setBanIPReason] = useState("");
    const [errorBanningIP, setErrorBanningIP] = useState(false);
    const [successBanningIP, setSuccessBanningIP] = useState(false);

    useEffect(() => {
        const currentId = idRef.current++;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                setBannedIPs(message.result);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Request the current bans list from the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:ip_bans",
            }
        ));

        return () => {
            ws.removeEventListener('message', handleMessage);
        };
    }, []);

    const handleBanIP = () => {
        if (!bannedIP.trim()) return;

        setErrorBanningIP(false);
        setSuccessBanningIP(false);

        const currentId = idRef.current++;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if ("error" in message) {
                    console.error("Failed to ban player:", message.error);
                    setErrorBanningIP(true);
                }
                else {
                    // Successfully banned player, update the bans list
                    setBannedIPs(message.result);
                    setSuccessBanningIP(true);
                }
                ws.removeEventListener('message', handleMessage);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Send ban request to the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:ip_bans/add",
                params: [[{
                    ip: bannedIP,
                    reason: banIPReason,
                    source: "MSMP UI",
                }]],
            }
        ));
    }

    const handleUnbanIP = (index: number) => {
        const ipToUnban = bannedIPs[index].ip;
        const currentId = idRef.current++;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if ("error" in message) {
                    console.error(message);
                }
                else {
                    //Successfully removed IP, update the banlist
                    setBannedIPs(message.result);
                }
                ws.removeEventListener('message', handleMessage);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Send unban request to the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:ip_bans/remove",
                params: [[ipToUnban]],
            }
        ));
    }

    const handleBannedIPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBannedIP(e.target.value);
    }

    const handleBanIPReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBanIPReason(e.target.value);
    }

    return (
        <div className="flex flex-col">
            <div className="my-4">
                <Label htmlFor="newPlayer" className="mb-3">Add a new IP to the banlist:</Label>
                <div className="flex flex-row space-x-2">
                    <Input value={bannedIP} onChange={handleBannedIPChange}
                           type="text" id="newPlayer" placeholder="Enter IP"/>
                    <Input value={banIPReason} onChange={handleBanIPReasonChange}
                           type="text" id="banReason" placeholder="Enter reason"/>
                    <Button onClick={handleBanIP} variant="destructive">Ban</Button>
                </div>
                {errorBanningIP && (<p className="text-sm text-red-400 ml-1 mt-2">Failed to ban {bannedIP}</p>)}
                {successBanningIP && (<p className="text-sm text-green-400 ml-1 mt-2">Successfully added {bannedIP} to banlist</p>)}
            </div>

            <Table>
                <TableCaption>A list of all banned IPs.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[30rem]">IP</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Banned By</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bannedIPs.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-extrabold text-base">{item.ip}</TableCell>
                            <TableCell>{item.reason || "N/A"}</TableCell>
                            <TableCell className="font-extralight">{item.source}</TableCell>
                            <TableCell>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="bg-blue-500 text-gray-50">Unban</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will remove {item.ip} from the banlist.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction className="bg-green-500 text-gray-50" onClick={() => handleUnbanIP(index)}>
                                                Unban
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

}

export default IPBans;