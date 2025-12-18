"use client";

export function IDELoadingState() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#1e1e1e]">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
        </div>
        <h2 className="text-xl font-semibold text-white">
          Loading ZacAi IDE...
        </h2>
        <p className="text-sm text-gray-400">
          Initializing workspace environment
        </p>
      </div>
    </div>
  );
}
