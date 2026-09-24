"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { IconCalendar, IconCheck, IconChat } from "@/components/icons";
import { crearSolicitudCita, enviarMensajeContacto, getFlags, type ModalidadCita, type ModuloSolicitud } from "@/lib/api";
import Stepper from "@/components/Stepper";

type Tab = "cita" | "mensaje";

// aceptaCitas=false: el servicio pertenece a un Módulo con RolResponsable
// "Agente" (Comercializadora, o cualquier módulo nuevo asignado a ese rol),
// que todavía no tiene flujo de agenda -- solo se ofrece el formulario de
// contacto simple (mismo criterio ya usado hoy para Comercializadora).
export default function GuestPanel({
  servicioInteres,
  aceptaCitas = true,
}: {
  servicioInteres?: string;
  aceptaCitas?: boolean;
} = {}) {
  const [tab, setTab] = useState<Tab>(aceptaCitas ? "cita" : "mensaje");

  useEffect(() => {
    if (!aceptaCitas) setTab("mensaje");
  }, [aceptaCitas]);

  if (!aceptaCitas) {
    return (
      <div className="border border-brand-line bg-brand-ink2 p-8 shadow-[0_30px_80px_-40px_rgba(201,162,74,0.25)]">
        <div className="flex items-center gap-2 border-b border-brand-line pb-4">
          <IconChat className="h-4 w-4 text-brand-gold" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">Enviar mensaje</p>
        </div>
        <p className="pt-3 text-xs text-brand-creamSoft">
          Este módulo todavía no tiene agenda propia: escríbenos y te contactamos directamente.
        </p>
        <div className="pt-6">
          <ContactForm servicioInteres={servicioInteres} />
        </div>
      </div>
    );
  }

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

      <div className="pt-6">
        {tab === "cita" ? (
          <AgendaForm servicioInteres={servicioInteres} />
        ) : (
          <ContactForm servicioInteres={servicioInteres} />
        )}
      </div>
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

const PASOS_AGENDA = ["Contacto", "Motivo", "Fecha y modalidad", "Confirmar"];

function AgendaForm({ servicioInteres }: { servicioInteres?: string }) {
  const [paso, setPaso] = useState(1);
  const [nombreCliente, setNombreCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [medioContacto, setMedioContacto] = useState("WhatsApp");
  const [modulo, setModulo] = useState<ModuloSolicitud>("Abogado");
  const [satHabilitado, setSatHabilitado] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [modalidad, setModalidad] = useState<ModalidadCita>("Presencial");
  const [aceptaAviso, setAceptaAviso] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const puedeAvanzarPaso1 = nombreCliente.trim() !== "" && telefono.trim() !== "" && email.trim() !== "";
  const puedeAvanzarPaso3 = fechaHora !== "";

  useEffect(() => {
    getFlags()
      .then((flags) => setSatHabilitado(flags.satHabilitado))
      .catch(() => undefined);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!aceptaAviso) return;
    setSaving(true);
    setError(null);
    try {
      await crearSolicitudCita({
        nombreSolicitante: nombreCliente,
        emailSolicitante: email,
        telefonoSolicitante: telefono,
        medioContactoPreferido: medioContacto,
        modulo,
        servicioInteres,
        descripcion: descripcion || null,
        fechaHoraPropuesta: new Date(fechaHora).toISOString(),
        modalidad,
        aceptoAvisoPrivacidad: aceptaAviso,
      });
      setEnviado(true);
    } catch {
      setError("No se pudo enviar tu solicitud. Intenta de nuevo o contáctanos por WhatsApp.");
    } finally {
      setSaving(false);
    }
  }

  if (enviado) {
    return (
      <SuccessNote
        text="Hemos recibido tu solicitud. El despacho revisará tu fecha propuesta y te avisaremos por correo si queda confirmada o si se propone otro horario."
        onReset={() => {
          setEnviado(false);
          setPaso(1);
          setNombreCliente("");
          setTelefono("");
          setEmail("");
          setModulo("Abogado");
          setDescripcion("");
          setFechaHora("");
          setAceptaAviso(false);
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Stepper pasos={PASOS_AGENDA} actual={paso} />

      {paso === 1 && (
        <div className="space-y-4">
          <Field label="Nombre completo">
            <input required value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Teléfono">
              <input required value={telefono} onChange={(e) => setTelefono(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Correo">
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field label="Medio de contacto preferido">
            <select value={medioContacto} onChange={(e) => setMedioContacto(e.target.value)} className={selectClass}>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Llamada">Llamada telefónica</option>
              <option value="Correo">Correo electrónico</option>
            </select>
          </Field>
          <NavegacionPasos onSiguiente={() => setPaso(2)} puedeAvanzar={puedeAvanzarPaso1} />
        </div>
      )}

      {paso === 2 && (
        <div className="space-y-4">
          {satHabilitado && (
            <Field label="¿Qué tipo de asesoría necesitas?">
              <select value={modulo} onChange={(e) => setModulo(e.target.value as ModuloSolicitud)} className={selectClass}>
                <option value="Abogado">Asesoría jurídica</option>
                <option value="SAT">Trámite SAT</option>
              </select>
            </Field>
          )}
          <Field label="¿En qué podemos ayudarte? (opcional)">
            <textarea
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Cuéntanos brevemente tu situación…"
              className={`${inputClass} resize-none`}
            />
          </Field>
          <NavegacionPasos onAnterior={() => setPaso(1)} onSiguiente={() => setPaso(3)} puedeAvanzar />
        </div>
      )}

      {paso === 3 && (
        <div className="space-y-4">
          <Field label="Fecha y hora propuestas">
            <input
              required
              type="datetime-local"
              value={fechaHora}
              onChange={(e) => setFechaHora(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Modalidad">
            <select value={modalidad} onChange={(e) => setModalidad(e.target.value as ModalidadCita)} className={selectClass}>
              <option value="Presencial">Presencial</option>
              <option value="Videollamada">Videollamada</option>
              <option value="Llamada">Llamada telefónica</option>
            </select>
          </Field>
          <p className="text-xs text-brand-creamSoft">
            Esta es tu fecha propuesta: el despacho la confirmará o te propondrá otro horario si no está disponible.
          </p>
          <NavegacionPasos onAnterior={() => setPaso(2)} onSiguiente={() => setPaso(4)} puedeAvanzar={puedeAvanzarPaso3} />
        </div>
      )}

      {paso === 4 && (
        <div className="space-y-4">
          <div className="space-y-1 border border-brand-line bg-brand-ink px-4 py-3 text-sm text-brand-creamSoft">
            <p><span className="text-brand-cream">{nombreCliente}</span> · {telefono} · {email}</p>
            <p>{new Date(fechaHora).toLocaleString("es-MX")} · {modalidad}</p>
          </div>
          <label className="flex items-start gap-2 text-xs text-brand-creamSoft">
            <input
              type="checkbox"
              checked={aceptaAviso}
              onChange={(e) => setAceptaAviso(e.target.checked)}
              className="mt-0.5"
            />
            He leído y acepto el{" "}
            <Link href="/aviso-privacidad" target="_blank" className="text-brand-gold underline hover:no-underline">
              aviso de privacidad
            </Link>{" "}
            del despacho para el tratamiento de mis datos de contacto.
          </label>

          {error && <ErrorNote text={error} />}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPaso(3)}
              className="flex-1 border border-brand-line px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-brand-creamSoft hover:border-brand-gold hover:text-brand-gold"
            >
              Atrás
            </button>
            <div className="flex-[2]">
              <SubmitButton saving={saving} disabled={!aceptaAviso} label="Enviar solicitud" savingLabel="Enviando…" />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

function NavegacionPasos({
  onAnterior,
  onSiguiente,
  puedeAvanzar,
}: {
  onAnterior?: () => void;
  onSiguiente: () => void;
  puedeAvanzar: boolean;
}) {
  return (
    <div className="flex gap-3">
      {onAnterior && (
        <button
          type="button"
          onClick={onAnterior}
          className="flex-1 border border-brand-line px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-brand-creamSoft hover:border-brand-gold hover:text-brand-gold"
        >
          Atrás
        </button>
      )}
      <button
        type="button"
        onClick={onSiguiente}
        disabled={!puedeAvanzar}
        className={`${onAnterior ? "flex-[2]" : "w-full"} bg-gradient-to-r from-brand-gold to-brand-goldDeep px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-brand-ink transition-opacity hover:opacity-90 disabled:opacity-50`}
      >
        Continuar
      </button>
    </div>
  );
}

function ContactForm({ servicioInteres }: { servicioInteres?: string }) {
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
      await enviarMensajeContacto({ nombre, telefono, email: email || null, mensaje, servicioInteres });
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

      <p className="text-xs text-brand-creamSoft">
        Al enviar este formulario aceptas el{" "}
        <Link href="/aviso-privacidad" target="_blank" className="text-brand-gold underline hover:no-underline">
          aviso de privacidad
        </Link>{" "}
        del despacho.
      </p>

      <SubmitButton saving={saving} label="Enviar mensaje" savingLabel="Enviando…" />
    </form>
  );
}

const inputClass =
  "mt-2 w-full border border-brand-line bg-transparent px-4 py-2.5 text-brand-cream outline-none transition-colors focus:border-brand-gold";

// Un <select> con fondo transparente hereda el blanco del navegador en su lista
// desplegable nativa; le damos fondo sólido y color-scheme:dark para que las
// opciones también se vean con los colores de la marca, no en blanco. No reutiliza
// inputClass porque su bg-transparent tendría la misma especificidad que bg-brand-ink
// y el orden de generación de Tailwind podría dejar ganando al transparente.
const selectClass =
  "mt-2 w-full border border-brand-line bg-brand-ink px-4 py-2.5 text-brand-cream outline-none transition-colors focus:border-brand-gold [color-scheme:dark]";

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
  disabled = false,
}: {
  saving: boolean;
  label: string;
  savingLabel: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={saving || disabled}
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
