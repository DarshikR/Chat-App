import { useChatStore } from "../store/useChatStore";
import React, { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatMessageDate } from "../lib/utils";
import { ArrowDown } from "lucide-react";

const ChatContainer = () => {
    const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);
    const [showGoBackButton, setShowGoBackButton] = useState(false); // State for the "Go Back" button
    const [loading, setLoading] = useState(true); // New state for 1-second delay

    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id);
            subscribeToMessages();
            return () => unsubscribeFromMessages();
        }
    }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, [selectedUser]);

    useEffect(() => {
        if (!loading && messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, loading]);

    // Helper function to determine if a new date header should be shown
    // const shouldShowDateHeader = (currentMessage, previousMessage) => {
    //     const currentDate = new Date(currentMessage.createdAt).toDateString();
    //     const previousDate = previousMessage
    //         ? new Date(previousMessage.createdAt).toDateString()
    //         : null;

    //     return currentDate !== previousDate;
    // };


    const groupMessagesByDate = (messages) => {
        return messages.reduce((groups, message) => {
            const date = new Date(message.createdAt).toDateString(); // Group by `toDateString`
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
            return groups;
        }, {});
    };

    // Handle scrolling to show/hide "Go Back" button
    const handleScroll = () => {
        const lastMessage = messageEndRef.current;
        if (!lastMessage) return;
        const isAtBottom =
            lastMessage.getBoundingClientRect().top <= window.innerHeight;
        setShowGoBackButton(!isAtBottom); // Show the button only if not at the bottom
    };

    // Attach scroll event listener to the window
    useEffect(() => {
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Scroll to the last message when the "Go Back" button is clicked
    const scrollToLastMessage = () => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Helper function to parse and convert URLs to clickable links
    const renderMessageText = (text) => {
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+\.[a-zA-Z]{2,})/g; // Match URLs (including www)
        const phoneRegex = /(\+?\d{1,3}[-.\s]??\d{1,4}[-.\s]??\d{1,4}[-.\s]??\d{1,9})/g; // Phone number regex
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g; // Email regex
        const combinedRegex = new RegExp(`${urlRegex.source}|${phoneRegex.source}|${emailRegex.source}`, "g"); // Combine all regexes

        // Match all parts (URLs, phone numbers, emails, and plain text in between)
        const matches = text.split(combinedRegex);

        return matches.map((part, index) => {
            if (urlRegex.test(part)) {
                // Add `http://` to the URL if it"s not already present
                const url = part.startsWith("http://") || part.startsWith("https://") ? part : `http://${part}`;
                return (
                    <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                    >
                        {part}
                    </a>
                );
            } else if (phoneRegex.test(part)) {
                // Render phone numbers as clickable `tel:` links
                return (
                    <a
                        key={index}
                        href={`tel:${part.replace(/\s+/g, "")}`} // Clean up phone numbers for `tel:` links
                        className="underline"
                    >
                        {part}
                    </a>
                );
            } else if (emailRegex.test(part)) {
                // Render emails as clickable `mailto:` links
                return (
                    <a
                        key={index}
                        href={`mailto:${part}`}
                        className="underline"
                    >
                        {part}
                    </a>
                );
            }
            // Return plain text if it doesn"t match any regex
            return part;
        });
    };

    if (isMessagesLoading || (loading && messages.length > 0)) {
        return (
            <div className="flex flex-col flex-1 overflow-auto">
                <ChatHeader />
                <MessageSkeleton messages={messages} authUser={authUser} />
                <MessageInput />
            </div>
        );
    };

    return (
        <div className="flex flex-col flex-1 overflow-auto absolute z-10 top-0 left-0 right-0 bottom-0 sm:relative bg-base-100">
            <ChatHeader />

            <div className="flex-1 space-y-3.5 p-2 sm:p-4 overflow-y-auto" onScroll={handleScroll}>
            {messages.length > 0 ? null : (
                    <div className="text-center">
                        No messages yet. <br /> Start the conversation now!
                    </div>
                )}
                {Object.entries(groupMessagesByDate(messages)).map(([date, groupMessages]) => (
                    <div key={date}>
                        <div
                            className="sticky top-0 mx-auto text-xs p-1 px-1.5 rounded-md bg-base-300/60 backdrop-blur w-fit z-10"
                        >
                            {formatMessageDate(date)}
                        </div>
                        {groupMessages.map((message, i) => (
                            <div
                                key={message._id}
                                className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"
                                    }`}
                                ref={i === groupMessages.length - 1 ? messageEndRef : null}
                            >
                                <div className="avatar chat-image">
                                    <div className="border rounded-full size-10">
                                        <img
                                            src={
                                                message.senderId === authUser._id
                                                    ? authUser.profilePic || "/avatar.png"
                                                    : selectedUser.profilePic || "/avatar.png"
                                            }
                                            alt="profile pic"
                                        />
                                    </div>
                                </div>
                                <div className="mb-1 chat-header">
                                    <time className="opacity-50 ml-1 text-xs">
                                        {formatMessageTime(message.createdAt)}
                                    </time>
                                </div>
                                <div className={`flex flex-col chat-bubble ${message.senderId === authUser._id ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"}`}>
                                    {message.image && (
                                        <img
                                            src={message.image}
                                            alt="Attachment"
                                            className="mb-2 rounded-md max-w-[160px] sm:max-w-[200px]"
                                        />
                                    )}
                                    {message.text && <p>{renderMessageText(message.text)}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
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
        </div>
    );
};

export default ChatContainer;