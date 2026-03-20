<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Switch from '$lib/components/ui/switch.svelte';
	import Dialog from '$lib/components/ui/dialog.svelte';
	import { getData } from '$lib/stores/data.svelte';
	import { getI18n } from '$lib/stores/i18n.svelte';
	import { formatCurrency } from '$lib/utils';
	import {
		UtensilsCrossed,
		Plus,
		Search,
		Pencil,
		Trash2,
		Leaf,
		Clock,
		ImagePlus
	} from 'lucide-svelte';

	const data = getData();
	const i18n = getI18n();

	let selectedCategory = $state<string>('all');
	let searchQuery = $state('');
	let showItemDialog = $state(false);
	let showCategoryDialog = $state(false);
	let editingItem = $state<any | null>(null);
	let editingCategory = $state<any | null>(null);
	let imageFile = $state<File | null>(null);

	// Form state
	let itemForm = $state({
		name: '',
		nameNe: '',
		description: '',
		categoryId: '',
		price: 0,
		preparationTime: 15,
		isVeg: false,
		isAvailable: true
	});

	let categoryForm = $state({ name: '', nameNe: '', description: '' });

	const filteredItems = $derived(
		data.menuItems.filter((item: any) => {
			const matchCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
			const matchSearch =
				!searchQuery ||
				item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(item.nameNe ?? '').includes(searchQuery);
			return matchCategory && matchSearch;
		})
	);

	function openNewItem() {
		editingItem = null;
		itemForm = {
			name: '',
			nameNe: '',
			description: '',
			categoryId: data.categories[0]?._id ?? '',
			price: 0,
			preparationTime: 15,
			isVeg: false,
			isAvailable: true
		};
		showItemDialog = true;
	}

	function openEditItem(item: any) {
		editingItem = item;
		itemForm = {
			name: item.name,
			nameNe: item.nameNe ?? '',
			description: item.description ?? '',
			categoryId: item.categoryId,
			price: item.price,
			preparationTime: item.preparationTime ?? item.sortOrder ?? 15,
			isVeg: item.isVeg,
			isAvailable: item.isAvailable
		};
		imageFile = null;
		showItemDialog = true;
	}

	async function saveItem() {
		let imageStorageId: string | undefined;
		// Upload image if selected
		if (imageFile) {
			try {
				const uploadUrl = await data.generateUploadUrl();
				const result = await fetch(uploadUrl, {
					method: 'POST',
					headers: { 'Content-Type': imageFile.type },
					body: imageFile
				});
				const json = await result.json();
				imageStorageId = json.storageId;
			} catch (e) {
				console.error('Image upload failed:', e);
			}
		}

		if (editingItem) {
			await data.updateMenuItem(editingItem._id, {
				name: itemForm.name,
				nameNe: itemForm.nameNe || undefined,
				description: itemForm.description || undefined,
				price: itemForm.price,
				isVeg: itemForm.isVeg,
				isAvailable: itemForm.isAvailable,
				categoryId: itemForm.categoryId,
				...(imageStorageId ? { imageStorageId } : {})
			});
		} else {
			await data.addMenuItem({
				categoryId: itemForm.categoryId,
				name: itemForm.name,
				nameNe: itemForm.nameNe || undefined,
				description: itemForm.description || undefined,
				price: itemForm.price,
				isVeg: itemForm.isVeg,
				sortOrder: data.menuItems.length + 1,
				...(imageStorageId ? { imageStorageId } : {})
			});
		}
		showItemDialog = false;
		imageFile = null;
	}

	function openNewCategory() {
		editingCategory = null;
		categoryForm = { name: '', nameNe: '', description: '' };
		showCategoryDialog = true;
	}

	async function saveCategory() {
		if (editingCategory) {
			await data.updateCategory(editingCategory._id, {
				name: categoryForm.name,
				nameNe: categoryForm.nameNe || undefined
			});
		} else {
			await data.addCategory({
				name: categoryForm.name,
				nameNe: categoryForm.nameNe || categoryForm.name,
				sortOrder: data.categories.length + 1
			});
		}
		showCategoryDialog = false;
	}

	function getCategoryName(id: string): string {
		return data.categories.find((c: any) => c._id === id)?.name ?? 'Unknown';
	}
</script>

<div class="p-8 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight flex items-center gap-3">
				<UtensilsCrossed size={32} />
				{i18n.t('nav.menu')}
			</h1>
			<p class="text-muted-foreground mt-1">{data.menuItems.length} items across {data.categories.length} categories</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={openNewCategory}>
				<Plus size={16} /> {i18n.t('menu.addCategory')}
			</Button>
			<Button onclick={openNewItem}>
				<Plus size={16} /> {i18n.t('menu.addItem')}
			</Button>
		</div>
	</div>

	<!-- Search & Category Filter -->
	<div class="flex gap-4">
		<div class="relative flex-1">
			<Search size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
			<Input class="pl-9" placeholder="{i18n.t('common.search')} menu items..." bind:value={searchQuery} />
		</div>
		<div class="flex gap-2">
			<Button variant={selectedCategory === 'all' ? 'default' : 'outline'} size="sm" onclick={() => (selectedCategory = 'all')}>
				All
			</Button>
			{#each data.categories as cat}
				<Button variant={selectedCategory === cat._id ? 'default' : 'outline'} size="sm" onclick={() => (selectedCategory = cat._id)}>
					{cat.name}
				</Button>
			{/each}
		</div>
	</div>

	<!-- Menu Items Grid -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each filteredItems as item}
			<Card class="overflow-hidden hover:shadow-md transition-shadow">
				<!-- Image placeholder -->
				<div class="h-36 bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center">
					{#if item.imageUrl}
						<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
					{:else}
						<ImagePlus size={32} class="text-muted-foreground/40" />
					{/if}
				</div>

				<div class="p-4 space-y-3">
					<div class="flex items-start justify-between">
						<div>
							<h3 class="font-semibold">{item.name}</h3>
							<p class="text-xs text-muted-foreground">{item.nameNe}</p>
						</div>
						<div class="flex items-center gap-1">
							{#if item.isVeg}
								<Leaf size={14} class="text-emerald-500" />
							{/if}
						</div>
					</div>

					{#if item.description}
						<p class="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
					{/if}

					<div class="flex items-center justify-between">
						<span class="text-lg font-bold text-primary">{formatCurrency(item.price)}</span>
					</div>

					<div class="flex items-center justify-between border-t pt-3">
						<div class="flex items-center gap-2">
							<Badge variant={item.isAvailable ? 'success' : 'destructive'}>
								{item.isAvailable ? i18n.t('menu.available') : i18n.t('menu.unavailable')}
							</Badge>
							<span class="text-xs text-muted-foreground">{getCategoryName(item.categoryId)}</span>
						</div>
						<div class="flex gap-1">
							<Button size="icon" variant="ghost" onclick={() => data.toggleMenuItemAvailability(item._id)}>
								<Switch checked={item.isAvailable} />
							</Button>
							<Button size="icon" variant="ghost" onclick={() => openEditItem(item)}>
								<Pencil size={14} />
							</Button>
							<Button size="icon" variant="ghost" onclick={() => data.deleteMenuItem(item._id)}>
								<Trash2 size={14} class="text-destructive" />
							</Button>
						</div>
					</div>
				</div>
			</Card>
		{/each}
	</div>
</div>

<!-- Add/Edit Item Dialog -->
<Dialog bind:open={showItemDialog}>
	<h2 class="text-xl font-bold mb-4">{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
	<div class="space-y-4">
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label class="text-sm font-medium" for="name">Name (English)</label>
				<Input id="name" bind:value={itemForm.name} placeholder="Item name" />
			</div>
			<div>
				<label class="text-sm font-medium" for="nameNe">Name (नेपाली)</label>
				<Input id="nameNe" bind:value={itemForm.nameNe} placeholder="आइटम नाम" />
			</div>
		</div>
		<div>
			<label class="text-sm font-medium" for="desc">Description</label>
			<Textarea id="desc" bind:value={itemForm.description} placeholder="Item description" />
		</div>
		<div class="grid grid-cols-3 gap-3">
			<div>
				<label class="text-sm font-medium" for="cat">Category</label>
				<Select id="cat" bind:value={itemForm.categoryId}>
					{#each data.categories as cat}
						<option value={cat._id}>{cat.name}</option>
					{/each}
				</Select>
			</div>
			<div>
				<label class="text-sm font-medium" for="price">Price (रू)</label>
				<Input id="price" type="number" bind:value={itemForm.price} />
			</div>
			<div>
				<label class="text-sm font-medium" for="prep">Prep Time (min)</label>
				<Input id="prep" type="number" bind:value={itemForm.preparationTime} />
			</div>
		</div>
		<div>
			<label class="text-sm font-medium" for="image">Image</label>
			<input
				id="image"
				type="file"
				accept="image/*"
				class="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
				onchange={(e) => { imageFile = (e.target as HTMLInputElement).files?.[0] ?? null; }}
			/>
		</div>
		<div class="flex items-center gap-6">
			<label class="flex items-center gap-2 text-sm">
				<Switch bind:checked={itemForm.isVeg} />
				Vegetarian
			</label>
			<label class="flex items-center gap-2 text-sm">
				<Switch bind:checked={itemForm.isAvailable} />
				Available
			</label>
		</div>
		<div class="flex justify-end gap-2 pt-2">
			<Button variant="outline" onclick={() => (showItemDialog = false)}>{i18n.t('common.cancel')}</Button>
			<Button onclick={saveItem}>{i18n.t('common.save')}</Button>
		</div>
	</div>
</Dialog>

<!-- Add/Edit Category Dialog -->
<Dialog bind:open={showCategoryDialog}>
	<h2 class="text-xl font-bold mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
	<div class="space-y-4">
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label class="text-sm font-medium" for="catName">Name (English)</label>
				<Input id="catName" bind:value={categoryForm.name} placeholder="Category name" />
			</div>
			<div>
				<label class="text-sm font-medium" for="catNameNe">Name (नेपाली)</label>
				<Input id="catNameNe" bind:value={categoryForm.nameNe} placeholder="श्रेणी नाम" />
			</div>
		</div>
		<div class="flex justify-end gap-2 pt-2">
			<Button variant="outline" onclick={() => (showCategoryDialog = false)}>{i18n.t('common.cancel')}</Button>
			<Button onclick={saveCategory}>{i18n.t('common.save')}</Button>
		</div>
	</div>
</Dialog>
