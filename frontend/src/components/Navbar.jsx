import React from 'react'
import { Link } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, MessageSquare, Settings, User } from "lucide-react";

const Navbar = () => {
    const { logout, authUser } = useAuthStore();

    return (
        <header className="top-0 z-40 sticky bg-base-100 bg-base-100/80 backdrop-blur-lg border-b border-base-300 w-full">
            <div className="mx-auto px-4 h-16 container">
                <div className="flex justify-between items-center h-full">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
                            <div className="flex justify-center items-center bg-primary/10 rounded-lg size-9">
                                <MessageSquare className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="font-bold text-lg">Chatty</h1>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            to={"/settings"}
                            className={`btn btn-sm gap-2 transition-colors`}
                        >
                            <Settings className="w-4 h-4" />
                            <span className="sm:inline hidden">Settings</span>
                        </Link>

                        {authUser && (
                            <>
                                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                                    <User className="size-5" />
                                    <span className="sm:inline hidden">Profile</span>
                                </Link>

                                <button className="flex items-center gap-2" onClick={logout}>
                                    <LogOut className="size-5" />
                                    <span className="sm:inline hidden">Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar