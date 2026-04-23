import { useMemo } from 'react';

export const usePagination = (currentPage: number, totalPages: number) => {
	const pages = useMemo(() => {
		if (totalPages <= 1) {
			return [1];
		}

		const windowSize = 5;
		const half = Math.floor(windowSize / 2);

		let start = Math.max(1, currentPage - half);
		const end = Math.min(totalPages, start + windowSize - 1);

		if (end - start + 1 < windowSize) {
			start = Math.max(1, end - windowSize + 1);
		}

		return Array.from({ length: end - start + 1 }, (_, index) => start + index);
	}, [currentPage, totalPages]);

	return {
		pages,
		hasPrev: currentPage > 1,
		hasNext: currentPage < totalPages,
	};
};
