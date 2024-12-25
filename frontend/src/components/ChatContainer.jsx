import { useChatStore } from '../store/useChatStore';
import React, { useEffect, useRef } from 'react';

import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './skeletons/MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime, formatMessageDate } from '../lib/utils';

const ChatContainer = () => {
    const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);

    useEffect(() => {
        getMessages(selectedUser._id);

        subscribeToMessages();

        return () => unsubscribeFromMessages();
    }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Helper function to determine if a new date header should be shown
    const shouldShowDateHeader = (currentMessage, previousMessage) => {
        const currentDate = new Date(currentMessage.createdAt).toDateString();
        const previousDate = previousMessage
            ? new Date(previousMessage.createdAt).toDateString()
            : null;

        return currentDate !== previousDate;
    };

    if (isMessagesLoading) {
        return (
            <div className="flex flex-col flex-1 overflow-auto">
                <ChatHeader />
                <MessageSkeleton messages={messages} authUser={authUser} />
                <MessageInput />
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 overflow-auto">
            <ChatHeader />

            <div className="flex-1 space-y-4 p-4 overflow-y-auto">
                {messages.length === 0 && !isMessagesLoading && ( // Check for empty messages and not loading state
                    <div className="text-center">
                        No Messages here. <br /> Start Conversation Now!
                    </div>
                )}
                {messages.map((message, index) => {
                    const showDateHeader = shouldShowDateHeader(
                        message,
                        messages[index - 1]
                    );

                    return (
                        <React.Fragment key={message._id}>
                            {showDateHeader && (
                                <div className="mx-auto text-xs p-1 px-1.5 rounded-md bg-base-300 w-fit my-2">
                                    {formatMessageDate(message.createdAt)}
                                </div>
                            )}
                            <div
                                className={`chat ${
                                    message.senderId === authUser._id
                                        ? 'chat-end'
                                        : 'chat-start'
                                    }`}
                                ref={index === messages.length - 1 ? messageEndRef : null}
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
                                            className="mb-2 rounded-md sm:max-w-[200px]"
                                        />
                                    )}
                                    {message.text && <p>{message.text}</p>}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            <MessageInput />
        </div>
    );
};

export default ChatContainer;