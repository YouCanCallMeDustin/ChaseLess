import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 py-4 flex items-center justify-between border-b bg-white">
        <div className="font-bold text-2xl text-blue-700 tracking-tight">ChaseLess.</div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-blue-700">Login</Link>
          <Link href="/register" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center text-center px-6 py-24 bg-gradient-to-b from-white to-slate-50">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 max-w-3xl tracking-tight leading-tight mb-6">
          Stop Chasing Payments. <br />
          <span className="text-blue-600">Start Getting Paid.</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed">
          The simple, zero-budget payment discipline kit for service contractors.
          Send professional, staged reminders without the awkward follow-ups.
        </p>

        <Link href="/register" className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl">
          Start Your Discipline Kit <ArrowRight className="w-5 h-5" />
        </Link>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full text-left">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <Clock className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Escalation Timeline</h3>
            <p className="text-slate-600">Know exactly when to send a friendly reminder, a firm notice, or a demand letter. No guessing.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <ShieldCheck className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Templated Professionalism</h3>
            <p className="text-slate-600">Tested templates that keep you professional while enforcing a strict boundary.</p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-slate-500 text-sm border-t bg-white">
        &copy; {new Date().getFullYear()} ChaseLess. Stop Chasing Payments.
      </footer>
    </div>
  );
}
