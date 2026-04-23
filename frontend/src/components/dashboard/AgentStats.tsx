import { AgentDashboardStat } from '../../types';
import { useI18n } from '../../hooks/useI18n';

interface AgentStatsProps {
	items: AgentDashboardStat[];
}

const AgentStats = ({ items }: AgentStatsProps) => {
	const { t } = useI18n();
	return (
		<div className="panel-card">
			<h3 className="panel-title">{t('dashboard.agentMetrics')}</h3>
			<div className="mt-4 overflow-x-auto">
				<table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
					<thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
						<tr>
							<th className="px-3 py-2">Agente</th>
							<th className="px-3 py-2">Asignados</th>
							<th className="px-3 py-2">Abiertos</th>
							<th className="px-3 py-2">En progreso</th>
							<th className="px-3 py-2">Resueltos</th>
							<th className="px-3 py-2">Cerrados</th>
							<th className="px-3 py-2">Críticos</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200 dark:divide-slate-800">
						{items.length === 0 ? (
							<tr>
								<td className="px-3 py-4 text-slate-500 dark:text-slate-400" colSpan={7}>
									No hay agentes activos.
								</td>
							</tr>
						) : (
							items.map((agent) => (
								<tr key={agent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
									<td className="px-3 py-2">
										<p className="font-medium text-slate-900 dark:text-slate-100">{agent.name}</p>
										<p className="text-xs text-slate-500 dark:text-slate-400">{agent.email}</p>
									</td>
									<td className="px-3 py-2">{agent.totalAssigned}</td>
									<td className="px-3 py-2">{agent.open}</td>
									<td className="px-3 py-2">{agent.inProgress}</td>
									<td className="px-3 py-2">{agent.resolved}</td>
									<td className="px-3 py-2">{agent.closed}</td>
									<td className="px-3 py-2">{agent.critical}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default AgentStats;
