<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type L from 'leaflet';
	import Switch from '$lib/components/ui/switch.svelte';

	interface Props {
		latitude?: number;
		longitude?: number;
		address?: string;
		onchange?: (data: { latitude: number; longitude: number; address: string; city: string }) => void;
		class?: string;
	}

	let {
		latitude = $bindable(28.6),
		longitude = $bindable(81.6),
		address = $bindable(''),
		onchange,
		class: className = ''
	}: Props = $props();

	let mapContainer = $state<HTMLDivElement>(null!);
	let map: L.Map | null = null;
	let marker: L.Marker | null = null;
	let resolvedAddress = $state(address || '');
	let resolvedCity = $state('');
	let isGeocoding = $state(false);
	let skipLocation = $state(false);

	onMount(async () => {
		const leaflet = await import('leaflet');

		// Fix default marker icons for bundled apps
		const defaultIcon = leaflet.icon({
			iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
			iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		});

		map = leaflet.map(mapContainer).setView([latitude, longitude], 14);

		leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap contributors',
			maxZoom: 19
		}).addTo(map);

		// Place initial marker if coordinates provided
		if (latitude && longitude) {
			marker = leaflet.marker([latitude, longitude], { icon: defaultIcon, draggable: true }).addTo(map);
			marker.on('dragend', () => {
				const pos = marker!.getLatLng();
				updateLocation(pos.lat, pos.lng);
			});
		}

		map.on('click', (e: L.LeafletMouseEvent) => {
			if (skipLocation) return;
			const { lat, lng } = e.latlng;
			if (marker) {
				marker.setLatLng([lat, lng]);
			} else {
				marker = leaflet.marker([lat, lng], { icon: defaultIcon, draggable: true }).addTo(map!);
				marker.on('dragend', () => {
					const pos = marker!.getLatLng();
					updateLocation(pos.lat, pos.lng);
				});
			}
			updateLocation(lat, lng);
		});
	});

	onDestroy(() => {
		map?.remove();
	});

	async function updateLocation(lat: number, lng: number) {
		latitude = Math.round(lat * 1000000) / 1000000;
		longitude = Math.round(lng * 1000000) / 1000000;

		// Reverse geocode via Nominatim
		isGeocoding = true;
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
				{ headers: { 'Accept-Language': 'en' } }
			);
			if (res.ok) {
				const data = await res.json();
				const addr = data.address ?? {};
				resolvedAddress = data.display_name ?? '';
				resolvedCity = addr.city ?? addr.town ?? addr.village ?? addr.county ?? '';
				address = resolvedAddress;
				onchange?.({ latitude, longitude, address: resolvedAddress, city: resolvedCity });
			}
		} catch {
			// Geocoding failed silently
		} finally {
			isGeocoding = false;
		}
	}
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="space-y-3 {className}">
	<div class="flex items-center justify-between">
		<span class="text-sm font-medium">Location</span>
		<label class="flex items-center gap-2 text-xs text-muted-foreground">
			<Switch bind:checked={skipLocation} />
			No physical location
		</label>
	</div>

	{#if !skipLocation}
		<div
			bind:this={mapContainer}
			class="h-64 w-full rounded-xl border overflow-hidden"
			style="z-index: 0;"
		></div>

		{#if resolvedAddress}
			<div class="rounded-lg border bg-accent/30 p-3 text-sm">
				<p class="text-xs text-muted-foreground mb-1">Detected address:</p>
				<p class="font-medium text-foreground">{resolvedAddress}</p>
				{#if resolvedCity}
					<p class="text-xs text-muted-foreground mt-1">City: {resolvedCity}</p>
				{/if}
			</div>
		{:else}
			<p class="text-xs text-muted-foreground">Click on the map to set your restaurant location</p>
		{/if}

		{#if isGeocoding}
			<p class="text-xs text-muted-foreground animate-pulse">Resolving address...</p>
		{/if}

		<div class="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
			<span>Lat: {latitude.toFixed(6)}</span>
			<span>Lng: {longitude.toFixed(6)}</span>
		</div>
	{:else}
		<p class="text-sm text-muted-foreground">Location skipped — you can add it later in settings.</p>
	{/if}
</div>
