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

function Bans() {
    const idRef = useRef(1);

    const [bannedPlayers, setBannedPlayers] = useState<Array<{player: {id: string, name: string}, source: string, reason: string}>>([]);
    const [bannedPlayerName, setBannedPlayerName] = useState("");
    const [banReason, setBanReason] = useState("");
    const [errorBanningPlayer, setErrorBanningPlayer] = useState(false);
    const [successBanningPlayer, setSuccessBanningPlayer] = useState(false);


    useEffect(() => {
        const currentId = idRef.current++;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                setBannedPlayers(message.result);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Request the current bans list from the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:bans",
            }
        ));

        return () => {
            ws.removeEventListener('message', handleMessage);
        };
    }, []);

    const handleUnbanPlayer = (index: number) => {
        const currentId = idRef.current++;

        const playerToUnban = bannedPlayers[index].player;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if ("error" in message) {
                    console.error("Failed to unban player:", message.error);
                }
                else {
                    // Successfully unbanned player, update the bans list
                    setBannedPlayers(message.result);
                }
                ws.removeEventListener('message', handleMessage);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Send unban request to the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:bans/remove",
                params: [[playerToUnban]],
            }
        ));
    }

    const handleBanPlayer = () => {
        if (!bannedPlayerName.trim()) return;

        setErrorBanningPlayer(false);
        setSuccessBanningPlayer(false);

        const currentId = idRef.current++;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if ("error" in message) {
                    console.error("Failed to ban player:", message.error);
                    setErrorBanningPlayer(true);
                }
                else {
                    // Successfully banned player, update the bans list
                    setBannedPlayers(message.result);
                    setSuccessBanningPlayer(true);
                }
                ws.removeEventListener('message', handleMessage);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Send ban request to the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:bans/add",
                params: [[{
                    player: {
                        name: bannedPlayerName,
                    },
                    reason: banReason,
                    source: "MSMP UI",
                }]],
            }
        ));
    }

    const handleBannedPlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBannedPlayerName(e.target.value);
    }

    const handleBanReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBanReason(e.target.value);
    }

    return (
      <div className="flex flex-col">

          <div className="my-4">
              <Label htmlFor="newPlayer" className="mb-3">Add a new player to the banlist:</Label>
              <div className="flex flex-row space-x-2">
                  <Input value={bannedPlayerName} onChange={handleBannedPlayerNameChange}
                         type="text" id="newPlayer" placeholder="Enter name"/>
                  <Input value={banReason} onChange={handleBanReasonChange}
                         type="text" id="banReason" placeholder="Enter reason"/>
                  <Button onClick={handleBanPlayer} variant="destructive">Ban</Button>
              </div>
              {errorBanningPlayer && (<p className="text-sm text-red-400 ml-1 mt-2">Failed to ban {bannedPlayerName}</p>)}
              {successBanningPlayer && (<p className="text-sm text-green-400 ml-1 mt-2">Successfully added {bannedPlayerName} to banlist</p>)}
          </div>

          <Table>
              <TableCaption>A list of all banned players.</TableCaption>
              <TableHeader>
                  <TableRow>
                      <TableHead className="w-[30rem]">Name</TableHead>
                      <TableHead>UUID</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Banned By</TableHead>
                      <TableHead>Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {bannedPlayers.map((player, index) => (
                      <TableRow key={index}>
                          <TableCell className="font-extrabold text-base">{player.player.name}</TableCell>
                          <TableCell className="font-extralight">{player.player.id}</TableCell>
                          <TableCell>{player.reason || "N/A"}</TableCell>
                          <TableCell className="font-extralight">{player.source}</TableCell>
                          <TableCell>
                              <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <Button className="bg-blue-500 text-gray-50">Unban</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                      <AlertDialogHeader>
                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                              This will remove {player.player.name} from the banlist.
                                          </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction className="bg-green-500 text-gray-50" onClick={() => handleUnbanPlayer(index)}>
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

export default Bans;