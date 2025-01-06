import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
    const { selectedUser, setSelectedUser } = useChatStore();

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setSelectedUser(null); // Set selectedUser to null when "Esc" is pressed
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        // Cleanup the event listener on unmount
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [setSelectedUser]);

    return (
        <div className="bg-base-200 h-[calc(100dvh-64.8px)]">
            <div className="flex justify-center items-center sm:px-4 sm:pt-7 h-full sm:h-auto">
                <div className="bg-base-100 shadow-cl sm:rounded-lg w-full max-w-6xl h-full sm:h-[calc(100vh-8rem)]">
                    <div className="flex rounded-lg h-full overflow-hidden relative">
                        <Sidebar />

                        {!selectedUser ? <div className="w-full flex-1 my-auto hidden sm:flex"><NoChatSelected /></div> : <ChatContainer />}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default HomePage;