const RESTAURANT_SLUG = 'mero-restaurant';

let restaurantId = $state<string | null>(null);

export function getRestaurant() {
	return {
		get id() {
			return restaurantId;
		},
		get slug() {
			return RESTAURANT_SLUG;
		},
		setId(id: string) {
			restaurantId = id;
		}
	};
}
