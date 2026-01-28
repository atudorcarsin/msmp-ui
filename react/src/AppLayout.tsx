import { Outlet } from 'react-router';
import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {ModeToggle} from "@/components/mode-toggle.tsx";
import {Alert, AlertDescription} from "@/components/ui/alert.tsx";
import ws from "./websocket.ts";
import {useEffect, useState} from "react";

interface AlertMessage {
    id: string;
    method: string;
    params: string;
    timestamp: number;
}

function AppLayout() {
    const [alerts, setAlerts] = useState<AlertMessage[]>([]);

    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            const message = JSON.parse(e.data);

            const newAlert: AlertMessage = {
                id: crypto.randomUUID(),
                method: message.method,
                params: JSON.stringify(message.params, null, 2),
                timestamp: Date.now()
            };
            setAlerts(prev => [...prev, newAlert]);

            // Auto-remove after 5 seconds
            setTimeout(() => {
                setAlerts(prev => prev.filter(alert => alert.id !== newAlert.id));
            }, 5000);
        }

        ws.addEventListener('message', handleMessage);

        return () => {
            ws.removeEventListener('message', handleMessage);
        }
    }, []);

    const removeAlert = (id: string) => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2">
                    <div className="flex flex-1 items-center gap-2 px-3">
                        <SidebarTrigger />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="line-clamp-1">
                                        Minecraft Server Management Protocol UI
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="ml-auto px-3">
                        <ModeToggle />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 px-4 py-10">
                    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
                        {alerts.map(alert => (
                            <Alert key={alert.id} className="relative">
                                <AlertDescription>Method: {alert.method} <br/> Params: {alert.params}</AlertDescription>
                                <button
                                    onClick={() => removeAlert(alert.id)}
                                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                                >
                                    ×
                                </button>
                            </Alert>
                        ))}
                    </div>
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default AppLayout;
