import {useRef, useState, useEffect} from 'react';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import ws from "@/websocket"
import {Input} from "@/components/ui/input.tsx";

function Whitelist() {
    const idRef = useRef(1);


    const [whitelistEnabled, setWhitelistEnabled] = useState(false);
    const [whitelistedPlayers, setWhitelistedPlayers] = useState<Array<{name: string, id: string}>>([]);
    const [newPlayerName, setNewPlayerName] = useState("");
    const [errorAddingPlayer, setErrorAddingPlayer] = useState(false);
    const [successAddingPlayer, setSuccessAddingPlayer] = useState(false);


    useEffect(() => {
        const currentId = idRef.current++;
        // Request the current whitelist status from the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/use_allowlist",
            }
        ));

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                setWhitelistEnabled(message.result);
            }
        }

        ws.addEventListener('message', handleMessage);

        return () => {
            ws.removeEventListener('message', handleMessage);
        };
    }, []);

    // Fetch the list of whitelisted players when the component mounts
    useEffect(() => {
        const currentId = idRef.current++;
        // Request the list of whitelisted players from the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:allowlist",
            }
        ));

        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                console.log("Whitelisted players received:")
                console.log(message);
                setWhitelistedPlayers(message.result);
            }
        }

        ws.addEventListener('message', handleMessage);

        return () => {
            ws.removeEventListener('message', handleMessage);
        };
    }, []);

    const handleWhitelistToggle = (checked: boolean) => {
        const currentId = idRef.current++;

        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if ("error" in message) {
                    console.error(message);
                }
                else {
                    setWhitelistEnabled(message.result);
                }
                ws.removeEventListener('message', handleMessage);
            }
        };

        ws.addEventListener('message', handleMessage);

        // Send the updated whitelist status to the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/use_allowlist/set",
                params: [checked],
            }
        ));
    }

    const handleNewPlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPlayerName(e.target.value);
    }

    const handleAddPlayer = () => {
        setErrorAddingPlayer(false);
        setSuccessAddingPlayer(false);

        if (!newPlayerName.trim()) return;

        const currentId = idRef.current++;

        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if ("error" in message) {
                    console.error(message);
                    setErrorAddingPlayer(true);
                }
                else {
                    //Successfully added player, update the whitelisted players list
                    setWhitelistedPlayers(message.result);
                    setSuccessAddingPlayer(true);
                }
                ws.removeEventListener('message', handleMessage);
            }
        };

        ws.addEventListener('message', handleMessage);

        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:allowlist/add",
                params: [[{
                    name: newPlayerName,
                }]],
            }
        ));
    }

    const handleRemovePlayer = (index) => {
        const currentId = idRef.current++;

        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if ("error" in message) {
                    console.error(message);
                }
                else {
                    //Successfully removed player, update the whitelisted players list
                    setWhitelistedPlayers(message.result);
                }
                ws.removeEventListener('message', handleMessage);
            }
        };

        ws.addEventListener('message', handleMessage);

        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:allowlist/remove",
                params: [[{
                    name: whitelistedPlayers[index].name,
                }]],
            }
        ));
    }

    return (
        <div className="flex flex-col">
            <div className="flex space-x-2 mb-3">
                <Switch id="whitelist" checked={whitelistEnabled} onCheckedChange={handleWhitelistToggle} />
                <Label htmlFor="whitelist">Enable Whitelist</Label>
            </div>

            <div className="my-4">
                <Label htmlFor="newPlayer" className="mb-3">Add a new player to the whitelist:</Label>
                <div className="flex flex-row space-x-2 w-96">
                    <Input value={newPlayerName} onChange={handleNewPlayerNameChange}
                           type="text" id="newPlayer" placeholder="Enter name"/>
                    <Button onClick={handleAddPlayer} className="bg-blue-500">Whitelist</Button>
                </div>
                {errorAddingPlayer && (<p className="text-sm text-red-400 ml-1 mt-2">Error adding player to whitelist</p>)}
                {successAddingPlayer && (<p className="text-sm text-green-400 ml-1 mt-2">Successfully added {newPlayerName} to whitelist</p>)}
            </div>

            <Table>
                <TableCaption>A list of all whitelisted players.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[30rem]">Name</TableHead>
                        <TableHead>UUID</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {whitelistedPlayers.map((player, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-extrabold text-base">{player.name}</TableCell>
                            <TableCell className="font-extralight">{player.id}</TableCell>

                            <TableCell>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">Remove</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will remove {player.name} from the whitelist. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction className="bg-destructive text-gray-200" onClick={() => handleRemovePlayer(index)}>
                                                Remove
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

export default Whitelist;