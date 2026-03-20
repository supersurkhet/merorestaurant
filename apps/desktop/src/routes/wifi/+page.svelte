<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import QrCodeSvg from '$lib/components/QrCode.svelte';
	import { getData } from '$lib/stores/data.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { formatDate } from '$lib/utils';
	import { Wifi, Eye, EyeOff, Save, RefreshCw, Shield, Clock, Printer, CheckCircle } from 'lucide-svelte';

	const data = getData();
	const i18n = getI18n();

	let ssid = $state(data.wifiConfig.ssid);
	let password = $state(data.wifiConfig.password);
	let encryption = $state(data.wifiConfig.encryption);
	let showPassword = $state(false);
	let saving = $state(false);
	let saved = $state(false);
	let isEditing = $state(false);

	// Use QR string from Convex if available, otherwise compute
	const wifiQrString = $derived(
		data.wifiConfig.qrString || `WIFI:T:${encryption};S:${ssid};P:${password};;`
	);

	const hasChanges = $derived(
		ssid !== data.wifiConfig.ssid ||
		password !== data.wifiConfig.password ||
		encryption !== data.wifiConfig.encryption
	);

	// Sync form when Convex data updates
	$effect(() => {
		if (!isEditing && data.wifiConfig.ssid) {
			ssid = data.wifiConfig.ssid;
			password = data.wifiConfig.password;
			encryption = data.wifiConfig.encryption;
		}
	});

	async function saveWifi() {
		saving = true;
		try {
			await data.updateWifi(ssid, password, encryption);
			saved = true;
			isEditing = false;
			setTimeout(() => (saved = false), 3000);
		} catch (e) {
			console.error('Failed to save WiFi config:', e);
		} finally {
			saving = false;
		}
	}

	function resetForm() {
		ssid = data.wifiConfig.ssid;
		password = data.wifiConfig.password;
		encryption = data.wifiConfig.encryption;
		isEditing = false;
	}

	function printQr() {
		const qrEl = document.getElementById('wifi-qr-area');
		if (!qrEl) return;
		const win = window.open('', '_blank', 'width=400,height=600');
		if (win) {
			win.document.write(`
				<div style="text-align:center;font-family:sans-serif;padding:30px;">
					<h1 style="margin:0;font-size:24px;">Free WiFi</h1>
					<h2 style="margin:4px 0;color:#666;">Mero Restaurant, Surkhet</h2>
					<div style="margin:20px auto;">${qrEl.innerHTML}</div>
					<p style="font-size:14px;color:#333;margin:16px 0 4px;">Network: <strong>${ssid}</strong></p>
					<p style="font-size:12px;color:#999;">Scan QR to connect automatically</p>
				</div>
			`);
			win.print();
		}
	}
</script>

<div class="p-8 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight flex items-center gap-3">
				<Wifi size={32} />
				{i18n.t('nav.wifi')}
			</h1>
			<p class="text-muted-foreground mt-1">Configure restaurant WiFi for customer QR access</p>
		</div>
		<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
			<Clock size={12} />
			Last updated: {formatDate(data.wifiConfig.updatedAt)}
		</div>
	</div>

	<div class="grid grid-cols-2 gap-6">
		<!-- Current Config / Edit Form -->
		<Card class="p-6 space-y-5">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold flex items-center gap-2">
					<Shield size={20} />
					WiFi Settings
				</h2>
				{#if !isEditing}
					<Button variant="outline" size="sm" onclick={() => (isEditing = true)}>
						Edit
					</Button>
				{/if}
			</div>

			{#if !isEditing}
				<!-- Read-only display -->
				<div class="space-y-4">
					<div class="rounded-lg border p-4 space-y-3">
						<div class="flex items-center justify-between">
							<span class="text-sm text-muted-foreground">{i18n.t('wifi.ssid')}</span>
							<span class="font-medium">{data.wifiConfig.ssid}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm text-muted-foreground">{i18n.t('wifi.password')}</span>
							<div class="flex items-center gap-2">
								<span class="font-mono text-sm">
									{showPassword ? data.wifiConfig.password : '••••••••••'}
								</span>
								<button
									class="text-muted-foreground hover:text-foreground transition-colors"
									onclick={() => (showPassword = !showPassword)}
								>
									{#if showPassword}
										<EyeOff size={14} />
									{:else}
										<Eye size={14} />
									{/if}
								</button>
							</div>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm text-muted-foreground">Encryption</span>
							<Badge variant="secondary">{data.wifiConfig.encryption}</Badge>
						</div>
					</div>

					<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Clock size={12} />
						Last updated: {formatDate(data.wifiConfig.updatedAt)}
					</div>
				</div>
			{:else}
				<!-- Edit form -->
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

				<div class="flex justify-end gap-2 pt-2">
					<Button variant="outline" onclick={resetForm}>
						<RefreshCw size={14} /> Cancel
					</Button>
					<Button onclick={saveWifi} disabled={saving || !hasChanges}>
						<Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>
			{/if}

			{#if saved}
				<div class="rounded-lg bg-success/10 border border-success/30 p-3 text-sm text-success flex items-center gap-2">
					<CheckCircle size={16} />
					WiFi config updated! QR codes now reflect the new credentials.
				</div>
			{/if}
		</Card>

		<!-- QR Preview -->
		<Card class="p-6 flex flex-col items-center justify-center space-y-4">
			<h2 class="text-lg font-semibold flex items-center gap-2">
				<Wifi size={20} />
				Customer WiFi QR
			</h2>
			<p class="text-sm text-muted-foreground text-center">
				Customers scan this QR to auto-connect to WiFi
			</p>

			<div id="wifi-qr-area" class="bg-white rounded-2xl p-4">
				<QrCodeSvg data={wifiQrString} size={240} />
			</div>

			<div class="text-center space-y-1">
				<p class="font-semibold">{ssid}</p>
				<Badge variant="secondary">{encryption}</Badge>
			</div>

			<code class="text-[10px] text-muted-foreground break-all text-center px-4 block">
				{wifiQrString}
			</code>

			<Button variant="outline" class="w-full" onclick={printQr}>
				<Printer size={14} /> Print QR Code
			</Button>
		</Card>
	</div>
</div>
