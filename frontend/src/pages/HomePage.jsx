import React from 'react'
import { useChatStore } from '../store/useChatStore';
import Sidebar from '../components/Sidebar';
import NoChatSelected from '../components/NoChatSelected';
import ChatContainer from '../components/ChatContainer';

const HomePage = () => {
    const { selectedUser } = useChatStore();

    return (
        <div className="bg-base-200 h-[calc(100dvh-64.8px)]">
            <div className="flex justify-center items-center px-4 pt-7">
                <div className="bg-base-100 shadow-cl rounded-lg w-full max-w-6xl h-[calc(100vh-8rem)]">
                    <div className="flex rounded-lg h-full overflow-hidden">
                        <Sidebar />

                        {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage