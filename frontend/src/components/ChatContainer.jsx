import { useChatStore } from '../store/useChatStore';
import React, { useEffect, useRef, useState } from 'react';

import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './skeletons/MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime, formatMessageDate } from '../lib/utils';

const ChatContainer = () => {
    const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);
    const [loading, setLoading] = useState(true); // New state for 1-second delay

    useEffect(() => {
        getMessages(selectedUser._id);

        subscribeToMessages();

        return () => unsubscribeFromMessages();
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

    // Helper function to parse and convert URLs to clickable links
    const renderMessageText = (text) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            if (urlRegex.test(part)) {
                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                    >
                        {part}
                    </a>
                );
            }
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

            <div className="flex-1 space-y-3.5 p-2 sm:p-4 overflow-y-auto">
                {messages.length > 0 ? null : (
                    <div className="text-center">
                        No Messages here. <br /> Start Conversation Now!
                    </div>
                )}
                {Object.entries(groupMessagesByDate(messages)).map(([date, groupMessages], index) => (
                    <div key={date}>
                        <div
                            className="sticky top-0 mx-auto text-xs p-1 px-1.5 rounded-md bg-base-300/60 backdrop-blur w-fit z-10"
                        >
                            {formatMessageDate(date)}
                        </div>
                        {groupMessages.map((message, i) => (
                            <div
                                key={message._id}
                                className={`chat ${message.senderId === authUser._id ? 'chat-end' : 'chat-start'
                                    }`}
                                ref={i === groupMessages.length - 1 ? messageEndRef : null}
                            >
                                <div className="avatar chat-image">
                                    <div className="border rounded-full size-10">
                                        <img
                                            src={
                                                message.senderId === authUser._id
                                                    ? authUser.profilePic || '/avatar.png'
                                                    : selectedUser.profilePic || '/avatar.png'
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
            </div>

            <MessageInput />
        </div>
    );
};

export default ChatContainer;