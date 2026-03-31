import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import FileUpload from './FileUpload';

const DRAFT_KEY = 'refund_form_draft';

const REFUND_REASONS = [
  'Property Issue',
  'Booking Error',
  'Personal Reasons',
  'Other',
];

const schema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  booking_reference: z.string().min(1, 'Booking reference is required'),
  booking_date: z.string().min(1, 'Booking date is required'),
  refund_reason: z.string().min(1, 'Please select a refund reason'),
  details: z.string().max(1000, 'Details must be under 1000 characters').optional().or(z.literal('')),
});

function isOutsideWindow(dateStr) {
  if (!dateStr) return false;
  const booking = new Date(dateStr);
  const today = new Date();
  const diffMs = today - booking;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > 90;
}

export default function RefundForm({ onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const firstFieldRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: '',
      email: '',
      booking_reference: '',
      booking_date: '',
      refund_reason: '',
      details: '',
    },
  });

  const watchedValues = watch();
  const bookingDate = watch('booking_date');
  const details = watch('details') || '';
  const outsideWindow = isOutsideWindow(bookingDate);

  // Auto-focus first field
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        Object.entries(draft).forEach(([key, value]) => {
          setValue(key, value);
        });
      }
    } catch {
      // ignore corrupt drafts
    }
  }, [setValue]);

  // Save draft to localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(watchedValues));
      } catch {
        // storage full, ignore
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [watchedValues]);

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
  }, []);

  const scrollToFirstError = () => {
    const firstErrorField = document.querySelector('[data-error="true"]');
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const uploadFile = async (file) => {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueName = `${timestamp}_${safeName}`;

    const { error } = await supabase.storage
      .from('refund-files')
      .upload(uniqueName, file, { contentType: file.type });

    if (error) throw new Error(`File upload failed: ${error.message}`);

    const { data: urlData } = supabase.storage
      .from('refund-files')
      .getPublicUrl(uniqueName);

    return urlData.publicUrl;
  };

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let fileUrl = null;
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
      }

      const record = {
        full_name: data.full_name,
        email: data.email,
        booking_reference: data.booking_reference,
        booking_date: data.booking_date,
        refund_reason: data.refund_reason,
        details: data.details || null,
        file_url: fileUrl,
        is_outside_window: outsideWindow,
      };

      const { error: dbError } = await supabase
        .from('refund_requests')
        .insert([record]);

      if (dbError) throw new Error(`Submission failed: ${dbError.message}`);

      toast.success('Refund request submitted successfully!');
      localStorage.removeItem(DRAFT_KEY);
      reset();
      setSelectedFile(null);
      onSuccess(record);
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = () => {
    toast.error('Please fix the errors below.');
    setTimeout(scrollToFirstError, 100);
  };

  const inputClasses = (fieldName) =>
    `w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-all focus:ring-2 focus:ring-purple-500/50 ${
      errors[fieldName]
        ? 'border-red-500/70 focus:border-red-500'
        : 'border-white/15 focus:border-purple-400/60'
    }`;

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onSubmit={handleSubmit(onSubmit, onError)}
      className="w-full max-w-lg mx-auto space-y-5"
      noValidate
    >
      {/* Full Name */}
      <Field label="Full Name" error={errors.full_name} required>
        <input
          {...register('full_name')}
          ref={(e) => {
            register('full_name').ref(e);
            firstFieldRef.current = e;
          }}
          placeholder="John Doe"
          className={inputClasses('full_name')}
          data-error={!!errors.full_name}
        />
      </Field>

      {/* Email */}
      <Field label="Email" error={errors.email} required>
        <input
          {...register('email')}
          type="email"
          placeholder="john@example.com"
          className={inputClasses('email')}
          data-error={!!errors.email}
        />
      </Field>

      {/* Booking Reference */}
      <Field label="Booking Reference" error={errors.booking_reference} required>
        <input
          {...register('booking_reference')}
          placeholder="BK-123456"
          className={inputClasses('booking_reference')}
          data-error={!!errors.booking_reference}
        />
      </Field>

      {/* Booking Date */}
      <Field label="Booking Date" error={errors.booking_date} required>
        <input
          {...register('booking_date')}
          type="date"
          className={`${inputClasses('booking_date')} [color-scheme:dark]`}
          data-error={!!errors.booking_date}
        />
      </Field>

      {/* Warning Banner */}
      <AnimatePresence>
        {outsideWindow && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
              <svg
                className="h-5 w-5 text-yellow-400 mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M12 3l9.66 16.59A1 1 0 0120.66 21H3.34a1 1 0 01-.86-1.41L12 3z"
                />
              </svg>
              <p className="text-sm text-yellow-200/90 leading-relaxed">
                Your booking is outside the standard refund window. Your request
                will be reviewed on a case-by-case basis.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refund Reason */}
      <Field label="Refund Reason" error={errors.refund_reason} required>
        <select
          {...register('refund_reason')}
          className={`${inputClasses('refund_reason')} appearance-none cursor-pointer`}
          data-error={!!errors.refund_reason}
        >
          <option value="" className="bg-gray-900">Select a reason...</option>
          {REFUND_REASONS.map((reason) => (
            <option key={reason} value={reason} className="bg-gray-900">
              {reason}
            </option>
          ))}
        </select>
      </Field>

      {/* Additional Details */}
      <Field label="Additional Details" error={errors.details}>
        <textarea
          {...register('details')}
          rows={4}
          placeholder="Tell us more about your request..."
          className={`${inputClasses('details')} resize-none`}
          data-error={!!errors.details}
          maxLength={1000}
        />
        <div className="flex justify-end mt-1">
          <span
            className={`text-xs ${
              details.length > 900 ? 'text-yellow-400' : 'text-white/30'
            }`}
          >
            {details.length}/1000
          </span>
        </div>
      </Field>

      {/* File Upload */}
      <FileUpload onFileSelect={handleFileSelect} />

      {/* Submit Button */}
      <div className="pt-2 sticky bottom-4 md:static">
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={isSubmitting ? {} : { scale: 1.02 }}
          whileTap={isSubmitting ? {} : { scale: 0.98 }}
          className={`w-full rounded-xl py-3.5 text-sm font-semibold transition-all shadow-lg cursor-pointer ${
            isSubmitting
              ? 'bg-purple-600/50 text-white/50 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25'
          }`}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Refund Request'
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}

function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-white/80">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-1 text-xs text-red-400"
          >
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
