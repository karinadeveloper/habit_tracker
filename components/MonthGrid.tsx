import { memo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { Item } from '../lib/database.types';

const CELL = 34;
const GAP = 4;
const LEFT_COL = 130;
const HEADER_H = 28;

type CeldaProps = {
  itemId: string;
  day: string;
  checked: boolean;
  onToggle: (itemId: string, day: string) => void;
};

const Celda = memo(function Celda({ itemId, day, checked, onToggle }: CeldaProps) {
  return (
    <Pressable
      onPress={() => onToggle(itemId, day)}
      style={{ width: CELL, height: CELL, marginRight: GAP }}
      className={`rounded-md items-center justify-center active:opacity-60 ${
        checked ? 'bg-white/80' : 'bg-white/15'
      }`}
    >
      {checked && <Text className="text-noche-fondo font-bold text-xs">✓</Text>}
    </Pressable>
  );
});

type Props = {
  items: Item[];
  year: number;
  month: number;
  isChecked: (itemId: string, day: string) => boolean;
  onToggle: (itemId: string, day: string) => void;
};

function MonthGridBase({ items, year, month, isChecked, onToggle }: Props) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const dayKey = (d: number) =>
    `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const weekday = (d: number) =>
    ['D', 'L', 'M', 'M', 'J', 'V', 'S'][new Date(year, month - 1, d).getDay()];

  return (
    <ScrollView className="flex-1">
      <View className="flex-row">
        <View style={{ width: LEFT_COL }}>
          <View style={{ height: HEADER_H }} />
          {items.map((item) => (
            <View
              key={item.id}
              style={{ height: CELL, marginBottom: GAP }}
              className="justify-center pr-2"
            >
              <Text className="text-white text-xs" numberOfLines={1}>
                {item.title}
              </Text>
            </View>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View className="flex-row" style={{ height: HEADER_H }}>
              {days.map((d) => (
                <View
                  key={d}
                  style={{ width: CELL, marginRight: GAP }}
                  className="items-center"
                >
                  <Text className="text-noche-acento" style={{ fontSize: 9 }}>
                    {weekday(d)}
                  </Text>
                  <Text className="text-noche-acento" style={{ fontSize: 10 }}>
                    {d}
                  </Text>
                </View>
              ))}
            </View>

            {items.map((item) => (
              <View key={item.id} className="flex-row" style={{ marginBottom: GAP }}>
                {days.map((d) => {
                  const key = dayKey(d);
                  return (
                    <Celda
                      key={d}
                      itemId={item.id}
                      day={key}
                      checked={isChecked(item.id, key)}
                      onToggle={onToggle}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

export const MonthGrid = memo(MonthGridBase);