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

  // 🔥 Image modal state
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoom, setZoom] = useState(1);

  // ===============================
  // Fetch messages + subscribe
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
  // Auto scroll on new messages
  // ===============================
  useEffect(() => {
    if (!loading && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // ===============================
  // Group messages by date
  // ===============================
  const groupMessagesByDate = (messages) => {
    return messages.reduce((groups, message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
      return groups;
    }, {});
  };

  // ⚠️ IMPORTANT FIX
  const groupedMessages = Object.entries(groupMessagesByDate(messages));
  const lastGroupIndex = groupedMessages.length - 1;

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
  // Text parsing
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
        const url = part.startsWith("http") ? part : `http://${part}`;
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
        <MessageSkeleton messages={messages} authUser={authUser} />
        <MessageInput />
      </div>
    );
  }

  // ===============================
  // Render
  // ===============================
  return (
    <div className="flex flex-col flex-1 overflow-auto bg-base-100">
      <ChatHeader />

      <div className="flex-1 space-y-3.5 p-4 overflow-y-auto" onScroll={handleScroll}>
        {messages.length === 0 && (
          <div className="text-center">
            No messages yet. <br /> Start the conversation now!
          </div>
        )}

        {groupedMessages.map(([date, groupMessages], groupIndex) => {
          const isLastGroup = groupIndex === lastGroupIndex;
          const lastMessageIndex = groupMessages.length - 1;

          return (
            <div key={date}>
              <div className="sticky top-0 mx-auto text-xs p-1 rounded-md bg-base-300/60 backdrop-blur w-fit z-10">
                {formatMessageDate(date)}
              </div>

              {groupMessages.map((message, i) => (
                <div
                  key={message._id}
                  className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"
                    }`}
                  ref={
                    isLastGroup && i === lastMessageIndex
                      ? messageEndRef
                      : null
                  }
                >
                  <div className="avatar chat-image">
                    <div className="border rounded-full size-10">
                      <img
                        src={
                          message.senderId === authUser._id
                            ? authUser.profilePic || "/avatar.png"
                            : selectedUser.profilePic || "/avatar.png"
                        }
                        alt="profile"
                      />
                    </div>
                  </div>

                  <div className="mb-1 chat-header">
                    <time className="text-xs opacity-50 ml-1">
                      {formatMessageTime(message.createdAt)}
                    </time>
                  </div>

                  <div
                    className={`chat-bubble flex flex-col ${message.senderId === authUser._id
                        ? "bg-primary text-primary-content"
                        : "bg-base-200 text-base-content"
                      }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="attachment"
                        onClick={() => setSelectedImage(message.image)}
                        className="mb-2 rounded-md max-w-[200px] cursor-pointer"
                      />
                    )}
                    {message.text && <p>{renderMessageText(message.text)}</p>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {showGoBackButton && (
          <button
            onClick={scrollToLastMessage}
            className="sticky bottom-0 float-right bg-base-300/60 backdrop-blur rounded-full p-2"
          >
            <ArrowDown size={20} />
          </button>
        )}
      </div>

      <MessageInput />

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setSelectedImage(null)}
        >
          <div className="relative flex flex-col items-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="ml-auto bg-white/20 rounded-full p-1.5"
            >
              <X size={20} />
            </button>

            <img
              src={selectedImage}
              alt="zoomed"
              className="max-w-[90vw] max-h-[80vh] my-2 rounded-md"
              style={{ transform: `scale(${zoom})` }}
            />

            <div className="flex gap-3 bg-white/20 rounded-full p-2">
              <button onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}>
                <ZoomIn />
              </button>
              <button onClick={() => setZoom((z) => Math.max(z - 0.25, 1))}>
                <ZoomOut />
              </button>
              <a href={selectedImage} download>
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