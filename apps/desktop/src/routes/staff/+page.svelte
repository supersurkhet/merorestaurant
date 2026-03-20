<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Dialog from '$lib/components/ui/dialog.svelte';
	import { getData } from '$lib/stores/data.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { generateId, formatDate } from '$lib/utils';
	import type { Role, Staff } from '$lib/types';
	import {
		Users,
		Plus,
		UserPlus,
		Shield,
		ChefHat,
		Coffee,
		Crown,
		Mail,
		Phone,
		Calendar
	} from 'lucide-svelte';

	const data = getData();
	const i18n = getI18n();

	let showInviteDialog = $state(false);
	let inviteForm = $state({ name: '', email: '', phone: '', role: 'waiter' as Role });

	const roleConfig: Record<Role, { label: string; icon: typeof Shield; color: string }> = {
		admin: { label: 'Admin', icon: Crown, color: 'text-amber-500' },
		manager: { label: 'Manager', icon: Shield, color: 'text-blue-500' },
		kitchen_staff: { label: 'Kitchen', icon: ChefHat, color: 'text-orange-500' },
		waiter: { label: 'Waiter', icon: Coffee, color: 'text-purple-500' }
	};

	function inviteStaff() {
		data.addStaff({
			_id: generateId(),
			...inviteForm,
			isActive: true,
			joinedAt: Date.now()
		});
		showInviteDialog = false;
		inviteForm = { name: '', email: '', phone: '', role: 'waiter' };
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
				{data.staff.filter((s) => s.isActive).length} active staff members
			</p>
		</div>
		<Button onclick={() => (showInviteDialog = true)}>
			<UserPlus size={16} /> {i18n.t('staff.invite')}
		</Button>
	</div>

	<!-- Role Summary -->
	<div class="grid grid-cols-4 gap-4">
		{#each (['admin', 'manager', 'kitchen_staff', 'waiter'] as Role[]) as role}
			{@const config = roleConfig[role]}
			{@const count = data.staff.filter((s) => s.role === role && s.isActive).length}
			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
						<config.icon size={20} class={config.color} />
					</div>
					<div>
						<p class="text-2xl font-bold">{count}</p>
						<p class="text-xs text-muted-foreground">{config.label}</p>
					</div>
				</div>
			</Card>
		{/each}
	</div>

	<!-- Staff List -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each data.staff as member}
			{@const config = roleConfig[member.role]}
			<Card class="p-5 hover:shadow-md transition-shadow {!member.isActive ? 'opacity-60' : ''}">
				<div class="flex items-start gap-4">
					<!-- Avatar -->
					<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg shrink-0">
						{member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
					</div>

					<div class="flex-1 min-w-0 space-y-2">
						<div class="flex items-center justify-between">
							<h3 class="font-semibold truncate">{member.name}</h3>
							<Badge variant={member.isActive ? 'success' : 'secondary'}>
								{member.isActive ? 'Active' : 'Inactive'}
							</Badge>
						</div>

						<div class="flex items-center gap-1">
							<config.icon size={14} class={config.color} />
							<span class="text-sm {config.color} font-medium">{config.label}</span>
						</div>

						<div class="space-y-1 text-xs text-muted-foreground">
							<div class="flex items-center gap-1.5">
								<Mail size={12} /> {member.email}
							</div>
							{#if member.phone}
								<div class="flex items-center gap-1.5">
									<Phone size={12} /> {member.phone}
								</div>
							{/if}
							<div class="flex items-center gap-1.5">
								<Calendar size={12} /> Joined {formatDate(member.joinedAt)}
							</div>
						</div>

						<div class="flex gap-2 pt-1">
							<Button size="sm" variant="outline" onclick={() => data.toggleStaffActive(member._id)}>
								{member.isActive ? 'Deactivate' : 'Activate'}
							</Button>
						</div>
					</div>
				</div>
			</Card>
		{/each}
	</div>
</div>

<!-- Invite Staff Dialog -->
<Dialog bind:open={showInviteDialog}>
	<h2 class="text-xl font-bold mb-4 flex items-center gap-2">
		<UserPlus size={24} /> {i18n.t('staff.invite')}
	</h2>
	<div class="space-y-4">
		<div>
			<label class="text-sm font-medium" for="staffName">Full Name</label>
			<Input id="staffName" bind:value={inviteForm.name} placeholder="Enter full name" />
		</div>
		<div>
			<label class="text-sm font-medium" for="staffEmail">Email</label>
			<Input id="staffEmail" type="email" bind:value={inviteForm.email} placeholder="email@example.com" />
		</div>
		<div>
			<label class="text-sm font-medium" for="staffPhone">Phone</label>
			<Input id="staffPhone" bind:value={inviteForm.phone} placeholder="98XXXXXXXX" />
		</div>
		<div>
			<label class="text-sm font-medium" for="staffRole">{i18n.t('staff.role')}</label>
			<Select id="staffRole" bind:value={inviteForm.role}>
				<option value="admin">Admin</option>
				<option value="manager">Manager</option>
				<option value="kitchen_staff">Kitchen Staff</option>
				<option value="waiter">Waiter</option>
			</Select>
		</div>
		<div class="flex justify-end gap-2 pt-2">
			<Button variant="outline" onclick={() => (showInviteDialog = false)}>{i18n.t('common.cancel')}</Button>
			<Button onclick={inviteStaff}>{i18n.t('staff.invite')}</Button>
		</div>
	</div>
</Dialog>
