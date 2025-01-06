import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import { formatSidebarDate } from "../lib/utils";

const Sidebar = () => {
    const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();

    const { onlineUsers, authUser } = useAuthStore();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [loading, setLoading] = useState(true); // New state for 2-second delay

    useEffect(() => {
        getUsers();
        // Set a 2-second delay before loading completes
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, [getUsers]);

    const filteredUsers = showOnlineOnly ? users.filter(user => onlineUsers.includes(user._id)) : users;

    if (isUsersLoading || loading) return <SidebarSkeleton users={users.length} />

    return (
        <aside className="flex flex-col border-r border-base-300 w-full sm:w-20 lg:w-72 h-full transition-all duration-200">
            <div className="p-3.5 sm:p-4 flex sm:block items-center justify-between border-b border-base-300 w-full">
                <div className="flex items-center gap-2">
                    <Users className="size-6" />
                    <span className="font-medium sm:hidden lg:block">Contacts</span>
                </div>
                <div className="flex flex-wrap sm:hidden lg:flex items-center gap-2 sm:mt-3">
                    <label className="cursor-pointer flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={showOnlineOnly}
                            onChange={(e) => setShowOnlineOnly(e.target.checked)}
                            className="checkbox checkbox-sm"
                        />
                        <span className="text-sm flex gap-1">Show online <a className="hidden sm:block">only</a></span>
                    </label>
                    <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
                </div>
            </div>

            <div className="overflow-y-auto w-full py-3 h-[calc(100dvh-8rem)]">
                {filteredUsers.map((user) => (
                    <button
                        key={user._id}
                        onClick={() => setSelectedUser(user)}
                        className={`
                            w-full p-3 flex items-center gap-3
                            hover:bg-base-300 transition-colors
                            ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                        `}
                        title={user.fullName}
                    >
                        <div className="relative sm:mx-auto lg:mx-0 min-w-12">
                            <img
                                src={user.profilePic || "/avatar.png"}
                                alt={user.fullName}
                                className="rounded-full object-cover size-12"
                            />
                            {onlineUsers.includes(user._id) && (
                                <span className="right-0 bottom-0 absolute bg-green-500 rounded-full ring-2 ring-base-100/80 size-3" />
                            )}
                        </div>

                        {/* User info - only visible on larger screens */}
                        <div className="sm:hidden lg:block min-w-0 flex-1 text-left">
                            <div className="sm:font-medium flex justify-between items-center">
                                <span className="truncate">{user.fullName}</span>
                                {/* Show last message date */}
                                {user.lastMessage?.createdAt && (
                                    <span className="text-xs text-gray-500">
                                        {formatSidebarDate(user.lastMessage.createdAt)}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-zinc-400 truncate w-full">
                            {user.lastMessage ? (
                                    <>
                                        {user.lastMessage.senderId === authUser._id ? "Me: " : ""}
                                        {user.lastMessage.text || user.lastMessage.content}
                                    </>
                                ) : (
                                    onlineUsers.includes(user._id) ? "Online" : "Offline"
                                )}
                            </div>
                        </div>
                    </button>
                ))}

                {filteredUsers.length === 0 && (
                    <div className="text-center text-zinc-500 py-4">No online users</div>
                )}
            </div>
        </aside>
    );
};
export default Sidebar;