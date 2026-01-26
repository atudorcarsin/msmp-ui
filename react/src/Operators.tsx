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

function Operators() {
    const id = useRef(1);

    const [operators, setOperators] = useState<Array<{player: {id: string, name: string}}>>([]);
    const [newOperatorName, setNewOperatorName] = useState("");
    const [errorAddingOperator, setErrorAddingOperator] = useState(false);
    const [successAddingOperator, setSuccessAddingOperator] = useState(false);

    useEffect(() => {
        const currentId = id.current++;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                setOperators(message.result);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Request the current operators list from the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:operators",
            }
        ));

        return () => {
            ws.removeEventListener('message', handleMessage);
        }
    }, []);

    const handleRemoveOperator = (index: number) => {
        const currentId = id.current++;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if ("error" in message) {
                    console.error("Failed to make player an operator:", message.error);
                }
                else {
                    // Successfully made player an operator, update the list
                    setOperators(message.result);
                }
                ws.removeEventListener('message', handleMessage);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Send the request to remove the operator
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:operators/remove",
                params: [[{
                    name: operators[index].player.name,
                    id: operators[index].player.id,
                }]],
            }
        ));
    }

    // TODO
    const handleAddOperator = () => {
        const currentId = id.current++;
        setErrorAddingOperator(false);
        setSuccessAddingOperator(false);

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if ("error" in message) {
                    console.error("Failed to make player an operator:", message.error);
                    setErrorAddingOperator(true);
                }
                else {
                    // Successfully made player an operator, update the list
                    setOperators(message.result);
                    setSuccessAddingOperator(true);
                }
                ws.removeEventListener('message', handleMessage);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Send the request to add the operator
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:operators/add",
                params: [[{
                    player: {
                        name: newOperatorName,
                    },
                }]],
            }
        ));
    }

    const handleNewOperatorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorAddingOperator(false);
        setSuccessAddingOperator(false);
        setNewOperatorName(e.target.value);
    }

    return (
      <div>
          <div className="my-4 w-96">
              <Label htmlFor="newPlayer" className="mb-3">Add a new player to the operator list:</Label>
              <div className="flex flex-row space-x-2">
                  <Input value={newOperatorName} onChange={handleNewOperatorNameChange}
                         type="text" id="newPlayer" placeholder="Enter name"/>
                  <Button onClick={handleAddOperator} className="bg-blue-500 text-gray-50">Make Operator</Button>
              </div>
              {/*TODO: Implement error and success messages*/}
              {errorAddingOperator && (<p className="text-sm text-red-400 ml-1 mt-2">Failed to add {newOperatorName} to operators list</p>)}
              {successAddingOperator && (<p className="text-sm text-green-400 ml-1 mt-2">Successfully added {newOperatorName} to operators list</p>)}
          </div>

          <Table>
              <TableCaption>A list of all operators.</TableCaption>
              <TableHeader>
                  <TableRow>
                      <TableHead className="w-[30rem]">Name</TableHead>
                      <TableHead>UUID</TableHead>
                      <TableHead>Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {operators.map((operator, index) => (
                      <TableRow key={index}>
                          <TableCell className="font-extrabold text-base">{operator.player.name}</TableCell>
                          <TableCell className="font-extralight">{operator.player.id}</TableCell>
                          <TableCell>
                              <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <Button className="bg-blue-500 text-gray-50">Remove</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                      <AlertDialogHeader>
                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                              This will remove {operator.player.name} from the operators list.
                                          </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction className="bg-green-500 text-gray-50" onClick={() => handleRemoveOperator(index)}>
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

export default Operators;
