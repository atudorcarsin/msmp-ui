import {Label} from "@/components/ui/label.tsx";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx";
import {useEffect, useRef, useState} from "react";
import ws from "@/websocket.ts";

function Difficulty() {
    const idRef = useRef(1);

    const [difficulty, setDifficulty] = useState<string>();

    useEffect(() => {
        const currentId = `difficulty-${idRef.current++}`;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                setDifficulty(message.result);
            }
        }

        ws.addEventListener('message', handleMessage);

        // Request the current difficulty from the server
        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/difficulty",
            }
        ));
    }, []);

    const handleDifficultyChange = (value: string) => {
        const currentId = `difficulty-${idRef.current++}`;

        // Listen for messages from the server
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);
            if (message.id == currentId) {
                if (!("error" in message)) {
                    setDifficulty(message.result);
                } else {
                    console.error("Failed to change difficulty:", message.error);
                }
                ws.removeEventListener('message', handleMessage);
            }
        }

        ws.addEventListener('message', handleMessage);

        ws.send(JSON.stringify(
            {
                id: currentId,
                method: "minecraft:serversettings/difficulty/set",
                params: [value],
            }
        ));
    }

    return (
        <div>
            <h2 className="mb-2">Difficulty</h2>
            <RadioGroup value={difficulty} onValueChange={handleDifficultyChange}>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="peaceful" id="difficulty-peaceful" />
                    <Label htmlFor="difficulty-peaceful">Peaceful</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="easy" id="difficulty-easy" />
                    <Label htmlFor="difficulty-easy">Easy</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="difficulty-normal" />
                    <Label htmlFor="difficulty-normal">Normal</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hard" id="difficulty-hard" />
                    <Label htmlFor="difficulty-hard">Hard</Label>
                </div>
            </RadioGroup>
        </div>
    );
}

export default Difficulty;