export type BackgroundKey = 'noche' | 'playa' | 'salvia';

export type BackgroundConfig = {
  label: string;
  source: any;
  overlay: string;
  acento: string;
};

export const BACKGROUNDS: { [K in BackgroundKey]: BackgroundConfig } = {
  noche: {
    label: 'Noche estrellada',
    source: require('../assets/backgrounds/noche.jpg'),
    overlay: 'rgba(10,16,34,0.72)',
    acento: '#7C93C3',
  },
  playa: {
    label: 'Playa',
    source: require('../assets/backgrounds/playa.jpg'),
    overlay: 'rgba(12,32,44,0.68)',
    acento: '#8ECAD1',
  },
  salvia: {
    label: 'Verde salvia',
    source: require('../assets/backgrounds/salvia.jpg'),
    overlay: 'rgba(28,38,30,0.72)',
    acento: '#A3B18A',
  },
};