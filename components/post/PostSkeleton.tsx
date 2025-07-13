
export default function PostCardSkeleton() {
    return (
        <div className="animate-pulse space-y-4 p-4 border rounded-md shadow-sm bg-white">
            {/* Header skeleton (avatar & name) */}
            <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="w-1/3 h-4 bg-gray-200 rounded" />
                    <div className="w-1/4 h-3 bg-gray-100 rounded" />
                </div>
            </div>

            {/* Text content skeleton */}
            <div className="space-y-2">
                <div className="w-full h-4 bg-gray-200 rounded" />
                <div className="w-3/4 h-4 bg-gray-200 rounded" />
                <div className="w-2/3 h-4 bg-gray-100 rounded" />
            </div>

            {/* Image skeleton */}
            <div className="w-full h-48 bg-gray-200 rounded-lg" />
        </div>
    );
}
