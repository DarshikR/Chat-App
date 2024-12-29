import { Users } from "lucide-react";

const SidebarSkeleton = ({ users }) => {
    // Create 8 skeleton items
    // const skeletonContacts = Array(users).fill(null);
    const skeletonContacts = Array(5).fill(null);

    return (
        <aside
            className="flex flex-col border-r border-base-300 w-full sm:w-20 lg:w-72 h-full transition-all duration-200"
        >
            {/* Header */}
            <div className="p-3.5 sm:p-4 border-b border-base-300 w-full flex sm:block items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    <span className="sm:hidden lg:block font-medium">Contacts</span>
                </div>
                <div className="flex flex-wrap sm:hidden lg:flex items-center gap-2 sm:mt-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            // checked={showOnlineOnly}
                            // onChange={(e) => setShowOnlineOnly(e.target.checked)}
                            className="checkbox checkbox-sm"
                        />
                        <span className="text-sm flex gap-1">Show online <a className='hidden sm:block'>only</a></span>
                    </label>
                    <span className="text-xs text-zinc-500">(0 online)</span>
                </div>
            </div>

            {/* Skeleton Contacts */}
            <div className="py-3 w-full overflow-y-auto">
                {skeletonContacts.map((_, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 w-full">
                        {/* Avatar skeleton */}
                        <div className="relative sm:mx-auto lg:mx-0">
                            <div className="rounded-full size-12 skeleton" />
                        </div>

                        {/* User info skeleton - only visible on larger screens */}
                        <div className="sm:hidden lg:block flex-1 min-w-0 text-left">
                            <div className="mb-2 w-32 h-4 skeleton" />
                            <div className="w-16 h-3 skeleton" />
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default SidebarSkeleton;