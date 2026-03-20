<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
	{#each Array(6) as _}
		<div class="overflow-hidden rounded-2xl border border-border bg-card">
			<div class="h-40 animate-pulse bg-muted"></div>
			<div class="space-y-3 p-6">
				<div class="flex gap-2">
					<div class="h-5 w-16 animate-pulse rounded-full bg-muted"></div>
					<div class="h-5 w-14 animate-pulse rounded-full bg-muted"></div>
				</div>
				<div class="h-5 w-3/4 animate-pulse rounded bg-muted"></div>
				<div class="h-4 w-full animate-pulse rounded bg-muted"></div>
				<div class="flex items-center justify-between pt-2">
					<div class="h-6 w-20 animate-pulse rounded bg-muted"></div>
					<div class="h-9 w-20 animate-pulse rounded-full bg-muted"></div>
				</div>
			</div>
		</div>
	{/each}
</div>
