import { ResultsData, GrandTour } from '@/app/(api)/types';

export const spoof_data: ResultsData = {
  grand_tour: GrandTour.TOUR,
  stage_no: 1,
  stage_start: 'Lille',
  stage_end: 'Roubaix',
  stage_length: 196.5,
  stage_results: [
    { rank: 1, name: 'Mark Cavendish' },
    { rank: 2, name: 'Geraint Thomas' },
    { rank: 3, name: 'Peter Sagan' },
  ],
  gc_results: [
    { rank: 1, name: 'Tadej Pogacar' },
    { rank: 2, name: 'Jonas Vingegaard' },
    { rank: 3, name: 'Romain Bardet' },
  ],
  points_results: [
    { rank: 1, name: 'Tadej Pogacar' },
    { rank: 2, name: 'Jonas Vingegaard' },
    { rank: 3, name: 'Romain Bardet' },
  ],
  mountains_results: [
    { rank: 1, name: 'Tadej Pogacar' },
    { rank: 2, name: 'Jonas Vingegaard' },
    { rank: 3, name: 'Romain Bardet' },
  ],
  youth_results: [
    { rank: 1, name: 'Tadej Pogacar' },
    { rank: 2, name: 'Jonas Vingegaard' },
    { rank: 3, name: 'Romain Bardet' },
  ],
};
