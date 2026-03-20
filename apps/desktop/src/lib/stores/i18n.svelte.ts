type Locale = 'en' | 'ne';

const translations: Record<Locale, Record<string, string>> = {
	en: {
		// App
		'app.name': 'Mero Restaurant',
		'app.tagline': 'Restaurant Management System',
		'app.connecting': 'Connecting to Mero Restaurant...',

		// Auth
		'auth.signIn': 'Sign in to Mero Restaurant',
		'auth.signInDesc': 'Admin dashboard for restaurant management',
		'auth.signInWorkOS': 'Sign in with WorkOS',
		'auth.devMode': 'Development Mode',
		'auth.selectRole': 'Select role to sign in as',
		'auth.devSignIn': 'Dev Sign In',
		'auth.signOut': 'Sign Out',
		'auth.accessDenied': 'Access Denied',
		'auth.accessDeniedDesc': 'You do not have permission to view this page. Contact your manager for access.',

		// Navigation
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

		// Roles
		'role.owner': 'Owner',
		'role.manager': 'Manager',
		'role.waiter': 'Waiter',
		'role.kitchen': 'Kitchen',
		'role.cashier': 'Cashier',

		// Status
		'status.available': 'Available',
		'status.occupied': 'Occupied',
		'status.reserved': 'Reserved',
		'status.cleaning': 'Cleaning',
		'status.pending': 'Pending',
		'status.confirmed': 'Confirmed',
		'status.preparing': 'Preparing',
		'status.ready': 'Ready',
		'status.served': 'Served',
		'status.completed': 'Completed',
		'status.cancelled': 'Cancelled',
		'status.active': 'Active',
		'status.inactive': 'Inactive',

		// Orders
		'order.new': 'New Order',
		'order.total': 'Total',
		'order.items': 'Items',
		'order.notes': 'Notes',
		'order.markPreparing': 'Start Preparing',
		'order.markReady': 'Mark Ready',
		'order.markServed': 'Mark Served',
		'order.confirm': 'Confirm',
		'order.markAllReady': 'Mark All Ready',
		'order.print': 'Print Ticket',
		'order.noOrders': 'No orders in this queue',
		'order.realtimeQueue': 'Real-time order queue',

		// Tables
		'table.number': 'Table',
		'table.seats': 'Seats',
		'table.floorPlan': 'Floor Plan',
		'table.seatGuests': 'Seat Guests',
		'table.markCleaning': 'Mark Cleaning',
		'table.markAvailable': 'Mark Available',
		'table.currentOrder': 'Current Order',
		'table.noOrder': 'No active order',
		'table.qrCode': 'Table QR Code',
		'table.printQr': 'Print QR Tent',

		// Menu
		'menu.addItem': 'Add Item',
		'menu.editItem': 'Edit Menu Item',
		'menu.addCategory': 'Add Category',
		'menu.editCategory': 'Edit Category',
		'menu.price': 'Price',
		'menu.available': 'Available',
		'menu.unavailable': 'Unavailable',
		'menu.name': 'Name (English)',
		'menu.nameNe': 'Name (नेपाली)',
		'menu.description': 'Description',
		'menu.category': 'Category',
		'menu.vegetarian': 'Vegetarian',
		'menu.image': 'Image',

		// Staff
		'staff.invite': 'Invite Staff',
		'staff.role': 'Role',
		'staff.fullName': 'Full Name',
		'staff.email': 'Email',
		'staff.phone': 'Phone',
		'staff.deactivate': 'Deactivate',
		'staff.activate': 'Activate',
		'staff.confirmDeactivate': 'Deactivate Staff Member',
		'staff.confirmActivate': 'Activate Staff Member',

		// WiFi
		'wifi.ssid': 'Network Name (SSID)',
		'wifi.password': 'Password',
		'wifi.update': 'Update WiFi',
		'wifi.settings': 'WiFi Settings',
		'wifi.customerQr': 'Customer WiFi QR',
		'wifi.printQr': 'Print QR Code',
		'wifi.lastUpdated': 'Last updated',
		'wifi.saved': 'WiFi config updated! QR codes now reflect the new credentials.',

		// Analytics
		'analytics.revenue': 'Revenue',
		'analytics.orders': 'Orders',
		'analytics.popular': 'Popular Items',
		'analytics.today': 'Today',
		'analytics.thisWeek': 'This Week',
		'analytics.thisMonth': 'This Month',
		'analytics.avgOrderValue': 'Avg Order Value',
		'analytics.avgPrepTime': 'Avg Prep Time',
		'analytics.ordersByHour': 'Orders by Hour',
		'analytics.paymentMethods': 'Payment Methods',

		// Fonepay
		'fonepay.title': 'Fonepay QR Payment',
		'fonepay.generate': 'Generate Payment QR',
		'fonepay.amount': 'Amount',
		'fonepay.enterAmount': 'Enter Amount',
		'fonepay.newPayment': 'New Payment',
		'fonepay.confirmReceived': 'Confirm Received',
		'fonepay.paymentReceived': 'Payment Received!',
		'fonepay.recentPayments': 'Recent Fonepay Payments',
		'fonepay.quickAmounts': 'Quick amounts',
		'fonepay.merchantId': 'Merchant ID',
		'fonepay.qrReady': 'Payment QR Ready',
		'fonepay.scanInstruction': 'Show this QR to the customer to scan with their Fonepay-enabled banking app',
		'fonepay.todayTotal': "Today's Fonepay Total",
		'fonepay.waitingPayment': 'Waiting for payment...',

		// Dashboard
		'dashboard.welcome': 'Welcome back to Mero Restaurant, Surkhet',
		'dashboard.activeOrders': 'Active Orders',
		'dashboard.todayRevenue': "Today's Revenue",
		'dashboard.availableTables': 'Available Tables',
		'dashboard.activeStaff': 'Active Staff',
		'dashboard.recentOrders': 'Recent Orders',
		'dashboard.viewAll': 'View all',
		'dashboard.kitchenStatus': 'Kitchen Status',
		'dashboard.tableOverview': 'Table Overview',

		// Urgency
		'urgency.normal': 'On time',
		'urgency.warning': 'Getting late',
		'urgency.urgent': 'Urgent!',

		// Spicy
		'menu.spicy': 'Spicy',

		// Error
		'error.title': 'Something went wrong',
		'error.description': 'An unexpected error occurred. Please try again.',
		'error.retry': 'Try Again',

		// Table actions
		'table.addTable': 'Add Table',
		'table.generateQr': 'Generate QR',
		'table.allTables': 'All Tables',
		'table.dragHint': 'Click to select table',

		// Staff management
		'staff.management': 'Staff Management',
		'staff.addStaff': 'Add Staff',
		'staff.noStaff': 'No staff found',
		'staff.joined': 'Joined',
		'staff.searchPlaceholder': 'Search staff by name or email...',
		'staff.confirmToggleDesc': 'will no longer be able to access the system. You can reactivate them later.',
		'staff.confirmActivateDesc': 'will regain access to the system.',

		// WiFi extra
		'wifi.encryption': 'Encryption',
		'wifi.saveChanges': 'Save Changes',
		'wifi.editSettings': 'Edit',
		'wifi.scanToConnect': 'Customers scan this QR to auto-connect to WiFi',

		// Orders extra
		'order.orderQueue': 'Order Queue',
		'order.allActive': 'All Active',
		'order.active': 'active',
		'order.takeaway': 'Takeaway',
		'order.dineIn': 'Dine-in',
		'order.note': 'Note',

		// Common
		'common.save': 'Save',
		'common.cancel': 'Cancel',
		'common.delete': 'Delete',
		'common.confirm': 'Confirm',
		'common.edit': 'Edit',
		'common.search': 'Search',
		'common.filter': 'Filter',
		'common.loading': 'Loading...',
		'common.noData': 'No data available',
		'common.close': 'Close',
		'common.print': 'Print',
		'common.reset': 'Reset',
		'common.all': 'All',
		'common.error': 'Error',
		'common.success': 'Success',

		// Theme
		'theme.light': 'Light Mode',
		'theme.dark': 'Dark Mode',

		// Keyboard
		'keyboard.shortcuts': 'Keyboard Shortcuts',
		'keyboard.kitchen': 'Ctrl+K — Kitchen',
		'keyboard.tables': 'Ctrl+T — Tables',
		'keyboard.menu': 'Ctrl+M — Menu'
	},
	ne: {
		// App
		'app.name': 'मेरो रेस्टुरेन्ट',
		'app.tagline': 'रेस्टुरेन्ट व्यवस्थापन प्रणाली',
		'app.connecting': 'मेरो रेस्टुरेन्ट जडान हुँदैछ...',

		// Auth
		'auth.signIn': 'मेरो रेस्टुरेन्टमा साइन इन',
		'auth.signInDesc': 'रेस्टुरेन्ट व्यवस्थापनको लागि एडमिन ड्यासबोर्ड',
		'auth.signInWorkOS': 'WorkOS मार्फत साइन इन',
		'auth.devMode': 'विकास मोड',
		'auth.selectRole': 'साइन इन गर्न भूमिका छान्नुहोस्',
		'auth.devSignIn': 'विकास साइन इन',
		'auth.signOut': 'साइन आउट',
		'auth.accessDenied': 'पहुँच अस्वीकृत',
		'auth.accessDeniedDesc': 'तपाईंसँग यो पृष्ठ हेर्ने अनुमति छैन। पहुँचको लागि आफ्नो व्यवस्थापकलाई सम्पर्क गर्नुहोस्।',

		// Navigation
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

		// Roles
		'role.owner': 'मालिक',
		'role.manager': 'व्यवस्थापक',
		'role.waiter': 'वेटर',
		'role.kitchen': 'भान्से',
		'role.cashier': 'क्यासियर',

		// Status
		'status.available': 'उपलब्ध',
		'status.occupied': 'व्यस्त',
		'status.reserved': 'आरक्षित',
		'status.cleaning': 'सफाइ',
		'status.pending': 'पर्खिरहेको',
		'status.confirmed': 'पुष्टि भएको',
		'status.preparing': 'तयारी हुँदै',
		'status.ready': 'तयार',
		'status.served': 'सर्भ भएको',
		'status.completed': 'पूरा भएको',
		'status.cancelled': 'रद्द',
		'status.active': 'सक्रिय',
		'status.inactive': 'निष्क्रिय',

		// Orders
		'order.new': 'नयाँ अर्डर',
		'order.total': 'जम्मा',
		'order.items': 'सामानहरू',
		'order.notes': 'नोटहरू',
		'order.markPreparing': 'तयारी सुरु',
		'order.markReady': 'तयार चिन्ह',
		'order.markServed': 'सर्भ चिन्ह',
		'order.confirm': 'पुष्टि',
		'order.markAllReady': 'सबै तयार चिन्ह',
		'order.print': 'टिकट छाप्नुहोस्',
		'order.noOrders': 'यो कतारमा अर्डर छैन',
		'order.realtimeQueue': 'वास्तविक-समय अर्डर कतार',

		// Tables
		'table.number': 'टेबल',
		'table.seats': 'सिटहरू',
		'table.floorPlan': 'फ्लोर प्लान',
		'table.seatGuests': 'अतिथि बसाउनुहोस्',
		'table.markCleaning': 'सफाइ चिन्ह',
		'table.markAvailable': 'उपलब्ध चिन्ह',
		'table.currentOrder': 'हालको अर्डर',
		'table.noOrder': 'सक्रिय अर्डर छैन',
		'table.qrCode': 'टेबल QR कोड',
		'table.printQr': 'QR टेन्ट छाप्नुहोस्',

		// Menu
		'menu.addItem': 'आइटम थप्नुहोस्',
		'menu.editItem': 'मेनु आइटम सम्पादन',
		'menu.addCategory': 'श्रेणी थप्नुहोस्',
		'menu.editCategory': 'श्रेणी सम्पादन',
		'menu.price': 'मूल्य',
		'menu.available': 'उपलब्ध',
		'menu.unavailable': 'अनुपलब्ध',
		'menu.name': 'नाम (अंग्रेजी)',
		'menu.nameNe': 'नाम (नेपाली)',
		'menu.description': 'विवरण',
		'menu.category': 'श्रेणी',
		'menu.vegetarian': 'शाकाहारी',
		'menu.image': 'तस्विर',

		// Staff
		'staff.invite': 'कर्मचारी निमन्त्रणा',
		'staff.role': 'भूमिका',
		'staff.fullName': 'पूरा नाम',
		'staff.email': 'इमेल',
		'staff.phone': 'फोन',
		'staff.deactivate': 'निष्क्रिय गर्नुहोस्',
		'staff.activate': 'सक्रिय गर्नुहोस्',
		'staff.confirmDeactivate': 'कर्मचारी निष्क्रिय गर्नुहोस्',
		'staff.confirmActivate': 'कर्मचारी सक्रिय गर्नुहोस्',

		// WiFi
		'wifi.ssid': 'नेटवर्क नाम (SSID)',
		'wifi.password': 'पासवर्ड',
		'wifi.update': 'वाइफाइ अपडेट',
		'wifi.settings': 'वाइफाइ सेटिङ',
		'wifi.customerQr': 'ग्राहक वाइफाइ QR',
		'wifi.printQr': 'QR कोड छाप्नुहोस्',
		'wifi.lastUpdated': 'अन्तिम अपडेट',
		'wifi.saved': 'वाइफाइ सेटिङ अपडेट भयो! QR कोडहरूमा अब नयाँ प्रमाणपत्र देखिनेछ।',

		// Analytics
		'analytics.revenue': 'आम्दानी',
		'analytics.orders': 'अर्डरहरू',
		'analytics.popular': 'लोकप्रिय आइटमहरू',
		'analytics.today': 'आज',
		'analytics.thisWeek': 'यो हप्ता',
		'analytics.thisMonth': 'यो महिना',
		'analytics.avgOrderValue': 'औसत अर्डर मूल्य',
		'analytics.avgPrepTime': 'औसत तयारी समय',
		'analytics.ordersByHour': 'घण्टा अनुसार अर्डर',
		'analytics.paymentMethods': 'भुक्तानी विधिहरू',

		// Fonepay
		'fonepay.title': 'फोनपे QR भुक्तानी',
		'fonepay.generate': 'भुक्तानी QR बनाउनुहोस्',
		'fonepay.amount': 'रकम',
		'fonepay.enterAmount': 'रकम प्रविष्ट गर्नुहोस्',
		'fonepay.newPayment': 'नयाँ भुक्तानी',
		'fonepay.confirmReceived': 'प्राप्त पुष्टि',
		'fonepay.paymentReceived': 'भुक्तानी प्राप्त भयो!',
		'fonepay.recentPayments': 'हालका फोनपे भुक्तानीहरू',
		'fonepay.quickAmounts': 'छिटो रकम',
		'fonepay.merchantId': 'व्यापारी आईडी',
		'fonepay.qrReady': 'भुक्तानी QR तयार',
		'fonepay.scanInstruction': 'ग्राहकलाई यो QR उनीहरूको फोनपे-सक्षम बैंकिङ एपबाट स्क्यान गर्न देखाउनुहोस्',
		'fonepay.todayTotal': 'आजको फोनपे जम्मा',
		'fonepay.waitingPayment': 'भुक्तानीको पर्खाइमा...',

		// Dashboard
		'dashboard.welcome': 'मेरो रेस्टुरेन्ट, सुर्खेतमा फेरि स्वागत छ',
		'dashboard.activeOrders': 'सक्रिय अर्डरहरू',
		'dashboard.todayRevenue': 'आजको आम्दानी',
		'dashboard.availableTables': 'उपलब्ध टेबलहरू',
		'dashboard.activeStaff': 'सक्रिय कर्मचारी',
		'dashboard.recentOrders': 'हालका अर्डरहरू',
		'dashboard.viewAll': 'सबै हेर्नुहोस्',
		'dashboard.kitchenStatus': 'भान्सा स्थिति',
		'dashboard.tableOverview': 'टेबल अवलोकन',

		// Urgency
		'urgency.normal': 'समयमा',
		'urgency.warning': 'ढिलो हुँदैछ',
		'urgency.urgent': 'अत्यावश्यक!',

		// Spicy
		'menu.spicy': 'पिरो',

		// Error
		'error.title': 'केही गलत भयो',
		'error.description': 'एक अनपेक्षित त्रुटि भयो। कृपया फेरि प्रयास गर्नुहोस्।',
		'error.retry': 'फेरि प्रयास गर्नुहोस्',

		// Table actions
		'table.addTable': 'टेबल थप्नुहोस्',
		'table.generateQr': 'QR बनाउनुहोस्',
		'table.allTables': 'सबै टेबलहरू',
		'table.dragHint': 'टेबल छान्न क्लिक गर्नुहोस्',

		// Staff management
		'staff.management': 'कर्मचारी व्यवस्थापन',
		'staff.addStaff': 'कर्मचारी थप्नुहोस्',
		'staff.noStaff': 'कर्मचारी भेटिएन',
		'staff.joined': 'सामेल भएको',
		'staff.searchPlaceholder': 'नाम वा इमेलबाट कर्मचारी खोज्नुहोस्...',
		'staff.confirmToggleDesc': 'अब प्रणालीमा पहुँच गर्न सक्नेछैन। तपाईं पछि पुन: सक्रिय गर्न सक्नुहुन्छ।',
		'staff.confirmActivateDesc': 'प्रणालीमा पुन: पहुँच पाउनेछ।',

		// WiFi extra
		'wifi.encryption': 'एन्क्रिप्सन',
		'wifi.saveChanges': 'परिवर्तन सेभ गर्नुहोस्',
		'wifi.editSettings': 'सम्पादन',
		'wifi.scanToConnect': 'ग्राहकहरूले यो QR स्क्यान गरेर वाइफाइ जडान हुन सक्छन्',

		// Orders extra
		'order.orderQueue': 'अर्डर कतार',
		'order.allActive': 'सबै सक्रिय',
		'order.active': 'सक्रिय',
		'order.takeaway': 'टेकअवे',
		'order.dineIn': 'डाइन-इन',
		'order.note': 'नोट',

		// Common
		'common.save': 'सेभ गर्नुहोस्',
		'common.cancel': 'रद्द गर्नुहोस्',
		'common.delete': 'मेटाउनुहोस्',
		'common.confirm': 'पुष्टि गर्नुहोस्',
		'common.edit': 'सम्पादन',
		'common.search': 'खोज्नुहोस्',
		'common.filter': 'फिल्टर',
		'common.loading': 'लोड हुँदैछ...',
		'common.noData': 'डाटा उपलब्ध छैन',
		'common.close': 'बन्द गर्नुहोस्',
		'common.print': 'छाप्नुहोस्',
		'common.reset': 'रिसेट',
		'common.all': 'सबै',
		'common.error': 'त्रुटि',
		'common.success': 'सफल',

		// Theme
		'theme.light': 'उज्यालो मोड',
		'theme.dark': 'अँध्यारो मोड',

		// Keyboard
		'keyboard.shortcuts': 'किबोर्ड सर्टकटहरू',
		'keyboard.kitchen': 'Ctrl+K — भान्सा',
		'keyboard.tables': 'Ctrl+T — टेबलहरू',
		'keyboard.menu': 'Ctrl+M — मेनु'
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
