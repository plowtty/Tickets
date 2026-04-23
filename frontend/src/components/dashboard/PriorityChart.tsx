import { PriorityMetric } from '../../types';
import { useI18n } from '../../hooks/useI18n';

interface PriorityChartProps {
	items: PriorityMetric[];
}

const labelMap: Record<string, string> = {
	LOW: 'Baja',
	MEDIUM: 'Media',
	HIGH: 'Alta',
	CRITICAL: 'Crítica',
};

const colorMap: Record<string, string> = {
	LOW: 'bg-slate-500',
	MEDIUM: 'bg-indigo-500',
	HIGH: 'bg-orange-500',
	CRITICAL: 'bg-red-500',
};

const PriorityChart = ({ items }: PriorityChartProps) => {
	const { t } = useI18n();
	const max = Math.max(...items.map((item) => item.count), 1);

	return (
		<div className="panel-card">
			<h3 className="panel-title">{t('dashboard.byPriority')}</h3>
			<div className="mt-4 space-y-4">
				{items.map((item) => (
					<div key={item.priority}>
						<div className="mb-1 flex items-center justify-between text-sm text-slate-700 dark:text-slate-200">
							<span>{labelMap[item.priority]}</span>
							<span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{item.count}</span>
						</div>
						<div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700">
							<div
								className={`h-2.5 rounded-full ${colorMap[item.priority]}`}
								style={{ width: `${(item.count / max) * 100}%` }}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default PriorityChart;
