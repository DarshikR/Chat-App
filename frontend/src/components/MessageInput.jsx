import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);

    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const { sendMessage, selectedUser } = useChatStore();
    const socket = useAuthStore((state) => state.socket);

    // 🔹 IMAGE HANDLING (unchanged)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file?.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // 🔹 TYPING HANDLER (NEW)
    const handleTyping = (e) => {
        setText(e.target.value);

        if (!socket || !selectedUser) return;

        socket.emit("typing", { to: selectedUser._id });

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", { to: selectedUser._id });
        }, 800);
    };

    // 🔹 SEND MESSAGE (slightly enhanced)
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imagePreview) return;

        try {
            await sendMessage({
                text: text.trim(),
                image: imagePreview,
            });

            // stop typing immediately after send
            socket?.emit("stopTyping", { to: selectedUser._id });

            // reset state
            setText("");
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <div className="p-2 sm:p-4 w-full border-t border-base-300 bg-base-100">
            {imagePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                            flex items-center justify-center"
                            type="button"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md"
                        placeholder="Type a message..."
                        value={text}
                        onChange={handleTyping}   // 🔥 changed
                    />

                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />

                    <button
                        type="button"
                        className={`btn btn-circle btn-sm sm:btn-md ${imagePreview ? "text-emerald-500" : "text-zinc-400"
                            }`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image size={20} />
                    </button>
                </div>

                <button
                    type="submit"
                    className="btn btn-circle btn-sm sm:btn-md"
                    disabled={!text.trim() && !imagePreview}
                >
                    <Send className="size-5 sm:size-[22px]" />
                </button>
            </form>
        </div>
    );
};

export default MessageInput;