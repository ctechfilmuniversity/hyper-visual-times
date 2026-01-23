<script lang="ts">
	import IntroductionTile from '$lib/main/IntroductionTile.svelte';
	import rawIntroText from '@/content/main-intro.md?raw';
	import rawEssayText from '@/content/main-essay.md?raw';
	import rawOutroText from '@/content/main-outro.md?raw';
	import scrollama from 'scrollama';
	import BlocksRenderer from '$lib/common/BlocksRenderer.svelte';
	import Illustration from '$lib/main/Illustration.svelte';
	import Chapters from '$lib/main/Chapters.svelte';
	import Load from '$lib/common/Load.svelte';
	import About from '$lib/main/About.svelte';
	import { LinkHandler } from '$lib/utils/linkhandler.svelte.ts';
	import { onMount } from 'svelte';
	import { getArticles } from '$lib/utils/request.svelte.ts';


	// init scroller for scrollytelling
	const scroller = scrollama();
	let step = $state(0);
	let direction: 'up' | 'down' | null = $state(null);
	// checks if essay is rendered
	let essayIsRendered = $state(false);
	// checks if essay has step to attach scroller
	let essayHasSteps = $state(false);
	// get body width to decide which graphic to load
	let bodyWidth: number = $state(0);
	let data = $state<any>(null);
	onMount(async () => {
		await fetchData(0);

	});
	async function fetchData(numberOfTries) {
		try {
			let randomZeitSelection = await getArticles('zeit', [
				'2024-01-209251386',
				'2024-01-230179681',
				'2024-01-229968742',
				'2024-01-230174863'
			]);
			let randomNYTSelection = await getArticles('nyt', [
				'nyt://article/007aece2-7926-5653-9d0c-2221b9f363b2',
				'nyt://article/007afda5-8628-520a-9dc0-0c4c30697599',
				'nyt://article/007ba0db-2193-5f5f-9183-b128bee142e1',
				'nyt://article/003d9955-5a7d-5b37-8e8d-780b1d3732e5'
			]);
			console.log(randomNYTSelection, randomZeitSelection);
			data = {
				randomZeitSelection: randomZeitSelection?.data ?? [],
				randomNYTSelection: randomNYTSelection?.data ?? []
			};
		} catch (error) {
			console.error(`Error fetching data:${error}, try: ${numberOfTries}`);
			if (numberOfTries < 2) {
				await new Promise((resolve) => setTimeout(resolve, 500)); // wait before retrying
				await fetchData(numberOfTries + 1);
			}
		}
		if (data.randomNYTSelection.length < 4 || data.randomZeitSelection.length < 4) {
			if (numberOfTries < 2) {
				await new Promise((resolve) => setTimeout(resolve, 100)); // wait before retrying
				await fetchData(numberOfTries + 1);
			}

		}
	}
	// trigger initial scroll on button click
	function handleInitScroll() {
		scrollTo({ top: 600, behavior: 'smooth' });
	}

	// the event is dispatched from BlockRenderer component if scrolly
	function onEssayRender(data: { isEssayRendered: boolean; hasSteps: boolean }) {
		essayIsRendered = data.isEssayRendered;
		essayHasSteps = data.hasSteps;
	}

	function scrollToParagraph(paragraph: string) {
		const el = document.getElementById(`${paragraph}`);
		console.log(el);
		if (!el) return;
		el.scrollIntoView({
			behavior: 'smooth'
		});
	}

	$effect(() => {
		if (essayIsRendered && essayHasSteps) {
			// Wait a bit more to ensure DOM is ready
			setTimeout(() => {
				scroller
					.setup({
						step: '.step',
						debug: false,
						offset: 0.7,
						progress: true
					})
					.onStepEnter((response) => {
						step = response.index;
						direction = response.direction;
					})
					.onStepProgress((response) => {})
					.onStepExit((response) => {});
			}, 200);
		}
	});
</script>

{#if data}
	<div
		class="bg-ivory-default/90 fixed fixed z-100 h-[200vh] w-full overflow-hidden backdrop-blur-sm md:hidden"
	>
		<div class="flex h-[98vh]">
			<p class="m-4 inline-block self-center text-center align-middle">
				Your device is too small. This visualization tool requires a large viewport to be used
				meaningfully! Please switch tablet or desktop computer.
			</p>
		</div>
	</div>
	<main
		bind:clientWidth={bodyWidth}
		class:opacity-0={!essayIsRendered}
		class:opacity-100={essayIsRendered}
	>
		<div class="z-0 m-auto" id="intro">
			<div class="m-auto w-full md:w-11/12">
				<div class="h-dvh w-full 2xl:max-h-[80vh]">
					<IntroductionTile {data} />
				</div>
				<div class="absolute bottom-10 left-0 w-full">
					<div class="grid justify-items-center">
						<button class="bg-ivory-default" onclick={handleInitScroll}>
							<span>Scroll down to read</span>
							<span
								><img
									class="inline"
									src={LinkHandler('/icons/ui-scroll.svg')}
									alt="Arrow pointing downwards"
								/></span
							>
						</button>
					</div>
				</div>
				<div class="m-auto grid h-2 w-11/12 grid-cols-11">
					<div class="col-span-5 border-b"></div>
					<div class="col-span-1 m-auto w-1/2">
						<img src={LinkHandler('/img/pn-logo.png')} alt="Publication logo" />
					</div>
					<div class="col-span-5 border-b"></div>
				</div>
				<div class="m-auto my-10 w-10/12 md:flex">
					<div class="w-full md:w-3/10">
						<div class="my-10 md:my-5">
							<p class="border-b pb-4 italic">
								This website contains a series of reflections on the circulation and consumption
								patterns of news in the digital environment. Using metadata from several newsrooms’
								archives, each experiment deals with a feature of digital news: keywords, text, and
								images. Using a combination of computational methods, three individual chapters
								pivot around a series of design and data visualization experiments with news data.
							</p>
							<div>
								<h4 class="pt-4 pb-2">Browse by chapter:</h4>
								<div>
									<ul>
										<li class="pb-4">
											<button class="flex items-center px-2 py-[2px]"
												><div
													class="mr-[5px] h-[15px] w-[15px] animate-pulse rounded-xl bg-green-500"
												></div>
												<a href={LinkHandler('/places')}>The Geo-politics of News</a></button
											>
										</li>
										<li class="pb-4">
											<button class="flex items-center px-2 py-[2px]"
												><div
													class="mr-[5px] h-[15px] w-[15px] animate-pulse rounded-xl bg-green-500"
												></div>
												<a href={LinkHandler('/topics')}>Discoursive Interrelations</a></button
											>
										</li>
										<li class="pb-4">
											<button class="flex items-center px-2 py-[2px]"
												><div class="mr-[5px] h-[15px] w-[15px] rounded-xl bg-green-500"></div>
												<a href={LinkHandler('/images')}>Person of Interest</a></button
											>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
					<div class="w-full pl-2 md:w-7/10">
						<BlocksRenderer rawtext={rawIntroText} />
					</div>
				</div>
			</div>
			<div class="z-0 m-auto w-full">
				<section>
					<figure class="sticky top-10 h-[80vh] h-dvh w-full">
						<Illustration {step} {bodyWidth} {direction} />
					</figure>
					<article class="relative w-full">
						<BlocksRenderer rawtext={rawEssayText} {onEssayRender} />
						<div class="sticky bottom-10 pl-10">
							{#if direction === 'up'}
								<div>
									<button
										class="bg-ivory-default"
										onclick={() => {
											scrollToParagraph('intro');
										}}>Go back to intro</button
									>
								</div>
							{:else}
								<button
									class="bg-ivory-default"
									onclick={() => {
										scrollToParagraph('chapters');
									}}>Skip to chapters</button
								>
							{/if}
						</div>
					</article>
				</section>
				<section id="chapters" class="m-auto w-11/12">
					<div>
						<Chapters />
					</div>
				</section>
				<section class="py-10">
					<div>
						<About />
					</div>
				</section>
				<section>
					<BlocksRenderer rawtext={rawOutroText} />
				</section>
			</div>
		</div>
	</main>
{/if}

<!-- Loading state -->
{#if !essayIsRendered}
	<Load />
{/if}
