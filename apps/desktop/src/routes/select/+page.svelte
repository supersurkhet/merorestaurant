<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { getAuth } from '$lib/stores/auth.svelte';
	import { getRestaurant } from '$lib/stores/restaurant.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { goto } from '$app/navigation';
	import { Building2, Plus, ChefHat, Crown, Shield, Coffee } from 'lucide-svelte';

	const auth = getAuth();
	const restaurant = getRestaurant();
	const i18n = getI18n();

	const restaurants = $derived(auth.allRestaurants);

	function selectRestaurant(r: any) {
		restaurant.set({
			id: r._id,
			name: r.name,
			nameNe: r.nameNe,
			slug: r.slug,
			onboardingStatus: r.onboardingStatus,
			subscriptionTier: r.subscriptionTier
		});
		if (r.onboardingStatus !== 'operational') {
			goto('/onboard');
		} else {
			goto('/');
		}
	}

	const statusLabels: Record<string, string> = {
		registered: 'Just Registered',
		profile_complete: 'Profile Done',
		menu_added: 'Menu Added',
		tables_configured: 'Tables Set',
		operational: 'Live'
	};

	const roleIcons: Record<string, typeof Crown> = {
		owner: Crown,
		manager: Shield,
		chef: ChefHat,
		waiter: Coffee,
		cashier: Coffee
	};
</script>

<div class="flex h-screen items-center justify-center bg-background p-8">
	<div class="w-full max-w-2xl space-y-6">
		<div class="text-center space-y-2">
			<div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-3xl mx-auto">
				म
			</div>
			<h1 class="text-2xl font-bold">{i18n.t('app.name')}</h1>
			<p class="text-muted-foreground">Select a restaurant to manage</p>
		</div>

		{#if restaurants.length === 0}
			<Card class="p-8 text-center space-y-4">
				<Building2 size={48} class="mx-auto text-muted-foreground/50" />
				<h2 class="text-lg font-semibold">No Restaurants Yet</h2>
				<p class="text-sm text-muted-foreground">Register your first restaurant to get started</p>
				<Button onclick={() => goto('/onboard')}>
					<Plus size={16} /> Register Restaurant
				</Button>
			</Card>
		{:else}
			<div class="grid gap-3">
				{#each restaurants as r}
					{@const role = auth.roleFor(r._id)}
					{@const RoleIcon = roleIcons[role ?? 'owner'] ?? Crown}
					<Card
						class="p-5 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
						onclick={() => selectRestaurant(r)}
					>
						<div class="flex items-center gap-4">
							<div class="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xl shrink-0">
								{r.name.charAt(0)}
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2">
									<h3 class="font-semibold text-lg truncate">{r.name}</h3>
									{#if r.nameNe}
										<span class="text-sm text-muted-foreground">({r.nameNe})</span>
									{/if}
								</div>
								<div class="flex items-center gap-3 mt-1">
									<div class="flex items-center gap-1 text-xs text-muted-foreground">
										<RoleIcon size={12} />
										<span class="capitalize">{role}</span>
									</div>
									<Badge variant={r.onboardingStatus === 'operational' ? 'success' : 'warning'} class="text-[10px]">
										{statusLabels[r.onboardingStatus] ?? r.onboardingStatus}
									</Badge>
									<Badge variant="secondary" class="text-[10px]">
										{r.subscriptionTier}
									</Badge>
								</div>
							</div>
						</div>
					</Card>
				{/each}
			</div>

			<div class="text-center">
				<Button variant="outline" onclick={() => goto('/onboard')}>
					<Plus size={16} /> Register New Restaurant
				</Button>
			</div>
		{/if}

		<p class="text-center text-xs text-muted-foreground">
			Signed in as {auth.user?.name} ({auth.user?.email})
		</p>
	</div>
</div>
