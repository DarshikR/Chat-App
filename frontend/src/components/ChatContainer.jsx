import { useChatStore } from "../store/useChatStore";
import React, { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatMessageDate } from "../lib/utils";
import { ArrowDown, ZoomIn, ZoomOut, Download, X } from "lucide-react";

const ChatContainer = () => {
    const {
        messages,
        getMessages,
        isMessagesLoading,
        selectedUser,
        subscribeToMessages,
        unsubscribeFromMessages,
    } = useChatStore();

    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);

    const [showGoBackButton, setShowGoBackButton] = useState(false);
    const [loading, setLoading] = useState(true);

    // Image modal
    const [selectedImage, setSelectedImage] = useState(null);
    const [zoom, setZoom] = useState(1);

    // ===============================
    // Fetch + socket subscribe
    // ===============================
    useEffect(() => {
        if (!selectedUser?._id) return;

        getMessages(selectedUser._id);
        subscribeToMessages();

        return () => unsubscribeFromMessages();
    }, [selectedUser?._id]);

    // ===============================
    // Artificial loading delay
    // ===============================
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, [selectedUser]);

    // ===============================
    // Auto scroll
    // ===============================
    useEffect(() => {
        if (!loading && messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, loading]);

    // ===============================
    // Group messages by date
    // ===============================
    const groupMessagesByDate = (messages) =>
        messages.reduce((groups, message) => {
            const date = new Date(message.createdAt).toDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(message);
            return groups;
        }, {});

    const groupedMessages = Object.entries(groupMessagesByDate(messages));

    // ===============================
    // Scroll helpers
    // ===============================
    const handleScroll = () => {
        const lastMessage = messageEndRef.current;
        if (!lastMessage) return;

        const isAtBottom =
            lastMessage.getBoundingClientRect().top <= window.innerHeight;

        setShowGoBackButton(!isAtBottom);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToLastMessage = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // ===============================
    // Render links, phones, emails
    // ===============================
    const renderMessageText = (text) => {
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+\.[a-zA-Z]{2,})/g;
        const phoneRegex = /(\+?\d[\d\s.-]{7,})/g;
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        const combinedRegex = new RegExp(
            `${urlRegex.source}|${phoneRegex.source}|${emailRegex.source}`,
            "g"
        );

        return text.split(combinedRegex).map((part, i) => {
            if (urlRegex.test(part)) {
                const url = part.startsWith("http://") || part.startsWith("https://") ? part : `http://${part}`;
                return (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="underline">
                        {part}
                    </a>
                );
            }
            if (phoneRegex.test(part)) {
                return (
                    <a key={i} href={`tel:${part.replace(/\s+/g, "")}`} className="underline">
                        {part}
                    </a>
                );
            }
            if (emailRegex.test(part)) {
                return (
                    <a key={i} href={`mailto:${part}`} className="underline">
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    // ===============================
    // Loading state
    // ===============================
    if (isMessagesLoading || (loading && messages.length > 0)) {
        return (
            <div className="flex flex-col flex-1 overflow-auto">
                <ChatHeader />
                <MessageSkeleton />
                <MessageInput />
            </div>
        );
    }

    // ===============================
    // Render
    // ===============================
    return (
        <div className="!h-[var(--app-height)-64.8px] flex flex-col flex-1 overflow-auto absolute z-10 top-0 left-0 right-0 bottom-0 sm:relative bg-base-100">
            <ChatHeader />

            <div className="flex-1 space-y-3.5 p-2 sm:p-4 overflow-y-auto" onScroll={handleScroll}>
                {messages.length === 0 && (
                    <div className="text-center">
                        No messages yet. <br /> Start the conversation now!
                    </div>
                )}

                {groupedMessages.map(([date, groupMessages], groupIndex) => {
                    const isLastGroup = groupIndex === groupedMessages.length - 1;

                    return (
                        <div key={date}>
                            {/* Date header */}
                            <div className="sticky top-0 mx-auto text-xs p-1 px-1.5 rounded-md bg-base-300/60 backdrop-blur w-fit z-10">
                                {formatMessageDate(date)}
                            </div>

                            {groupMessages.map((message, i) => {
                                const nextMessage = groupMessages[i + 1];
                                const isLastMessageFromSender =
                                    !nextMessage || nextMessage.senderId !== message.senderId;

                                const isLastMessageOverall =
                                    isLastGroup && i === groupMessages.length - 1;

                                return (
                                    <div
                                        key={message._id}
                                        className={`chat ${message.senderId === authUser._id
                                            ? "chat-end"
                                            : "chat-start"
                                            }`}
                                        ref={isLastMessageOverall ? messageEndRef : null}
                                    >
                                        {/* Avatar ONLY for last message of sender */}
                                        <div className="avatar chat-image">
                                            <div className={`${isLastMessageFromSender && 'border'} rounded-full size-10`}>
                                                {isLastMessageFromSender && (
                                                    <img
                                                        src={
                                                            message.senderId === authUser._id
                                                                ? authUser.profilePic || "/avatar.png"
                                                                : selectedUser.profilePic || "/avatar.png"
                                                        }
                                                        alt="profile pic"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            className={`flex flex-col chat-bubble ${message.senderId === authUser._id ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"} ${isLastMessageFromSender ? "chat-bubble-tail before:block" : `${message.senderId === authUser._id ? '!rounded-br-[var(--rounded-box,1rem)]' : '!rounded-bl-[var(--rounded-box,1rem)]' } before:hidden`}`}
                                        >
                                            {message.image && (
                                                <img
                                                    src={message.image}
                                                    alt="Attachment"
                                                    onClick={() => setSelectedImage(message.image)}
                                                    className="mb-2 rounded-md max-w-[160px] sm:max-w-[200px] cursor-pointer hover:opacity-90 transition"
                                                />
                                            )}
                                            {message.text && <p>{renderMessageText(message.text)}</p>}
                                            <span className={`${message.senderId === authUser._id && 'ml-auto'}`}>
                                                <time className="text-xs opacity-50">
                                                    {formatMessageTime(message.createdAt)}
                                                </time>
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}

                {showGoBackButton && (
                    <button
                        onClick={scrollToLastMessage}
                        className="sticky bottom-0 float-right bg-base-300/60 backdrop-blur rounded-full p-2 shadow-lg"
                    >
                        <ArrowDown size={20} />
                    </button>
                )}
            </div>

            <MessageInput />

            {/* Image modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={(e) => e.target === e.currentTarget && setSelectedImage(null)}
                >
                    <div className="relative flex flex-col items-center">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="ml-auto z-30 bg-slate-100/20 rounded-full p-1.5"
                        >
                            <X size={20} />
                        </button>

                        <img
                            src={selectedImage}
                            alt="Zoomed"
                            className="max-w-[90vw] max-h-[80vh] rounded-md transition-transform duration-300 my-2"
                            style={{ transform: `scale(${zoom})` }}
                        />

                        <div className="flex gap-3 z-30 bg-slate-100/20 rounded-full p-1.5">
                            <button onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} className="bg-white/20 hover:bg-gray-600 p-1.5 rounded-full">
                                <ZoomIn />
                            </button>
                            <button onClick={() => setZoom((z) => Math.max(z - 0.25, 1))} className="bg-white/20 hover:bg-gray-600 p-1.5 rounded-full">
                                <ZoomOut />
                            </button>
                            <a href={selectedImage} download className="bg-white/20 hover:bg-gray-600 p-1.5 rounded-full">
                                <Download />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatContainer;
