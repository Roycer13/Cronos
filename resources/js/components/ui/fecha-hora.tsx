interface FechaHoraProps {
  value?: string | Date | null;
  mode?: "inline" | "stacked"; // <-- agregado
}

export default function FechaHora({ value, mode = "inline" }: FechaHoraProps) {
  if (!value) return <>-</>;

  const fecha = new Date(value);

  // Si la fecha no es válida
  if (isNaN(fecha.getTime())) return <>-</>;

  const fechaFormateada = fecha
    .toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
    .replace(/\//g, "-");

  const horaFormateada = fecha.toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // ---- MODOS ----

  if (mode === "stacked") {
    return (
      <span className="flex flex-col leading-tight">
        <span>{fechaFormateada}</span>
        <span> {horaFormateada}</span>
      </span>
    );
  }

  // Modo inline por defecto
  return <>{`${fechaFormateada} ${horaFormateada}`}</>;
}
