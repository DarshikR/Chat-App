import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const Navbar = () => {
    const { logout, authUser } = useAuthStore();
    const { setSelectedUser } = useChatStore();

    const handleLogout = () => {
        logout();
        setSelectedUser(null);
    }

    return (
        <header className="bg-base-100 border-b border-base-300 sticky w-full top-0 z-10 backdrop-blur-lg bg-base-100/80">
            <div className="container mx-auto px-4 h-16">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-8">
                        <Link to="/" onClick={(e) => {setSelectedUser(null)}} className="flex items-center gap-2.5 hover:opacity-80 transition-all">
                            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-primary" />
                                {/* <svg xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round">

                                    <path d="M3 6 a2 2 0 0 1 2-2 h9 a2 2 0 0 1 2 2 v6 a2 2 0 0 1-2 2 H7 l-3 3 v-3 a2 2 0 0 1-1-2z"/>

                                    <path d="M9 10 a2 2 0 0 1 2-2 h7 a2 2 0 0 1 2 2 v5 a2 2 0 0 1-2 2 h-5 l-2 2 v-2"/>
                                </svg> */}
                            </div>
                            <h1 className="text-lg font-bold">Chatty</h1>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            to={"/settings"}
                            className={`btn btn-sm gap-2 transition-colors`}
                        >
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Settings</span>
                        </Link>

                        {authUser && (
                            <>
                                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                                    <User className="size-5" />
                                    <span className="hidden sm:inline">Profile</span>
                                </Link>

                                <button className="flex gap-2 items-center" onClick={handleLogout}>
                                    <LogOut className="size-5" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
export default Navbar;