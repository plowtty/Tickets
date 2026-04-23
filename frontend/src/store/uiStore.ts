import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';
export type Language = 'es' | 'en';

type UiState = {
	theme: Theme;
	language: Language;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
	setLanguage: (language: Language) => void;
};

export const useUiStore = create<UiState>()(
	persist(
		(set, get) => ({
			theme: 'light',
			language: 'es',
			setTheme(theme) {
				set({ theme });
			},
			toggleTheme() {
				set({ theme: get().theme === 'light' ? 'dark' : 'light' });
			},
			setLanguage(language) {
				set({ language });
			},
		}),
		{
			name: 'tickets-ui-preferences',
			version: 2,
			migrate(persisted: unknown) {
				const s = persisted as { theme?: string; language?: string };
				return {
					theme: s.theme === 'dark' ? 'dark' : 'light',
					language: s.language === 'en' ? 'en' : 'es',
				};
			},
			partialize: (state) => ({
				theme: state.theme,
				language: state.language,
			}),
		}
	)
);
