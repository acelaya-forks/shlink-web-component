import { formatNumber } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { ColorBullet } from '../../utils/components/ColorBullet';
import type { DoughnutChartEntry } from './DoughnutChart';

export type DoughnutChartLegendProps = {
  chartData: DoughnutChartEntry[];
  showNumbers: boolean;
};

export const DoughnutChartLegend: FC<DoughnutChartLegendProps> = ({ chartData, showNumbers }) => (
  <ul className="space-y-1">
    {chartData.map(({ name, color, value }, index) => (
      <li key={name} className="flex items-center">
        <ColorBullet color={color} testId={`color-bullet-${index}`} />
        <small className="truncate grow" data-testid={`name-${index}`}>
          {name}
          {showNumbers && <b> ({formatNumber(value)})</b>}
        </small>
      </li>
    ))}
  </ul>
);
