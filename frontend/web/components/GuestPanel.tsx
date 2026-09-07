"use client";

import { useState, type FormEvent } from "react";
import { IconCalendar, IconCheck, IconChat } from "@/components/icons";
import { createCita, enviarMensajeContacto } from "@/lib/api";

type Tab = "cita" | "mensaje";

export default function GuestPanel() {
  const [tab, setTab] = useState<Tab>("cita");

  return (
    <div className="border border-brand-line bg-brand-ink2 p-8 shadow-[0_30px_80px_-40px_rgba(201,162,74,0.25)]">
      <div className="relative grid grid-cols-2 border-b border-brand-line">
        <TabButton
          active={tab === "cita"}
          onClick={() => setTab("cita")}
          icon={IconCalendar}
          label="Agendar cita"
        />
        <TabButton
          active={tab === "mensaje"}
          onClick={() => setTab("mensaje")}
          icon={IconChat}
          label="Enviar mensaje"
        />
        <div
          className="absolute bottom-0 h-[2px] w-1/2 bg-gradient-to-r from-brand-gold to-brand-goldDeep transition-transform duration-300 ease-out"
          style={{ transform: tab === "cita" ? "translateX(0%)" : "translateX(100%)" }}
        />
      </div>

      <div className="pt-6">{tab === "cita" ? <AgendaForm /> : <ContactForm />}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof IconCalendar;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 pb-4 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
        active ? "text-brand-gold" : "text-brand-creamSoft hover:text-brand-cream"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function AgendaForm() {
  const [nombreCliente, setNombreCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [saving, setSaving] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createCita({
        nombreCliente,
        telefono,
        fechaHora: new Date(fechaHora).toISOString(),
        casoId: null,
      });
      setEnviado(true);
      setNombreCliente("");
      setTelefono("");
      setFechaHora("");
    } catch {
      setError("No se pudo enviar tu solicitud. Intenta de nuevo o contáctanos por WhatsApp.");
    } finally {
      setSaving(false);
    }
  }

  if (enviado) {
    return <SuccessNote text="Hemos recibido tu solicitud. Nos pondremos en contacto contigo para confirmar tu asesoría." onReset={() => setEnviado(false)} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nombre completo">
        <input
          required
          value={nombreCliente}
          onChange={(e) => setNombreCliente(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Teléfono">
        <input
          required
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Fecha y hora preferida">
        <input
          required
          type="datetime-local"
          value={fechaHora}
          onChange={(e) => setFechaHora(e.target.value)}
          className={inputClass}
        />
      </Field>

      {error && <ErrorNote text={error} />}

      <SubmitButton saving={saving} label="Agenda tu asesoría hoy" savingLabel="Enviando…" />
    </form>
  );
}

function ContactForm() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [saving, setSaving] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await enviarMensajeContacto({ nombre, telefono, email: email || null, mensaje });
      setEnviado(true);
      setNombre("");
      setTelefono("");
      setEmail("");
      setMensaje("");
    } catch {
      setError("No se pudo enviar tu mensaje. Intenta de nuevo o escríbenos por WhatsApp.");
    } finally {
      setSaving(false);
    }
  }

  if (enviado) {
    return <SuccessNote text="Tu mensaje fue enviado. La Lic. Erika Cruz García lo revisará y te responderá a la brevedad." onReset={() => setEnviado(false)} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nombre completo">
        <input
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={inputClass}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Teléfono">
          <input
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Correo (opcional)">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="¿En qué podemos ayudarte?">
        <textarea
          required
          rows={4}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Cuéntanos brevemente tu situación…"
          className={`${inputClass} resize-none`}
        />
      </Field>

      {error && <ErrorNote text={error} />}

      <SubmitButton saving={saving} label="Enviar mensaje" savingLabel="Enviando…" />
    </form>
  );
}

const inputClass =
  "mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none transition-colors focus:border-brand-gold";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium uppercase tracking-[0.2em] text-brand-creamSoft">
        {label}
      </label>
      {children}
    </div>
  );
}

function SubmitButton({
  saving,
  label,
  savingLabel,
}: {
  saving: boolean;
  label: string;
  savingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="group relative w-full overflow-hidden bg-gradient-to-r from-brand-gold to-brand-goldDeep px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
    >
      <span
        className="animate-shimmer pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.35),transparent)] opacity-0 transition-opacity group-hover:opacity-100"
      />
      <span className="relative">{saving ? savingLabel : label}</span>
    </button>
  );
}

function SuccessNote({ text, onReset }: { text: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 border border-brand-gold/50 bg-brand-gold/10 px-5 py-6">
      <IconCheck className="h-6 w-6 text-brand-gold" />
      <p className="text-sm text-brand-cream">{text}</p>
      <button
        type="button"
        onClick={onReset}
        className="text-xs uppercase tracking-widest text-brand-gold hover:underline"
      >
        Enviar otro
      </button>
    </div>
  );
}

function ErrorNote({ text }: { text: string }) {
  return (
    <p className="border border-brand-goldDeep/60 bg-brand-goldDeep/10 px-4 py-3 text-sm text-brand-gold">
      {text}
    </p>
  );
}
