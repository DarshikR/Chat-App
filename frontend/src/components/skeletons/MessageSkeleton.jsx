import { useEffect, useRef } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";

const MessageSkeleton = () => {

    const { messages, getMessages, selectedUser } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);

    useEffect(() => {
        getMessages(selectedUser._id);
    }, [selectedUser._id, getMessages]);

    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);
    // Create an array of 6 items for skeleton messages
    const skeletonMessages = Array(6).fill(null);

    return (
        <div className="flex-1 space-y-4 p-4 overflow-y-auto">
            {messages && messages.length > 0 ? (
                messages.map((message) => (
                    <div
                        key={message._id}
                        className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                        ref={messageEndRef}
                    >
                        <div className="avatar chat-image">
                            <div className="rounded-full size-10">
                                <div className="rounded-full w-full h-full skeleton" />
                            </div>
                        </div>

                        <div className="mb-1 chat-header">
                            <div className="w-16 h-4 skeleton" />
                        </div>

                        <div className="bg-transparent p-0 chat-bubble">
                            <div className="w-[100px] min-[425px]:w-[200px] h-16 skeleton" />
                        </div>
                    </div>
                ))
            ) : (
                // If messages are not provided or empty, show skeleton messages
                skeletonMessages.map((_, idx) => (
                    <div key={idx} className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}>
                        <div className="avatar chat-image">
                            <div className="rounded-full size-10">
                                <div className="rounded-full w-full h-full skeleton" />
                            </div>
                        </div>

                        <div className="mb-1 chat-header">
                            <div className="w-16 h-4 skeleton" />
                        </div>

                        <div className="bg-transparent p-0 chat-bubble">
                            <div className="w-[100px] min-[425px]:w-[200px] h-16 skeleton" />
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default MessageSkeleton;
