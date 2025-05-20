import {
    useState,
    useEffect,
    useRef,
    type ChangeEvent,
    type KeyboardEvent,
} from "react";
import type { RequestData } from "./types";
import { Send } from "lucide-react";

type Message = {
    text: string;
    sender: "self" | "partner";
    timestamp: Date;
};

type SidePanelProps = {
    userData: RequestData;
    onDataChange: (event: ChangeEvent<HTMLInputElement>) => void;
    ws?: React.RefObject<WebSocket | null>;
};

export const ChatSection = ({ userData, ws }: SidePanelProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of messages whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Listen for incoming chat messages
    useEffect(() => {
        const handleChatMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === "chat" && data.user === userData.partner) {
                const newMsg: Message = {
                    text: data.message,
                    sender: "partner",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, newMsg]);
            }
        };

        if (ws?.current) {
            ws.current.addEventListener("message", handleChatMessage);
        }

        return () => {
            if (ws?.current) {
                ws.current.removeEventListener("message", handleChatMessage);
            }
        };
    }, [ws, userData.partner]);

    const handleSendMessage = () => {
        console.log(userData.partner);
        console.log(ws?.current);
        if (newMessage.trim() === "" || !userData.partner || !ws?.current)
            return;

        // Send message to server
        const data: RequestData = {
            user: userData.user,
            partner: userData.partner,
            type: "chat",
            message: newMessage.trim(),
        };
        ws.current.send(JSON.stringify(data));

        // Add message to local state
        const sentMessage: Message = {
            text: newMessage.trim(),
            sender: "self",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, sentMessage]);
        setNewMessage("");
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    // Format timestamp to show only hours and minutes
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <div className="w-1/3 flex flex-col border-x border-t border-purple-300 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100">
            {/* Messages area */}
            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
                {!userData.partner ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Waiting for connection ...
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No messages yet. Say hello!
                    </div>
                ) : (
                    <div className="space-y-3">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${
                                    msg.sender === "self"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-xs p-3 rounded-2xl text-sm ${
                                        msg.sender === "self"
                                            ? "bg-pink-400 text-white rounded-br-none"
                                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                                    }`}
                                >
                                    <div>{msg.text}</div>
                                    <div
                                        className={`text-xs mt-1 ${
                                            msg.sender === "self"
                                                ? "text-pink-100"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {formatTime(msg.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="p-4 border-y border-purple-300 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder={
                            userData.partner
                                ? "Type a message ..."
                                : "Waiting for connection ..."
                        }
                        className="flex-1 p-3 text-sm placeholder-gray-700 text-gray-700 border border-purple-200 rounded-full focus:outline-none focus:ring-1 focus:ring-purple-300"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={!userData.partner}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!userData.partner || newMessage.trim() === ""}
                        className={`p-3 rounded-full focus:outline-none ${
                            !userData.partner || newMessage.trim() === ""
                                ? "bg-gray-300 text-gray-500"
                                : "bg-pink-400 text-white hover:bg-pink-500"
                        }`}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
