interface MetricCardProps {
	title: string;
	value: number;
	subtitle?: string;
	tone?: 'default' | 'blue' | 'amber' | 'emerald';
}

const toneStyles: Record<NonNullable<MetricCardProps['tone']>, React.CSSProperties> = {
	default: { backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-text)' },
	blue:    { backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-text)', borderLeftWidth: 3, borderLeftColor: '#3b82f6' },
	amber:   { backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-text)', borderLeftWidth: 3, borderLeftColor: '#f59e0b' },
	emerald: { backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', color: 'var(--c-text)', borderLeftWidth: 3, borderLeftColor: '#10b981' },
};

const toneAccent: Record<NonNullable<MetricCardProps['tone']>, string> = {
	default: '',
	blue:    'text-blue-500',
	amber:   'text-amber-500',
	emerald: 'text-emerald-500',
};

import React from 'react';

const MetricCard = ({ title, value, subtitle, tone = 'default' }: MetricCardProps) => {
	return (
		<div
			className="h-full rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
			style={toneStyles[tone]}
		>
			<p className="text-sm font-medium" style={{ color: 'var(--c-text-2)' }}>{title}</p>
			<p className={`mt-2 text-4xl font-bold leading-none ${toneAccent[tone]}`}>{value}</p>
			{subtitle && <p className="mt-3 text-sm" style={{ color: 'var(--c-text-3)' }}>{subtitle}</p>}
		</div>
	);
};

export default MetricCard;
