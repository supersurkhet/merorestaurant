<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Dialog from '$lib/components/ui/dialog.svelte';
	import { getData } from '$lib/stores/data.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { formatDate } from '$lib/utils';
	import type { Role } from '$lib/types';
	import {
		Users,
		UserPlus,
		Shield,
		ChefHat,
		Coffee,
		Crown,
		Mail,
		Phone,
		Calendar,
		Search,
		AlertTriangle
	} from 'lucide-svelte';

	const data = getData();
	const i18n = getI18n();

	let showInviteDialog = $state(false);
	let showConfirmDialog = $state(false);
	let confirmTarget = $state<any | null>(null);
	let searchQuery = $state('');
	let roleFilter = $state<string>('all');
	let inviteForm = $state({ name: '', email: '', phone: '', role: 'waiter' });

	// Convex uses: owner, manager, waiter, kitchen, cashier
	const roleConfig: Record<string, { label: string; icon: typeof Shield; color: string; bg: string }> = {
		owner: { label: 'Owner', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/10' },
		manager: { label: 'Manager', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-500/10' },
		kitchen: { label: 'Kitchen', icon: ChefHat, color: 'text-orange-500', bg: 'bg-orange-500/10' },
		waiter: { label: 'Waiter', icon: Coffee, color: 'text-purple-500', bg: 'bg-purple-500/10' },
		cashier: { label: 'Cashier', icon: Coffee, color: 'text-teal-500', bg: 'bg-teal-500/10' }
	};

	const allRoles = ['owner', 'manager', 'waiter', 'kitchen', 'cashier'];

	const filteredStaff = $derived(
		data.staff.filter((s) => {
			const matchRole = roleFilter === 'all' || s.role === roleFilter;
			const matchSearch = !searchQuery ||
				s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				s.email.toLowerCase().includes(searchQuery.toLowerCase());
			return matchRole && matchSearch;
		})
	);

	async function inviteStaff() {
		if (!inviteForm.name || !inviteForm.email) return;
		await data.addStaff({
			name: inviteForm.name,
			email: inviteForm.email,
			role: inviteForm.role
		});
		showInviteDialog = false;
		inviteForm = { name: '', email: '', phone: '', role: 'waiter' };
	}

	function requestToggle(member: any) {
		confirmTarget = member;
		showConfirmDialog = true;
	}

	async function confirmToggle() {
		if (confirmTarget) {
			await data.toggleStaffActive(confirmTarget._id);
		}
		showConfirmDialog = false;
		confirmTarget = null;
	}
</script>

<div class="p-8 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight flex items-center gap-3">
				<Users size={32} />
				{i18n.t('nav.staff')}
			</h1>
			<p class="text-muted-foreground mt-1">
				{data.staff.filter((s) => s.isActive).length} active of {data.staff.length} total
			</p>
		</div>
		<Button onclick={() => (showInviteDialog = true)}>
			<UserPlus size={16} /> {i18n.t('staff.invite')}
		</Button>
	</div>

	<!-- Role Summary Cards -->
	<div class="grid grid-cols-4 gap-4">
		{#each allRoles as role}
			{@const config = roleConfig[role]}
			{@const count = data.staff.filter((s) => s.role === role && s.isActive).length}
			<button
				class="text-left transition-all {roleFilter === role ? 'ring-2 ring-primary' : ''}"
				onclick={() => (roleFilter = roleFilter === role ? 'all' : role)}
			>
				<Card class="p-4 hover:shadow-md transition-shadow">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-lg {config.bg}">
							<config.icon size={20} class={config.color} />
						</div>
						<div>
							<p class="text-2xl font-bold">{count}</p>
							<p class="text-xs text-muted-foreground">{config.label}</p>
						</div>
					</div>
				</Card>
			</button>
		{/each}
	</div>

	<!-- Search & Filter -->
	<div class="flex gap-4">
		<div class="relative flex-1">
			<Search size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
			<Input class="pl-9" placeholder="Search staff by name or email..." bind:value={searchQuery} />
		</div>
		<div class="flex gap-1.5">
			<Button variant={roleFilter === 'all' ? 'default' : 'outline'} size="sm" onclick={() => (roleFilter = 'all')}>
				All
			</Button>
			{#each allRoles as role}
				{@const config = roleConfig[role]}
				<Button variant={roleFilter === role ? 'default' : 'outline'} size="sm" onclick={() => (roleFilter = role)}>
					{config.label}
				</Button>
			{/each}
		</div>
	</div>

	<!-- Staff List -->
	{#if filteredStaff.length === 0}
		<div class="flex flex-col items-center justify-center py-16 text-muted-foreground">
			<Users size={48} class="mb-4 opacity-50" />
			<p class="text-lg">No staff found</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each filteredStaff as member (member._id)}
				{@const config = roleConfig[member.role]}
				<Card class="p-5 hover:shadow-md transition-all {!member.isActive ? 'opacity-50 grayscale-[30%]' : ''}">
					<div class="flex items-start gap-4">
						<!-- Avatar -->
						<div class="flex h-14 w-14 items-center justify-center rounded-full {config.bg} {config.color} font-bold text-lg shrink-0">
							{member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
						</div>

						<div class="flex-1 min-w-0 space-y-2">
							<div class="flex items-center justify-between">
								<h3 class="font-semibold truncate">{member.name}</h3>
								<Badge variant={member.isActive ? 'success' : 'secondary'}>
									{member.isActive ? 'Active' : 'Inactive'}
								</Badge>
							</div>

							<!-- Role badge -->
							<div class="flex items-center gap-1.5">
								<div class="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium {config.bg} {config.color}">
									<config.icon size={11} />
									{config.label}
								</div>
							</div>

							<div class="space-y-1 text-xs text-muted-foreground">
								<div class="flex items-center gap-1.5">
									<Mail size={12} />
									<span class="truncate">{member.email}</span>
								</div>
								{#if member.phone}
									<div class="flex items-center gap-1.5">
										<Phone size={12} /> {member.phone}
									</div>
								{/if}
								<div class="flex items-center gap-1.5">
									<Calendar size={12} /> Joined {formatDate(member._creationTime ?? member.joinedAt ?? Date.now())}
								</div>
							</div>

							<div class="flex gap-2 pt-1">
								<Button
									size="sm"
									variant={member.isActive ? 'outline' : 'default'}
									onclick={() => requestToggle(member)}
								>
									{member.isActive ? 'Deactivate' : 'Activate'}
								</Button>
							</div>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<!-- Invite Staff Dialog -->
<Dialog bind:open={showInviteDialog}>
	<h2 class="text-xl font-bold mb-4 flex items-center gap-2">
		<UserPlus size={24} /> {i18n.t('staff.invite')}
	</h2>
	<div class="space-y-4">
		<div>
			<label class="text-sm font-medium mb-1 block" for="staffName">Full Name</label>
			<Input id="staffName" bind:value={inviteForm.name} placeholder="Enter full name" />
		</div>
		<div>
			<label class="text-sm font-medium mb-1 block" for="staffEmail">Email</label>
			<Input id="staffEmail" type="email" bind:value={inviteForm.email} placeholder="email@example.com" />
		</div>
		<div>
			<label class="text-sm font-medium mb-1 block" for="staffPhone">Phone</label>
			<Input id="staffPhone" bind:value={inviteForm.phone} placeholder="98XXXXXXXX" />
		</div>
		<div>
			<label class="text-sm font-medium mb-1 block" for="staffRole">{i18n.t('staff.role')}</label>
			<Select id="staffRole" bind:value={inviteForm.role}>
				{#each allRoles as role}
					<option value={role}>{roleConfig[role].label}</option>
				{/each}
			</Select>
		</div>
		<div class="flex justify-end gap-2 pt-2">
			<Button variant="outline" onclick={() => (showInviteDialog = false)}>{i18n.t('common.cancel')}</Button>
			<Button onclick={inviteStaff} disabled={!inviteForm.name || !inviteForm.email}>
				{i18n.t('staff.invite')}
			</Button>
		</div>
	</div>
</Dialog>

<!-- Confirm Toggle Dialog -->
<Dialog bind:open={showConfirmDialog}>
	{#if confirmTarget}
		<div class="text-center space-y-4">
			<div class="flex justify-center">
				<div class="flex h-14 w-14 items-center justify-center rounded-full bg-warning/10">
					<AlertTriangle size={28} class="text-warning" />
				</div>
			</div>
			<h2 class="text-lg font-bold">
				{confirmTarget.isActive ? 'Deactivate' : 'Activate'} Staff Member
			</h2>
			<p class="text-sm text-muted-foreground">
				{#if confirmTarget.isActive}
					<strong>{confirmTarget.name}</strong> will no longer be able to access the system. You can reactivate them later.
				{:else}
					<strong>{confirmTarget.name}</strong> will regain access to the system with their <strong>{roleConfig[confirmTarget.role].label}</strong> role.
				{/if}
			</p>
			<div class="flex gap-2 justify-center pt-2">
				<Button variant="outline" onclick={() => (showConfirmDialog = false)}>Cancel</Button>
				<Button
					variant={confirmTarget.isActive ? 'destructive' : 'success'}
					onclick={confirmToggle}
				>
					{confirmTarget.isActive ? 'Deactivate' : 'Activate'}
				</Button>
			</div>
		</div>
	{/if}
</Dialog>
