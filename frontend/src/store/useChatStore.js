import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from './useAuthStore'

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selecedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages, users } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            const newMessage = res.data;

            // Update the messages array
            set({ messages: [...messages, newMessage] });

            // Update the `lastMessage` for the selected user in the `users` array
            const updatedUsers = users.map(user => {
                if (user._id === selectedUser._id) {
                    return {
                        ...user,
                        lastMessage: newMessage, // Set the new message as `lastMessage`
                    };
                }
                return user;
            });

            set({ users: updatedUsers }); // Trigger sidebar re-render
        } catch (error) {
            toast.error(error.response?.data?.message || "Error sending message");
        }
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;

        if (!socket) {
            console.warn("Socket is not connected.");
            return;
        }

        // Remove any existing listeners to avoid duplicates
        socket.off("newMessage");

        // Add a fresh listener for "newMessage"
        socket.on("newMessage", (newMessage) => {
            const { users, selectedUser, messages } = get();

            // Update the `lastMessage` for the relevant user in `users`
            const updatedUsers = users.map((user) => {
                if (
                    user._id === newMessage.senderId ||
                    user._id === newMessage.receiverId
                ) {
                    return {
                        ...user,
                        lastMessage: newMessage,
                    };
                }
                return user;
            });

            set({ users: updatedUsers });

            // Update the `messages` array if the message is for the selected user
            if (
                selectedUser &&
                (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)
            ) {
                set({
                    messages: [...messages, newMessage],
                });
            }
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;

        if (socket) {
            socket.off("newMessage");
        }
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));