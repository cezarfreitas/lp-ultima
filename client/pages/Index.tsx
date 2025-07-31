export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent leading-tight">
                Seja bem-vindo
              </h1>
              
              <div className="flex justify-center">
                <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="relative">
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-200 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-20 -right-20 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Geometric Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-400 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-400 rounded-full opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-indigo-300 rounded-full opacity-50 animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-purple-300 rounded-full opacity-40 animate-pulse delay-1500"></div>
      </div>
    </div>
  );
}
