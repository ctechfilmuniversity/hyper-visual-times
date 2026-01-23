<script lang="ts">
	import ArticlesRow from './ArticlesRow.svelte';
	import MainLogo from './MainLogo.svelte';
	let { data } = $props();
	let w = $state(0);
	let NYTSelectionBasedOnW = $derived(
		w <= 400 ? data.randomNYTSelection.slice(0, 2) : data.randomNYTSelection
	);
	let ZeitSelectionBasedOnW = $derived(
		w <= 400 ? data.randomZeitSelection.slice(0, 2) : data.randomZeitSelection
	);

	const colClasses: Record<number, string> = {
		0: 'md:col-start-2 xl:col-start-3 2xl:col-start-6 col-span-2',
		1: 'md:col-start-4 xl:col-start-5 2xl:col-start-8 col-span-2',
		2: 'md:col-start-6 xl:col-start-7 2xl:col-start-10 col-span-2',
		3: 'md:col-start-8 xl:col-start-9 2xl:col-start-12 col-span-2'
	};
</script>

<div class="h-full w-full" bind:clientWidth={w}>
	<MainLogo />
	<div class="absolute top-15 m-auto h-full w-full md:left-0 md:w-11/12 md:w-full">
		<div class="relative -z-10 h-full w-full xl:h-[95vh] 2xl:h-[76.6vh]">
			<div class="grid h-full grid-cols-4 md:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-18">
				{#each NYTSelectionBasedOnW as article, a}
					<div
						class={`${colClasses[a]}}`}
					></div>
				{/each}
			</div>
		</div>
		<div class="absolute top-10 w-fit md:top-15 md:left-0">
			<div
				class="m-auto grid w-11/12 grid-cols-4 md:w-full md:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-18"
			>
				{#await NYTSelectionBasedOnW}
					<div></div>
				{:then NYTSelectionBasedOnW}
					{#each NYTSelectionBasedOnW as article, a}
						<div class={`${a % 2 !== 0 ? '-z-10' : ''} ${colClasses[a]}`}>
							<ArticlesRow {article} {a} />
						</div>
					{/each}
				{/await}
			</div>
		</div>
		<div class="absolute top-65 w-fit md:top-85 md:left-0">
			<div
				class="m-auto grid w-11/12 grid-cols-4 md:w-full md:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-18"
			>
				{#await ZeitSelectionBasedOnW}
					<div></div>
				{:then ZeitSelectionBasedOnW}
					{#each ZeitSelectionBasedOnW as article, a}
						<div class={`${a % 2 === 0 ? '-z-10' : ''} ${colClasses[a]}`}>
							<ArticlesRow {article} {a} />
						</div>
					{/each}
				{/await}
			</div>
		</div>
	</div>
</div>
