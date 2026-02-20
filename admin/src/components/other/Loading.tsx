export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-red"></div>
        <p className="text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}