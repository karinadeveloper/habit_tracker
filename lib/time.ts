// Timestamp UTC para updated_at/created_at (comparaciones de sincronización).
// SIEMPRE UTC: es lo que compara last-write-wins.
export function ahoraUTC(): string {
  return new Date().toISOString();
}

// Fecha local del usuario en formato YYYY-MM-DD, para la columna `day`.
// Usa la fecha del calendario local, NO UTC, porque "¿lo hice hoy?"
// se responde según el día del usuario.
export function fechaLocal(fecha: Date = new Date()): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}