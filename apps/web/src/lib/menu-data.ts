export interface MenuItem {
	id: string;
	name: string;
	nameNe: string;
	description: string;
	descriptionNe: string;
	price: number;
	category: string;
	image?: string;
	popular?: boolean;
	vegetarian?: boolean;
	spicy?: boolean;
}

export interface MenuCategory {
	id: string;
	name: string;
	nameNe: string;
}

export const categories: MenuCategory[] = [
	{ id: 'appetizers', name: 'Appetizers', nameNe: 'स्न्याक्स' },
	{ id: 'mains', name: 'Main Course', nameNe: 'मुख्य खाना' },
	{ id: 'drinks', name: 'Drinks', nameNe: 'पेय पदार्थ' },
	{ id: 'desserts', name: 'Desserts', nameNe: 'मिठाई' }
];

export const menuItems: MenuItem[] = [
	{
		id: 'momo-chicken',
		name: 'Chicken Momo',
		nameNe: 'चिकन मोमो',
		description: 'Steamed dumplings filled with spiced chicken, served with tomato achar',
		descriptionNe: 'मसलेदार चिकनले भरिएका भाप मोमो, टमाटर अचारसँग',
		price: 250,
		category: 'appetizers',
		popular: true,
		spicy: true
	},
	{
		id: 'momo-veg',
		name: 'Vegetable Momo',
		nameNe: 'तरकारी मोमो',
		description: 'Steamed dumplings with mixed vegetables and paneer',
		descriptionNe: 'मिश्रित तरकारी र पनीरको भाप मोमो',
		price: 200,
		category: 'appetizers',
		vegetarian: true,
		popular: true
	},
	{
		id: 'choila',
		name: 'Newari Choila',
		nameNe: 'नेवारी छोइला',
		description: 'Spicy grilled buffalo meat marinated in Nepali spices',
		descriptionNe: 'नेपाली मसलामा मरिनेट गरिएको पिरो ग्रिल गरिएको बफ',
		price: 350,
		category: 'appetizers',
		spicy: true
	},
	{
		id: 'chatamari',
		name: 'Chatamari',
		nameNe: 'चतामरी',
		description: 'Newari rice crepe topped with minced meat and egg',
		descriptionNe: 'कीमा र अण्डाले भरिएको नेवारी चामलको क्रेप',
		price: 280,
		category: 'appetizers',
		popular: true
	},
	{
		id: 'dal-bhat',
		name: 'Dal Bhat Tarkari',
		nameNe: 'दालभात तरकारी',
		description: 'Traditional Nepali meal — lentil soup, steamed rice, seasonal vegetables, pickle & papad',
		descriptionNe: 'परम्परागत नेपाली खाना — दाल, भात, मौसमी तरकारी, अचार र पापड',
		price: 400,
		category: 'mains',
		popular: true,
		vegetarian: true
	},
	{
		id: 'thakali',
		name: 'Thakali Set',
		nameNe: 'थकाली सेट',
		description: 'Complete Thakali meal with dal, rice, meat curry, gundruk, and sides',
		descriptionNe: 'दाल, भात, मासु, गुन्द्रुक र साइड सहित पूर्ण थकाली खाना',
		price: 550,
		category: 'mains',
		popular: true
	},
	{
		id: 'sekuwa',
		name: 'Sekuwa',
		nameNe: 'सेकुवा',
		description: 'Smoky grilled meat skewers marinated in traditional spices',
		descriptionNe: 'परम्परागत मसलामा मरिनेट गरिएको धुँवादार ग्रिल मासु',
		price: 450,
		category: 'mains',
		spicy: true
	},
	{
		id: 'gorkhali-lamb',
		name: 'Gorkhali Lamb Curry',
		nameNe: 'गोरखाली खसीको मासु',
		description: 'Slow-cooked lamb in rich, aromatic Gorkhali spice blend',
		descriptionNe: 'गोरखाली मसलामा ढिलो पकाइएको खसीको मासु',
		price: 600,
		category: 'mains',
		spicy: true
	},
	{
		id: 'chiya',
		name: 'Nepali Chiya',
		nameNe: 'नेपाली चिया',
		description: 'Traditional Nepali milk tea with cardamom and ginger',
		descriptionNe: 'अलैँची र अदुवा सहित परम्परागत नेपाली दूध चिया',
		price: 60,
		category: 'drinks',
		popular: true,
		vegetarian: true
	},
	{
		id: 'lassi',
		name: 'Mango Lassi',
		nameNe: 'आँपको लस्सी',
		description: 'Creamy yogurt drink blended with fresh mango',
		descriptionNe: 'ताजा आँपसँग मिसाइएको क्रिमी दही पेय',
		price: 150,
		category: 'drinks',
		vegetarian: true
	},
	{
		id: 'tongba',
		name: 'Tongba',
		nameNe: 'तोङ्बा',
		description: 'Traditional millet beer served in a wooden pot — a Himalayan classic',
		descriptionNe: 'काठको भाँडोमा सर्भ गरिएको परम्परागत कोदो जाँड',
		price: 300,
		category: 'drinks'
	},
	{
		id: 'juju-dhau',
		name: 'Juju Dhau',
		nameNe: 'जुजु धौ',
		description: 'King of yogurt — traditional Bhaktapur-style creamy yogurt',
		descriptionNe: 'दहीको राजा — परम्परागत भक्तपुर शैलीको क्रिमी दही',
		price: 120,
		category: 'desserts',
		popular: true,
		vegetarian: true
	},
	{
		id: 'sel-roti',
		name: 'Sel Roti',
		nameNe: 'सेल रोटी',
		description: 'Traditional ring-shaped sweet rice bread',
		descriptionNe: 'परम्परागत गोलाकार मीठो चामलको रोटी',
		price: 80,
		category: 'desserts',
		vegetarian: true
	},
	{
		id: 'kheer',
		name: 'Rice Kheer',
		nameNe: 'खीर',
		description: 'Creamy rice pudding with cardamom, nuts, and saffron',
		descriptionNe: 'अलैँची, गेडागुडी र केशरसहित क्रिमी चामलको खीर',
		price: 150,
		category: 'desserts',
		vegetarian: true
	}
];
