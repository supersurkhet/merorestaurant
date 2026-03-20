<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { MapPin, Loader2, X } from 'lucide-svelte';

	let {
		latitude = $bindable<number | undefined>(undefined),
		longitude = $bindable<number | undefined>(undefined),
		address = $bindable(''),
		city = $bindable('')
	}: {
		latitude?: number;
		longitude?: number;
		address?: string;
		city?: string;
	} = $props();

	let mapContainer: HTMLDivElement;
	let map: any;
	let marker: any;
	let geocoding = $state(false);
	let hasLocation = $derived(latitude !== undefined && longitude !== undefined);

	// Default center: Surkhet, Nepal
	const DEFAULT_LAT = 28.6;
	const DEFAULT_LNG = 81.62;

	onMount(async () => {
		if (!browser) return;

		const L = await import('leaflet');

		// Fix Leaflet's default icon paths
		delete (L.Icon.Default.prototype as any)._getIconUrl;
		L.Icon.Default.mergeOptions({
			iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
			iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
		});

		map = L.map(mapContainer).setView([DEFAULT_LAT, DEFAULT_LNG], 13);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
			maxZoom: 19
		}).addTo(map);

		map.on('click', async (e: any) => {
			const { lat, lng } = e.latlng;
			placePin(L, lat, lng);
			await reverseGeocode(lat, lng);
		});

		// If we already have coordinates, show them
		if (latitude && longitude) {
			placePin(L, latitude, longitude);
		}
	});

	function placePin(L: any, lat: number, lng: number) {
		latitude = lat;
		longitude = lng;
		if (marker) {
			marker.setLatLng([lat, lng]);
		} else {
			marker = L.marker([lat, lng]).addTo(map);
		}
		map.panTo([lat, lng]);
	}

	async function reverseGeocode(lat: number, lng: number) {
		geocoding = true;
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
				{ headers: { 'User-Agent': 'MeroRestaurant/1.0' } }
			);
			const data = await res.json();
			if (data.display_name) {
				address = data.display_name;
			}
			const addr = data.address ?? {};
			city = addr.city || addr.town || addr.village || addr.county || '';
		} catch {
			// Geocoding failed — user can still type manually
		} finally {
			geocoding = false;
		}
	}

	function clearLocation() {
		latitude = undefined;
		longitude = undefined;
		address = '';
		city = '';
		if (marker && map) {
			map.removeLayer(marker);
			marker = null;
		}
	}
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="space-y-3">
	<div class="flex items-center justify-between">
		<label class="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
			<MapPin class="h-3.5 w-3.5 text-muted-foreground" />
			Location
			<span class="text-[11px] font-normal text-muted-foreground">(optional)</span>
		</label>
		{#if hasLocation}
			<button
				type="button"
				onclick={clearLocation}
				class="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground"
			>
				<X class="h-3 w-3" />
				Clear
			</button>
		{/if}
	</div>

	<div
		bind:this={mapContainer}
		class="h-52 w-full overflow-hidden rounded-xl border border-input bg-muted"
	></div>

	{#if geocoding}
		<div class="flex items-center gap-2 text-[12px] text-muted-foreground">
			<Loader2 class="h-3.5 w-3.5 animate-spin" />
			Resolving address...
		</div>
	{:else if hasLocation}
		<div class="space-y-2">
			<div>
				<label for="loc-address" class="mb-1 block text-[12px] text-muted-foreground">Address</label>
				<input
					id="loc-address"
					bind:value={address}
					type="text"
					class="w-full rounded-lg border border-input bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
				/>
			</div>
			<div>
				<label for="loc-city" class="mb-1 block text-[12px] text-muted-foreground">City</label>
				<input
					id="loc-city"
					bind:value={city}
					type="text"
					class="w-full rounded-lg border border-input bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
				/>
			</div>
			<p class="text-[11px] text-muted-foreground/60">
				{latitude?.toFixed(5)}, {longitude?.toFixed(5)}
			</p>
		</div>
	{:else}
		<p class="text-[12px] text-muted-foreground">Click on the map to set your restaurant's location, or skip this step.</p>
	{/if}
</div>
