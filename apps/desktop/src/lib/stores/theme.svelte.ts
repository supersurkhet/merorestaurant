let darkMode = $state(
	typeof window !== 'undefined'
		? localStorage.getItem('theme') === 'dark' ||
			(!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
		: false
);

export function getTheme() {
	return {
		get isDark() {
			return darkMode;
		},
		toggle() {
			darkMode = !darkMode;
			if (typeof window !== 'undefined') {
				localStorage.setItem('theme', darkMode ? 'dark' : 'light');
				document.documentElement.classList.toggle('dark', darkMode);
			}
		},
		init() {
			if (typeof window !== 'undefined') {
				document.documentElement.classList.toggle('dark', darkMode);
			}
		}
	};
}
