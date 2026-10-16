interface FechaProps {
  value?: string | Date | null;
}

export default function Fecha({ value }: FechaProps) {
  if (!value) return <>-</>;
  const fechaFormateada = new Date(value)
    .toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
    .replace(/\//g, '-');
  return <>{fechaFormateada}</>;
}
