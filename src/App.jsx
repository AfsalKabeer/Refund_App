import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import RefundForm from './components/RefundForm';
import SuccessCard from './components/SuccessCard';

export default function App() {
  const [submittedData, setSubmittedData] = useState(null);

  const handleSuccess = (data) => {
    setSubmittedData(data);
  };

  const handleReset = () => {
    setSubmittedData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 py-10 md:py-16">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(30, 30, 50, 0.9)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
          },
          success: { iconTheme: { primary: '#a855f7', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20 ring-1 ring-purple-400/30">
            <svg className="h-7 w-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Guest Refund Request
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Submit your refund request and we'll get back to you within 48 hours.
          </p>
        </div>

        {/* Glass Card */}
        <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/20 p-6 md:p-8">
          <AnimatePresence mode="wait">
            {submittedData ? (
              <SuccessCard key="success" data={submittedData} onReset={handleReset} />
            ) : (
              <RefundForm key="form" onSuccess={handleSuccess} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
