<script>
	import scrollama from 'scrollama';
	import { onMount } from 'svelte';
	import visualStoryline from '../../content/data/images/visual_mentions_storyline.json';
	import rawIntroText from '@/content/images/images-intro.md?raw';
	import rawOutroText from '@/content/images/images-outro.md?raw';

	import BlocksRenderer from '$lib/common/BlocksRenderer.svelte';
	import ImageStreamgraph from '$lib/images/ImageStreamgraph.svelte';
	import ImageNetworkgraph from '$lib/images/ImageNetworkgraph.svelte';
	import ImageBubblechart from '$lib/images/ImageBubblechart.svelte';
	import { currentView, selectedOutlet } from '$lib/utils/state.svelte';
	import { LinkHandler } from '$lib/utils/linkhandler.svelte';

	//scrollama setup
	let step = $state(0);
	let selectedWeek = $state('');
	let selectedPeople = $state([]);
	onMount(async () => {
		currentView.set('streamgraph');
		scrollama()
			.setup({
				step: '.step',
				offset: 0.5,
				debug: false
			})
			.onStepEnter((response) => {
				step = response.index;
				if (visualStoryline[step] && step > 0) {
					selectedPeople = [...visualStoryline[step][$selectedOutlet]];
				}
			});
		window.setTimeout(() => {
			let video = document.querySelector('#intro-video');
			video.style.opacity = 1;
			video.play();
		}, 500);
	});
	$effect(() => {
		if ($selectedOutlet) {
			selectedPeople = [...visualStoryline[step][$selectedOutlet]];
		}
	});
</script>

{#snippet pillOutlet(text, outlet)}
	<button
		type="button"
		class="flex inline-block w-max gap-2 hover:bg-[var(--color-ivory-light)]"
		class:bg-[var(--color-nyt-light)]={outlet === 'NYT'}
		class:bg-[var(--color-zeit-light)]={outlet === 'Zeit'}
		onclick={() => selectedOutlet.set(outlet)}
	>
		<img class="mb-px inline" src={LinkHandler("/icons/ui-interact.svg")} alt="" /> <span>{text}</span>
	</button>
{/snippet}
{#snippet pillInteract(text)}
	<span
		class="flex inline-block w-max gap-2 rounded-full border px-2 py-px hover:bg-[var(--color-ivory-light)]"
	>
		<img class="mb-px inline" src={LinkHandler("/icons/ui-interact.svg")} alt="" /> <span>{text}</span>
	</span>
{/snippet}
{#snippet pill(text)}
	<span class="flex inline-block w-max gap-px font-bold">
		<img class="inline max-w-[25px] pb-px" src={LinkHandler("/img/images-person.svg")} alt="" /> <span>{text}</span>
	</span>
{/snippet}
<div class="base m-auto w-11/12 pt-20" class:opacity-0={!true} class:opacity-100={true}>
	<div id="images-essay">
		<div class="h-[90vh] grid items-center justify-items-center">
					<video id="intro-video" class="relative z-10 opacity-0" src={LinkHandler("/img/images_teaser_desktop.webm")} muted loop
		></video>
		</div>

		<section id="intro" class="mb-30">
			<div class="m-auto w-full md:w-3/7">
				<BlocksRenderer rawtext={rawIntroText} />
			</div>
		</section>
		<section id="scrolly-1" class="md:flex md:flex-row-reverse">
			{#if $currentView == 'bubblechart'}
				<figure class="sticky top-20 h-dvh w-full basis-full">
					<ImageBubblechart bind:selectedWeek bind:selectedPeople />
				</figure>
			{:else if $currentView == 'streamgraph'}
				<figure class="sticky top-20 h-dvh w-full basis-1/2 p-6 md:basis-6/9 xl:p-4">
					<ImageStreamgraph bind:selectedWeek bind:selectedPeople />
				</figure>
			{/if}
			<article
				class={`relative w-full basis-1/2 md:basis-3/9 ${$currentView == 'bubblechart' ? 'invisible !w-0 !basis-0' : ''}`}
			>
				<div data-step="0" class="step p-6" style="height: 150vh;">
					<div class="table-cell align-middle">
						<h2 class="pb-4 font-serif text-xl">Visual Stockpile</h2>
						<p>
							Which persons are visually represented in article teaser images and why? The streamgraph on the
							right represents the weekly number of images for the top 15 people represented in Zeit Online
							and The New York Times. As the amount of images would be too big for the visualization, each
							bubble represents 10 visual appearances of a person in a week. You can alter the shown people in
							the visualization by toggling their respective name in the pills above the visualization. If you
							want to inspect the distribution of visual appearances for a specific week, you can click on one
							of the bubbles. Lastly, you can change the outlet shown by the visualization by clicking on the
							newspapers in the text:<br /><br />
							{@render pillOutlet('The New York Times', 'NYT')} and {@render pillOutlet(
								'Zeit Online',
								'Zeit'
							)}
						</p>
					</div>
				</div>
				<div data-step="1" class="step p-6" style="height:150vh">
					<div class="table-cell align-middle leading-relaxed">
						<h3 class="text-xl font-bold">Most Mentioned</h3>
						<p>
							To begin, the individuals most frequently referenced in both newspapers are {@render pill(
								'Donald Trump'
							)}
							and {@render pill('Olaf Scholz')}. Each ranks as the most prominently depicted figure within
							their countries respective publication. Notably, however, while {@render pillOutlet(
								'Zeit Online',
								'Zeit'
							)} lists Donald Trump as the second most visually represented individual, Olaf Scholz does not appear
							among the top 15 in The New York Times.
							<br /><br />
							Donald Trump dominates the visual landscape of {@render pillOutlet('The New York Times', 'NYT')}
							and is very present in Zeit Online, although he is not president for most of the time observed. This
							could be due to the immediacy of the U.S. elections, his ongoing controversial statements and pick
							of staff.
						</p>
					</div>
				</div>
				<div data-step="3" class="step p-6 leading-relaxed" style="height:150vh">
					<h3 class="text-xl font-bold">Governments</h3>
					<p>
						Individuals affiliated with the government or its opposition are represented at disproportionately
						high levels compared to other prominent figures from popular culture. In the case of {@render pillOutlet(
							'Zeit Online',
							'Zeit'
						)}, this includes government officials such as {@render pill('Robert Habeck')},
						{@render pill('Annalena Baerbock')} and {@render pill('Christian Lindner')}, as well as opposition
						figures like {@render pill('Markus Söder')}
						and {@render pill('Friedrich Merz')}.
						<br /><br />
						Similarly, {@render pillOutlet('The New York Times', 'NYT')} highlights government representatives
						such as {@render pill('Kamala Harris')}
						and {@render pill('Anthony Blinken')}, alongside opposition leaders including {@render pill(
							'Mike Johnson'
						)} and {@render pill('Nikki Haley')}. However, compared to the relatively stable coverage of
						opposition figures in Zeit Online, NYT’s overall coverage of opposition figures is limited and are
						mostly directly or indirectly linked to Donald Trump.
					</p>
				</div>
				<div data-step="3" class="step p-6 leading-relaxed" style="height:150vh">
					<h3 class="text-xl font-bold">US Elections</h3>
					Furthermore, the U.S. presidential election of November 2024 emerged as a major event that substantially
					increased the visual mentions of certain individuals. A particularly notable phenomenon in this context
					is the abrupt decline in visual references following the withdrawal of {@render pill('Joe Biden')} from
					the presidential race. In contrast, {@render pill('Kamala Harris')}, who had previously been largely
					absent from visual reporting, experiences a pronounced rise in visual mentions. This pattern is
					especially evident in {@render pillOutlet('The New York Times', 'NYT')}, where visual references to
					Harris also cease following her defeat in November 2024. Although a similar trend can be observed in {@render pillOutlet(
						'Zeit Online',
						'Zeit'
					)}, the overall magnitude is considerably lower, and Kamala Harris appears far less frequently than
					in the NYT.
				</div>
				<div data-step="4" class="step p-6 leading-relaxed" style="height:150vh">
					<h3 class="text-xl font-bold">Conflicts</h3>
					The figures involved in the political dimensions of contemporary conflicts are likewise disproportionately
					represented visually. In both newspapers, {@render pill('Vladimir Putin')} ranks among the most frequently
					depicted individuals, especially in {@render pillOutlet('Zeit Online', 'Zeit')}. This prominence can
					be attributed to the continued relevance of the ongoing war in Ukraine. Notably, Zeit Online also
					features {@render pill('Volodymyr Zelenskyy')}, who does not appear among the top 15 figures in The
					New York Times, which could be explained by the U.S. government's concentrated diplomatic effort on
					Russia.
					<br /><br />
					In contrast, {@render pillOutlet('The New York Times', 'NYT')} provides substantially greater coverage
					of the ongoing war in Gaza, resulting in a more frequent visual presence of {@render pill(
						'Benjamin Netanyahu'
					)}, who doesn’t make it to the top 15 in Zeit Online. This can be attributed to the observed
					imbalance of coverage of Zeit Online on the Gaza war and a less critical tone towards the actions of
					Netanyahu’s cabinet.
				</div>
				<div data-step="5" class="step p-6 leading-relaxed" style="height:100vh">
					<h3 class="text-xl font-bold">Editorial Particularities</h3>
					Finally, newspaper-specific areas of emphasis further illuminate their distinct editorial orientations.
					In the case of {@render pillOutlet('Zeit Online', 'Zeit')}, there is a notable concentration of
					visual references to national politician
					{@render pill('Sahra Wagenknecht')} and to local political actors such as {@render pill(
						'Dietmar Woidtke'
					)}. Moreover, the outlet demonstrates a particular interest in {@render pill('Christian Lindner')},
					who has faced accusations of undermining his own coalition government.
					<br /><br />
					In contrast, {@render pillOutlet('The New York Times', 'NYT')} devotes considerable visual attention
					to individuals closely associated with Donald Trump’s presidential campaign, including {@render pill(
						'JD Vance'
					)} and {@render pill('Elon Musk')}. The newspaper also features more controversial figures, such as {@render pill(
						'Robert Kennedy'
					)}, with notable frequency.
				</div>
			</article>
		</section>
		<section class="mt-2">
			<article class="m-auto w-full md:w-3/7">
				<h2 class="pb-4 font-serif text-xl">Visual Co-appearances</h2>
				<p>
					While individual visibility highlights which public figures dominate the visual field of a
					newspaper, visual co-appearances reveal how newsrooms construct relationships, oppositions, and
					political constellations. When two political actors appear together in the same image, this
					juxtaposition often encodes editorial interpretations of alliances, institutional proximity,
					rivalry, or shared involvement in major events. Analyzing these co-appearances therefore provides
					insight into how newspapers visually stage political dynamics.
				</p>
				<br>
				<p>
					For <span class="zeit">Zeit Online</span>, co-appearances are dominated by intra-German political
					relations. The most frequent visual pairings involve key government figures—most notably Olaf
					Scholz, Christian Lindner and Robert Habeck, who each individually appear together across more than
					a dozen images. These repeated pairings reflect the centrality of coalition politics in the national
					news agenda and illustrate how the newspaper frames the internal workings and public presence of the
					governing alliance. Similarly, Friedrich Merz frequently co-appears with Markus Söder, highlighting
					the visibility of opposition leadership. In contrast, international figures appear far less often in
					joint depictions. Exceptions include occasional images pairing Olaf Scholz or Annalena Baerbock with
					Volodymyr Zelenskyy, reflecting coverage of German involvement and support in the Ukraine conflict.
				</p>
				<br>
				<p>
					Overall, Zeit’s visual pairings emphasize coalition governance, domestic conflict, and regional
					political networks—a pattern consistent with its editorial focus on German national politics.
				</p>
				<br>
				<p>
					In <span class="nyt">The New York Times</span>, visual co-appearances reflect a markedly different
					structure. The most frequent pairing by far is Donald Trump with his lawyer Todd Blanche, appearing
					across over sixty images. This extraordinarily high volume underscores the centrality of Trump’s
					legal challenges in NYT’s visual narrative. It is also disproportionally represented in the
					co-appearances dataset and indicates an editorial focus on this relationship, as it has provided
					Blanche an official position in the government, indicating cronyism. Election-related pairings are
					similarly prominent. Donald Trump frequently co-appears with Kamala Harris, but these are largely
					found in graphics, opinion pages, and NYT Now—often representing hypothetical matchups or
					comparative analyses rather than literal photographic scenes. This is interesting, in the sense that
					the two candidates have not physically met prior to their TV duel but are frequently shown. 
				</p>
				<br>
				<p>
					NYT’s co-appearances dataset also reveals the newspaper’s focus on the shifting political coalitions
					surrounding Trump’s candidacy, while political figures from Joe Biden’s government are visually
					omitted. For instance, images pairing Donald Trump with JD Vance, or appearances of JD Vance with
					Tim Walz, visually foreground the evolving electoral landscape and vice-presidential contest.
					International co-appearances remain rare and episodic. Images pairing Benjamin Netanyahu with Joe
					Biden or Kamala Harris appear only a handful of times, primarily tied to U.S. diplomatic engagement
					in the Gaza conflict. Co-appearances involving Vladimir Putin are extremely limited, reflecting a
					narrower visual focus on Russia in comparison to Zeit.
				</p>
				<br>
				<p>
					In sum, NYT’s co-appearance patterns center on legal proceedings, electoral competition, and key
					moments in U.S. foreign policy, with image pairings used to stage political conflict, institutional
					relationships, and campaign dynamics.
				</p>
			</article>
			<figure class="h-screen w-full p-4 xl:p-4 xl:pt-20">
				<ImageNetworkgraph />
			</figure>
		</section>
		<section class="mt-2" id="outro">
			<div class="m-auto w-full md:w-3/7">
				<BlocksRenderer rawtext={rawOutroText} />
			</div>
		</section>
	</div>
</div>
