import { useMemo } from 'react';
import type { CheckIn, Item } from '../lib/database.types';

export function useStats(
  items: Item[],
  checkIns: CheckIn[],
  year: number,
  month: number
) {
  return useMemo(() => {
    const diasDelMes = new Date(year, month, 0).getDate();
    const hechos = checkIns.filter((c) => c.done && !c.deleted_at);

    const metaTotal = items.reduce(
      (sum, i) => sum + (i.goal ?? diasDelMes),
      0
    );
    const completados = hechos.length;
    const restantes = Math.max(metaTotal - completados, 0);
    const porcentaje = metaTotal > 0
      ? Math.round((completados / metaTotal) * 100)
      : 0;

    const porItem = items.map((item) => {
      const actual = hechos.filter((c) => c.item_id === item.id).length;
      const meta = item.goal ?? diasDelMes;
      return {
        id: item.id,
        title: item.title,
        meta,
        actual,
        restante: Math.max(meta - actual, 0),
        porcentaje: meta > 0 ? Math.round((actual / meta) * 100) : 0,
      };
    });

    const porDia = Array.from({ length: diasDelMes }, (_, i) => {
      const dia = i + 1;
      const key = `${year}-${String(month).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const total = hechos.filter((c) => c.day === key).length;
      return {
        dia,
        total,
        porcentaje: items.length > 0
          ? Math.round((total / items.length) * 100)
          : 0,
      };
    });

    const rachaActual = (() => {
        const hoy = new Date();
        const esMesEnCurso =
          year === hoy.getFullYear() && month === hoy.getMonth() + 1;
        const desde = esMesEnCurso ? hoy.getDate() : diasDelMes;
  
        let racha = 0;
        for (let d = desde; d >= 1; d--) {
          if (porDia[d - 1].total > 0) racha++;
          else break;
        }
        return racha;
      })();

    return { metaTotal, completados, restantes, porcentaje, porItem, porDia, rachaActual };
  }, [items, checkIns, year, month]);
}