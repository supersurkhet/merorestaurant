<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { getData } from '$lib/stores/data.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { formatDate } from '$lib/utils';
	import type { WifiConfig } from '$lib/types';
	import { Wifi, QrCode, Eye, EyeOff, Save, RefreshCw, Shield, Clock } from 'lucide-svelte';

	const data = getData();
	const i18n = getI18n();

	let ssid = $state(data.wifiConfig.ssid);
	let password = $state(data.wifiConfig.password);
	let encryption = $state<WifiConfig['encryption']>(data.wifiConfig.encryption);
	let showPassword = $state(false);
	let saved = $state(false);

	function saveWifi() {
		data.updateWifi(ssid, password, encryption);
		saved = true;
		setTimeout(() => (saved = false), 3000);
	}

	// Generate WiFi QR string
	const wifiQrString = $derived(`WIFI:T:${encryption};S:${ssid};P:${password};;`);
</script>

<div class="p-8 space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold tracking-tight flex items-center gap-3">
			<Wifi size={32} />
			{i18n.t('nav.wifi')}
		</h1>
		<p class="text-muted-foreground mt-1">Configure restaurant WiFi for customer QR access</p>
	</div>

	<div class="grid grid-cols-2 gap-6">
		<!-- Config Form -->
		<Card class="p-6 space-y-5">
			<h2 class="text-lg font-semibold flex items-center gap-2">
				<Shield size={20} />
				WiFi Settings
			</h2>

			<div class="space-y-4">
				<div>
					<label class="text-sm font-medium mb-1.5 block" for="ssid">{i18n.t('wifi.ssid')}</label>
					<Input id="ssid" bind:value={ssid} placeholder="Restaurant WiFi name" />
				</div>

				<div>
					<label class="text-sm font-medium mb-1.5 block" for="wifiPass">{i18n.t('wifi.password')}</label>
					<div class="relative">
						<Input
							id="wifiPass"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							placeholder="WiFi password"
						/>
						<button
							class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							onclick={() => (showPassword = !showPassword)}
						>
							{#if showPassword}
								<EyeOff size={16} />
							{:else}
								<Eye size={16} />
							{/if}
						</button>
					</div>
				</div>

				<div>
					<label class="text-sm font-medium mb-1.5 block" for="enc">Encryption</label>
					<Select id="enc" bind:value={encryption}>
						<option value="WPA2">WPA2 (Recommended)</option>
						<option value="WPA">WPA</option>
						<option value="WEP">WEP</option>
						<option value="nopass">Open (No Password)</option>
					</Select>
				</div>
			</div>

			<div class="flex items-center justify-between pt-2">
				<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
					<Clock size={12} />
					Last updated: {formatDate(data.wifiConfig.updatedAt)}
				</div>
				<div class="flex gap-2">
					<Button variant="outline" onclick={() => { ssid = data.wifiConfig.ssid; password = data.wifiConfig.password; encryption = data.wifiConfig.encryption; }}>
						<RefreshCw size={14} /> Reset
					</Button>
					<Button onclick={saveWifi}>
						<Save size={14} /> {saved ? 'Saved!' : i18n.t('wifi.update')}
					</Button>
				</div>
			</div>

			{#if saved}
				<div class="rounded-lg bg-success/10 border border-success/30 p-3 text-sm text-success">
					WiFi config updated! QR codes will now reflect the new credentials.
				</div>
			{/if}
		</Card>

		<!-- QR Preview -->
		<Card class="p-6 flex flex-col items-center justify-center space-y-4">
			<h2 class="text-lg font-semibold flex items-center gap-2">
				<QrCode size={20} />
				Customer QR Code
			</h2>
			<p class="text-sm text-muted-foreground text-center">
				Customers scan this QR to auto-connect to WiFi
			</p>

			<!-- QR Code Placeholder -->
			<div class="flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5">
				<div class="text-center space-y-2">
					<QrCode size={64} class="mx-auto text-primary/40" />
					<p class="text-xs text-muted-foreground">QR generates from:</p>
					<code class="text-[10px] text-primary break-all block px-4">{wifiQrString}</code>
				</div>
			</div>

			<div class="text-center space-y-1">
				<p class="font-semibold">{ssid}</p>
				<Badge variant="secondary">{encryption}</Badge>
			</div>

			<Button variant="outline" class="w-full">
				Print QR Code
			</Button>
		</Card>
	</div>
</div>
