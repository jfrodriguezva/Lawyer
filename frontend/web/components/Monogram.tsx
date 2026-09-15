import Image from "next/image";

// Sello real del despacho (public/images/logo-ecg.png): su fondo es casi negro,
// igual que el fondo del sitio, así que sin un borde propio se pierde de vista.
// El anillo dorado y la sombra lo separan del fondo para que se lea como sello.
export default function Monogram({ size = 48 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full ring-1 ring-brand-gold/70 drop-shadow-[0_0_6px_rgba(201,162,74,0.35)]"
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/logo-ecg.png"
        alt="ECG Abogados"
        width={size}
        height={size}
        unoptimized
        priority
        className="h-full w-full rounded-full"
      />
    </span>
  );
}
