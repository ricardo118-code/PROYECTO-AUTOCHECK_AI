
export const normalizarTexto = (texto: string): string =>
  (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const formatearFechaEcuador = (fechaIso: string): string => {
  if (!fechaIso) return '';
  try {
    const d = new Date(fechaIso);
    return new Intl.DateTimeFormat('es-EC', {
      timeZone: 'America/Guayaquil',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return fechaIso;
  }
};
