<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import nameTranslationMap from '../../content/data/images/name_translations.json';
	import {
		selectedOutlet,
		currentCoappearanceDataset,
		currentVisualMentionsDataset,
		currentColorDefault,
		colorScale
	} from '$lib/utils/state.svelte';
	import ArticlesCardWrapper from '$lib/common/ArticlesCardWrapper.svelte';
	import OutletSelector from '$lib/common/OutletSelector.svelte';
	import { LinkHandler } from '$lib/utils/linkhandler.svelte';
	import { base } from '$app/paths';
	//props
	//setup for the steamgraph svg
	let svg;
	let width = $state(0);
	let height = $state(0);
	let widthDerived = $derived(width * 0.66);
	let loaded = $state(false);
	let loading = $state(false);
	let nodes;
	let links;
	let legendItems;
	let selection1 = $state(null);
	let selection2 = $state(null);
	let simulation = null;
	let selectedPairIDs = $state([]);
	let eligibleSecondSelections = $derived(() => {
		if (selection1 === null) return [];
		return $currentCoappearanceDataset
			.filter(
				(d) => d.personA === selection1 || d.personB === selection1
			)
			.map((d) => (d.personA === selection1 ? d.personB : d.personA));
	});
	selectedOutlet.subscribe((value) => {
		selection1 = null;
		selection2 = null;
		selectedPairIDs = [];
	});
	$effect(() => {
		if (selection1 !== null && selection2 !== null && selectedPairIDs.length === 0) {
			let pair = $currentCoappearanceDataset.find(
				(d) =>
					(d.personA === selection1 && d.personB === selection2) ||
					(d.personA === selection2 && d.personB === selection1)
			);
			if (pair) {
				selectedPairIDs = pair.ids;
				let legend = d3.select('#network-legend');
				legendItems = legend.selectAll('.legendItems').data(Object.keys(pair.news_desks));
				legendItems.exit().remove();
				let legendItemsEnter = legendItems.enter().append('g').attr('class', 'legendItems');
				// Clear previous legend items
				legendItemsEnter.selectAll('rect').remove();
				legendItemsEnter.selectAll('text').remove();
				// Draw legend items

				legendItemsEnter
					.append('rect')
					.attr('x', 10)
					.attr('y', (d, i) => 40 + i * 20)
					.attr('width', 12)
					.attr('height', 12);

				legendItemsEnter
					.append('text')
					.attr('x', 30)
					.attr('y', (d, i) => 50 + i * 20)
					.attr('font-size', 12)
					.attr('fill', 'var(--color-text-default)');

				legendItems = legendItemsEnter.merge(legendItems);

				legendItems.select('rect').attr('fill', (d) => $colorScale(d));

				legendItems.select('text').text((d) => d);

				d3.select('#network-legend').attr('opacity', 1);
			} else {
				selectedPairIDs = [];
				d3.select('#network-legend').attr('opacity', 0);
			}
		} else if (selection1 == null && selection2 == null) {
			selectedPairIDs = [];
			d3.select('#network-legend').attr('opacity', 0);
		}
	});
	onMount(() => {
		svg = d3.select('#network-graph');
		nodes = svg.selectAll('.nodes');
		loaded = true;
		// Start with no bubbles shown
		updateChart();
	});
	function updateChart() {
		const nodesMap = new Map();
		$currentCoappearanceDataset.forEach((d) => {
			if (!nodesMap.has(d.personA)) nodesMap.set(d.personA, { id: d.personA });
			if (!nodesMap.has(d.personB)) nodesMap.set(d.personB, { id: d.personB });
		});
		const nodesData = Array.from(nodesMap.values());
		
		// Expand into individual lines per news_desk per coappearance count
		const expandedLinks = [];
		$currentCoappearanceDataset.forEach((d) => {
			let total = 0;
			let i = 0;
			Object.entries(d.news_desks).forEach(([desk, count]) => {
				total += count;
			});
			Object.entries(d.news_desks).forEach(([desk, count]) => {
				// Create a separate array for this pair + news desk
				const lines = Array.from({ length: count }, (_, j) => ({
					source: d.personA,
					target: d.personB,
					news_desk: desk,
					localTotal: count,
					localIndex: i++, // local index per pair
					total
				}));
				expandedLinks.push(...lines);
			});
		});
		svg.append('g').attr('id', 'network-legend').attr('opacity', 0);

		// --- Force simulation ---
		if (simulation) {
			simulation.stop();
		}
		simulation = d3
			.forceSimulation(nodesData)
			.force(
				'link',
				d3
					.forceLink(expandedLinks)
					.id((d) => d.id)
					.distance((d) => width / 3 / d.total)
			)
			.force('charge', d3.forceManyBody().strength(-400))
			.force('x', d3.forceX(widthDerived / 2).strength(0.2))
			.force('y', d3.forceY(height / 2).strength(0.5))
			.force('collision', d3.forceCollide().radius(50));

		// --- Draw links (balanced curved lines per pair) ---
		svg.selectAll('path').remove();
		svg.selectAll('.nodes').remove();
		links = svg.selectAll('path').data(expandedLinks);
		links.exit().remove();
		const linksEnter = links
			.enter()
			.append('path')
			.attr('class', 'link-curve')
			.attr('fill', 'none')
			.attr('stroke-width', 1)
			.attr('stroke-opacity', 0);

		// --- Draw nodes ---
		nodes = svg.selectAll('.nodes').data(nodesData);
		nodes.exit().remove();
		const nodesEnter = nodes
			.enter()
			.append('g')
			.attr('class', 'nodes')
			.attr('transform', (d) => `translate(${width / 2}, ${height / 2})`)
			.call(drag(simulation));

		nodesEnter
			.append('circle')
			.attr('r', 20)
			.attr('stroke', 'black')
			.attr('class', 'node-circle')
			.attr('fill', 'var(--color-ivory-default)')
			.attr('class', 'cursor-pointer')
			.attr('stroke-width', 1)
			.on('mouseover', function (event, d) {
				if (selection1 != d.id && selection2 != d.id) {
					event.target.setAttribute(
						'fill',
						`var(--color-${$selectedOutlet.toLocaleLowerCase()}-light)`
					);
				}
				event.target.parentNode.querySelector('.selection-bubble').setAttribute('opacity', 1);
			})
			.on('mouseout', function (event, d) {
				if (selection1 != d.id && selection2 != d.id) {
					event.target.setAttribute('fill', `var(--color-ivory-default)`);
				}
				event.target.parentNode.querySelector('.selection-bubble').setAttribute('opacity', 0);
			})
			.on('click', (event, d) => {
				if (selection1 === null) {
					selection1 = d.id;
				} else if (selection2 === null && selection1 !== d.id) {
					selection2 = d.id;
				} else if (selection1 === d.id || selection2 === d.id) {
					selection1 = null;
					selection2 = null;
					if (!loading) {
						selectedPairIDs = [];
					}
				}
			});

		nodesEnter
			.append('circle')
			.attr('class', 'selection-bubble')
			.attr('r', 25)
			.attr('fill', 'none')
			.attr('stroke-width', 1)
			.attr('cx', (d) => 0)
			.attr('cy', (d) => 0)
			.attr('opacity', 0);

		nodesEnter
			.append('image')
			.attr('width', 40)
			.attr('height', 40)
			.attr('x', -20)
			.attr('y', -20)
			.attr('class', 'pointer-events-none')
			.attr('clip-path', `circle(${20}px at center)`);

		let pills = nodesEnter
			.append('foreignObject')
			.attr('y', 23) // position below the bubble
			.attr('height', 30) // height of pill)
			.style('display', 'flex')
			.style('flex-direction', 'row');

		pills
			.append('xhtml:div') // HTML inside SVG
			.style('display', 'inline-block')
			.style('width', 'max-content')
			.style('margin', 'auto')
			.style('padding', '4px 8px')
			.style('backdrop-filter', 'blur(5px)')
			.style('border', '1px solid #999')
			.style('border-radius', '9999px') // pill shape
			.style('font-weight', 'bold')
			.style('font-size', '10px')
			.style('text-align', 'left')
			.style('pointer-events', 'none') // prevent mouse events
			.text((d) => nameTranslationMap[d.id])
			.each(function (d) {
				// measure actual pill width after rendering
				const bb = this.getBoundingClientRect();
				d3.select(this.parentNode) // parent foreignObject
					.attr('width', bb.width * 2)
					.attr('x', -bb.width) // center under node
					.attr('y', 23); // position below the bubble
			});

		nodes = nodesEnter.merge(nodes);
		links = linksEnter.merge(links);

		simulation.on('tick', () => {
			links
				.attr('stroke', (d) => {
					if (selection1 == null || selection2 == null) {
						return $currentColorDefault;
					} else if (
						selection1 != null &&
						selection2 != null &&
						(d.source.id === selection1 || d.source.id === selection2) &&
						(d.target.id === selection1 || d.target.id === selection2)
					) {
						return $colorScale(d.news_desk);
					}
				})
				.attr('stroke-opacity', (d) => {
					if (selection1 == null && selection2 == null) {
						return 1;
					} else if (
						((selection1 != null && selection2 == null) ||
							(selection2 != null && selection1 == null)) &&
						d.source.id !== selection1 &&
						d.target.id !== selection2 &&
						d.source.id !== selection2 &&
						d.target.id !== selection1
					) {
						return 0.05;
					} else if (
						selection1 != null &&
						selection2 != null &&
						d.source.id !== selection1 &&
						d.source.id !== selection2 &&
						d.target.id !== selection1 &&
						d.target.id !== selection2
					) {
						return 0;
					}
				})
				.attr('stroke-width', (d) => {
					if (selection1 == null || selection2 == null) {
						return d.total * 0.4;
					} else {
						return 0.5;
					}
				})
				.attr('d', (d, i) => {
					const sx = d.source.x,
						sy = d.source.y;
					const tx = d.target.x,
						ty = d.target.y;
					if (selection1 == null || selection2 == null) {
						if (d.localIndex == 0) {
							return `M${sx},${sy} L${tx},${ty}`;
						} else {
							return `M0,0 L0,0`;
						}
					} else {
						// Midpoint between the two nodes
						const midX = (sx + tx) / 2;
						const midY = (sy + ty) / 2;

						// Vector from source to target
						const dx = tx - sx;
						const dy = ty - sy;
						const len = Math.sqrt(dx * dx + dy * dy);

						// Perpendicular normalized vector
						const normX = -dy / len;
						const normY = dx / len;

						// Balanced curvature that resets per pair
						const step = Math.abs(d.localIndex + 1 - (d.total + 1) / 2);
						const direction = (d.localIndex + 1) / d.total <= 0.5 ? 1 : -1;
						const curvature = step * 10; // curvature strength for each side

						const controlX = midX + normX * curvature * direction;
						const controlY = midY + normY * curvature * direction;

						// Draw quadratic Bézier curve
						return `M${sx},${sy} Q${controlX},${controlY} ${tx},${ty}`;
					}
				});
			nodes
				.select('div')
				.text((d) => nameTranslationMap[d.id])
				.each(function (d) {
					// measure actual pill width after rendering
					const bb = this.getBoundingClientRect();
					d3.select(this.parentNode) // parent foreignObject
						.attr('width', bb.width)
						.attr('x', -bb.width / 2) // center under node
						.attr('y', 23); // position below the bubble
				});
			nodes.select('.node-circle').attr('fill', 'var(--color-ivory-default)');
			nodes.select('.selection-bubble').attr('stroke', $currentColorDefault);
			nodes
				.attr('transform', (d) => `translate(${d.x},${d.y})`)
				.attr('opacity', (d) => {
					if (selection1 == null && selection2 == null) {
						return 1;
					} else if (
						(selection1 != null && selection2 == null) &&
						(eligibleSecondSelections().includes(d.id) || d.id === selection1)
					) {
						return 1;
					} else if (
						(selection1 != null && selection2 != null) &&
						(d.id === selection1 || d.id === selection2)
					) {
						return 1;
					}else {
						return 0.05
					}
				});

			nodes.select('circle').attr('fill', (d) => {
				if (d.id === selection1 || d.id === selection2) {
					return $currentColorDefault;
				} else {
					return 'var(--color-ivory-default)';
				}
			});

			nodes.select('image').attr('xlink:href', (d) => `${base}/img/people/${d.id}.webp`);
		});

		// --- Dragging behavior ---
		function drag(simulation) {
			function dragstarted(event, d) {
				if (!event.active) simulation.alphaTarget(0.3).restart();
				d.fx = d.x;
				d.fy = d.y;
			}
			function dragged(event, d) {
				d.fx = event.x;
				d.fy = event.y;
			}
			function dragended(event, d) {
				if (!event.active) simulation.alphaTarget(0);
			}
			return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
		}
	}
	// auto update the chart on change of the dataset
	$effect(() => {
		if ($selectedOutlet && loaded) {
			updateChart();
		}
	});
</script>

{#snippet selectionPill(selection)}
	<span class="w-fit rounded-full border bg-[var(--color-ivory-default)] px-3 "
		><img class="mr-1 inline pb-px" src={LinkHandler("/icons/ui-interact.svg")} />{nameTranslationMap[selection] ??
			'Selection 1'}</span
	><span
		class="-z-2 -ml-8 grow rounded-full border bg-black px-3 pr-4 pl-10 text-right text-white -pb-px"
		>{$currentVisualMentionsDataset.data[selection]?.total ?? '–'} images</span
	>
{/snippet}
{#snippet context()}
	The network graph visualizes co-appearances of public figures in news images. Each node represents a person, and edges indicate instances where two individuals appeared together in the same image. The thickness and color of the edges correspond to the frequency and context (news desk) of these co-appearances. You can select up to two persons by clicking on their respective nodes to explore their shared visual representation in news coverage. The legend indicates the news desks associated with the co-appearances.
{/snippet}
{#snippet legend()}
	<img src={LinkHandler("/img/images-networkgraph-legend.svg")} class="my-2 w-full" alt="" />
{/snippet}
{#snippet data()}
	<div class="col-span-2 text-center" slot="data">
		<div class="flex flex flex-wrap gap-2">
			<div class="flex w-full">
				{@render selectionPill(selection1)}
			</div>
			<div class="flex w-full">
				{@render selectionPill(selection2)}
			</div>
			<div class="flex w-full">
				<span class="z-10 rounded-full border bg-[var(--color-ivory-default)] px-3"
					>Co-Appearances</span
				><span
					class="-z-2 -ml-8 grow rounded-full border bg-black px-3 pr-4 pl-10 text-right text-white"
					>{selectedPairIDs.length == 0 ? '–' : selectedPairIDs.length} images</span
				>
			</div>
		</div>
		<div class="flex items-start justify-start gap-2"></div>
	</div>
{/snippet}
<div class="grid h-3/4 w-full grid-cols-9" bind:clientWidth={width} bind:clientHeight={height}>
	<svg class="col-span-6" width={widthDerived} {height} id="network-graph"> </svg>
	<div class="col-span-3 flex flex-col items-center gap-4 p-6">
		<OutletSelector/>
		<ArticlesCardWrapper ids={selectedPairIDs} {context} {legend} {data} />
	</div>
</div>
