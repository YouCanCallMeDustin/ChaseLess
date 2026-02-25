export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg border p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-700 tracking-tight">ChaseLess.</h1>
                </div>
                {children}
            </div>
        </div>
    );
}
