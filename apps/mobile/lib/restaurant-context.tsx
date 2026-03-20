import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from 'convex/react';
import { api } from './convex-api';
import type { Id, Restaurant } from './convex-types';

const RESTAURANT_SLUG = 'mero-restaurant';

interface RestaurantCtx {
  restaurant: Restaurant | null | undefined;
  restaurantId: Id<'restaurants'> | null;
  isLoading: boolean;
}

const RestaurantContext = createContext<RestaurantCtx>({
  restaurant: undefined,
  restaurantId: null,
  isLoading: true,
});

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const restaurant = useQuery(api.restaurants.getBySlug, { slug: RESTAURANT_SLUG }) as Restaurant | null | undefined;
  const isLoading = restaurant === undefined;
  const restaurantId = restaurant?._id ?? null;

  return (
    <RestaurantContext.Provider value={{ restaurant, restaurantId, isLoading }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  return useContext(RestaurantContext);
}
