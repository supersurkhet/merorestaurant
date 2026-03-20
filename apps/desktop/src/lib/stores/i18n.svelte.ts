type Locale = 'en' | 'ne';

const translations: Record<Locale, Record<string, string>> = {
	en: {
		'app.name': 'Mero Restaurant',
		'app.tagline': 'Restaurant Management System',
		'nav.dashboard': 'Dashboard',
		'nav.kitchen': 'Kitchen Display',
		'nav.tables': 'Tables',
		'nav.menu': 'Menu Management',
		'nav.orders': 'Orders',
		'nav.staff': 'Staff',
		'nav.wifi': 'WiFi Config',
		'nav.fonepay': 'Fonepay QR',
		'nav.analytics': 'Analytics',
		'nav.settings': 'Settings',
		'status.available': 'Available',
		'status.occupied': 'Occupied',
		'status.reserved': 'Reserved',
		'status.cleaning': 'Cleaning',
		'status.pending': 'Pending',
		'status.confirmed': 'Confirmed',
		'status.preparing': 'Preparing',
		'status.ready': 'Ready',
		'status.served': 'Served',
		'status.cancelled': 'Cancelled',
		'order.new': 'New Order',
		'order.total': 'Total',
		'order.items': 'Items',
		'order.notes': 'Notes',
		'order.markPreparing': 'Start Preparing',
		'order.markReady': 'Mark Ready',
		'order.markServed': 'Mark Served',
		'table.number': 'Table',
		'table.seats': 'Seats',
		'menu.addItem': 'Add Item',
		'menu.addCategory': 'Add Category',
		'menu.price': 'Price',
		'menu.available': 'Available',
		'menu.unavailable': 'Unavailable',
		'staff.invite': 'Invite Staff',
		'staff.role': 'Role',
		'wifi.ssid': 'Network Name (SSID)',
		'wifi.password': 'Password',
		'wifi.update': 'Update WiFi',
		'analytics.revenue': 'Revenue',
		'analytics.orders': 'Orders',
		'analytics.popular': 'Popular Items',
		'analytics.today': 'Today',
		'common.save': 'Save',
		'common.cancel': 'Cancel',
		'common.delete': 'Delete',
		'common.edit': 'Edit',
		'common.search': 'Search',
		'common.filter': 'Filter',
		'common.loading': 'Loading...',
		'common.noData': 'No data available'
	},
	ne: {
		'app.name': 'मेरो रेस्टुरेन्ट',
		'app.tagline': 'रेस्टुरेन्ट व्यवस्थापन प्रणाली',
		'nav.dashboard': 'ड्यासबोर्ड',
		'nav.kitchen': 'भान्सा प्रदर्शन',
		'nav.tables': 'टेबलहरू',
		'nav.menu': 'मेनु व्यवस्थापन',
		'nav.orders': 'अर्डरहरू',
		'nav.staff': 'कर्मचारी',
		'nav.wifi': 'वाइफाइ सेटिङ',
		'nav.fonepay': 'फोनपे QR',
		'nav.analytics': 'विश्लेषण',
		'nav.settings': 'सेटिङ',
		'status.available': 'उपलब्ध',
		'status.occupied': 'व्यस्त',
		'status.reserved': 'आरक्षित',
		'status.cleaning': 'सफाइ',
		'status.pending': 'पर्खिरहेको',
		'status.confirmed': 'पुष्टि भएको',
		'status.preparing': 'तयारी हुँदै',
		'status.ready': 'तयार',
		'status.served': 'सर्भ भएको',
		'status.cancelled': 'रद्द',
		'order.new': 'नयाँ अर्डर',
		'order.total': 'जम्मा',
		'order.items': 'सामानहरू',
		'order.notes': 'नोटहरू',
		'order.markPreparing': 'तयारी सुरु',
		'order.markReady': 'तयार चिन्ह',
		'order.markServed': 'सर्भ चिन्ह',
		'table.number': 'टेबल',
		'table.seats': 'सिटहरू',
		'menu.addItem': 'आइटम थप्नुहोस्',
		'menu.addCategory': 'श्रेणी थप्नुहोस्',
		'menu.price': 'मूल्य',
		'menu.available': 'उपलब्ध',
		'menu.unavailable': 'अनुपलब्ध',
		'staff.invite': 'कर्मचारी निमन्त्रणा',
		'staff.role': 'भूमिका',
		'wifi.ssid': 'नेटवर्क नाम (SSID)',
		'wifi.password': 'पासवर्ड',
		'wifi.update': 'वाइफाइ अपडेट',
		'analytics.revenue': 'आम्दानी',
		'analytics.orders': 'अर्डरहरू',
		'analytics.popular': 'लोकप्रिय आइटमहरू',
		'analytics.today': 'आज',
		'common.save': 'सेभ गर्नुहोस्',
		'common.cancel': 'रद्द गर्नुहोस्',
		'common.delete': 'मेटाउनुहोस्',
		'common.edit': 'सम्पादन',
		'common.search': 'खोज्नुहोस्',
		'common.filter': 'फिल्टर',
		'common.loading': 'लोड हुँदैछ...',
		'common.noData': 'डाटा उपलब्ध छैन'
	}
};

let currentLocale = $state<Locale>(
	(typeof window !== 'undefined' ? (localStorage.getItem('locale') as Locale) : null) ?? 'en'
);

export function getI18n() {
	return {
		get locale() {
			return currentLocale;
		},
		t(key: string): string {
			return translations[currentLocale][key] ?? key;
		},
		setLocale(locale: Locale) {
			currentLocale = locale;
			if (typeof window !== 'undefined') {
				localStorage.setItem('locale', locale);
			}
		},
		toggleLocale() {
			const next = currentLocale === 'en' ? 'ne' : 'en';
			currentLocale = next;
			if (typeof window !== 'undefined') {
				localStorage.setItem('locale', next);
			}
		}
	};
}
