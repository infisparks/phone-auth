"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) {
                router.push("/");
            }
        };
        checkUser();
    }, [router]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#050511] text-white">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    Welcome to Dashboard
                </h1>
                <p className="text-white/50">You are successfully logged in.</p>
                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        router.push("/");
                    }}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
