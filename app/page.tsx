"use client";

import { useState } from "react";
import { isEmail } from "@/lib/validation";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY_FORM = {
  recipientName: "",
  recipientEmail: "",
  senderName: "",
  senderEmail: "",
  company: "",
};

export default function Home() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): string | null {
    if (!form.recipientName.trim() || !form.senderName.trim()) {
      return "Please fill in both names.";
    }
    if (!isEmail(form.recipientEmail)) {
      return "Please enter a valid recipient email.";
    }
    if (!isEmail(form.senderEmail)) {
      return "Please enter a valid sender email.";
    }
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setStatus("error");
      setErrorMessage(validationError);
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setForm(EMPTY_FORM);
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  const submitting = status === "submitting";

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-500">
            RoastCard
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">
            Send a birthday roast 🎂
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Four details, one button. The roast is a surprise.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field
            label="Recipient Name"
            placeholder="e.g. Sam"
            value={form.recipientName}
            onChange={(v) => update("recipientName", v)}
          />
          <Field
            label="Recipient Email"
            type="email"
            placeholder="sam@example.com"
            value={form.recipientEmail}
            onChange={(v) => update("recipientEmail", v)}
          />
          <Field
            label="Sender Name"
            placeholder="Your name"
            value={form.senderName}
            onChange={(v) => update("senderName", v)}
          />
          <Field
            label="Sender Email"
            type="email"
            placeholder="you@example.com"
            value={form.senderEmail}
            onChange={(v) => update("senderEmail", v)}
          />

          {/* Honeypot: hidden from users, catches naive bots. */}
          <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-rose-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send the card"}
          </button>
        </form>

        {status === "success" && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
            Card sent! 🎉
          </p>
        )}
        {status === "error" && (
          <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700">
            {errorMessage}
          </p>
        )}
      </div>
    </main>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

function Field({ label, value, onChange, type = "text", placeholder }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
      />
    </label>
  );
}
