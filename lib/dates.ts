export const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  
  export function nombreMes(year: number, month: number) {
    return `${MESES[month - 1]} ${year}`;
  }
  
  export function mesAnterior(year: number, month: number) {
    return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  }
  
  export function mesSiguiente(year: number, month: number) {
    return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  }
  
  export function esMesActual(year: number, month: number) {
    const hoy = new Date();
    return year === hoy.getFullYear() && month === hoy.getMonth() + 1;
  }