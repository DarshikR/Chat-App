import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore';
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import AuthImagePattern from '../components/AuthImagePattern';
import toast from 'react-hot-toast';

const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });

    const { signup, isSigningUp } = useAuthStore();

    const validateForm = () => {
        if (!formData.fullName.trim()) return toast.error("Full name is required");
        if (!formData.email.trim()) return toast.error("Email is required");
        if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
        if (!formData.password) return toast.error("Password is required");
        if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const success = validateForm();

        if (success === true) signup(formData);
    };

    return (
        <div className="grid lg:grid-cols-2">
            {/* left side */}
            <div className="flex flex-col justify-center items-center p-6 sm:p-12">
                <div className="space-y-8 w-full max-w-md">
                    {/* LOGO */}
                    <div className="mb-8 text-center">
                        <div className="flex flex-col items-center gap-2 group">
                            <div
                                className="group-hover:bg-primary/20 flex justify-center items-center bg-primary/10 rounded-xl transition-colors size-12"
                            >
                                <MessageSquare className="text-primary size-6" />
                            </div>
                            <h1 className="mt-2 font-bold text-2xl">Create Account</h1>
                            <p className="text-base-content/60">Get started with your free account</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="font-medium label-text">Full Name</span>
                            </label>
                            <div className="relative">
                                <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                                    <User className="text-base-content/40 size-5" />
                                </div>
                                <input
                                    type="text"
                                    className={`input input-bordered w-full pl-10`}
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="font-medium label-text">Email</span>
                            </label>
                            <div className="relative">
                                <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                                    <Mail className="text-base-content/40 size-5" />
                                </div>
                                <input
                                    type="email"
                                    className={`input input-bordered w-full pl-10`}
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="font-medium label-text">Password</span>
                            </label>
                            <div className="relative">
                                <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                                    <Lock className="text-base-content/40 size-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`input input-bordered w-full pl-10`}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    className="right-0 absolute inset-y-0 flex items-center pr-3"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="text-base-content/40 size-5" />
                                    ) : (
                                        <Eye className="text-base-content/40 size-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="w-full btn btn-primary" disabled={isSigningUp}>
                            {isSigningUp ? (
                                <>
                                    <Loader2 className="animate-spin size-5" />
                                    Loading...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-base-content/60">
                            Already have an account?{" "}
                            <Link to="/login" className="link link-primary">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* right side */}

            <AuthImagePattern
                title="Join our community"
                subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
            />
        </div>
    );
};

export default SignUpPage;