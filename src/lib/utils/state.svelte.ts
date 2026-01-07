import * as d3 from 'd3';
import { writable } from 'svelte/store';
import visualMentionsNYT from '../../content/data/images/visual_mentions_per_person_and_week_nyt.json';
import visualMentionsZeit from '../../content/data/images/visual_mentions_per_person_and_week_zeit.json';
import coappearanceNYT from '../../content/data/images/visual_coappearance_nyt.json';
import coappearanceZeit from '../../content/data/images/visual_coappearance_zeit.json';
import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLIC_KEY } from '$env/static/public';
    
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLIC_KEY);
export const currentView = writable<'bubblechart' | 'streamgraph'>('streamgraph');
export const selectedOutlet = writable<'NYT' | 'Zeit'>('NYT');
export const currentVisualMentionsDataset = writable<any>(visualMentionsNYT);
export const currentCoappearanceDataset = writable<any>(coappearanceNYT);
export const currentColorDefault = writable<string>('var(--color-nyt-default)');
export const currentColorLight = writable<string>('var(--color-nyt-light)');
// Create a single supabase client for interacting with your database
const newsDesksNYT = ["Politics",
"Washington",
"OpEd",
"Metro",
"NYTNow",
"Business",
"Foreign",
"Graphics",
"Podcasts",
"Letters",
"Culture",
"National",
"Styles",
"Upshot",
"Climate",
"U.S.",
"Briefing",
"Arts",
"Editorial",
"Science",
"Express",
"BookReview",
"Election", 
"Analytics",
"Opinion",
"Magazine",
"Learning",
"Investigative",
"Metropolitan",
"Insider",
"New York",
"RealEstate",
"Dining",
"Well",
"Obits",
"Live",
"Summary",
"SundayBusiness",
"Books",
"Weekend"
]
const newsDesksZeit = [
"News",
"Politik",
"Kultur",
"Wirtschaft",
"Gesellschaft",
"Wissen",
"Digital",
"Hamburg",
"Entdecken",
"Mobilitaet",
"Social Media",
"Video",
"Geld",
"Björn Höcke",
"Olaf Scholz",
"Donald Trump",
"Sinn",
"Sport",
"USA",
"Arbeit"
]
const colorScheme = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'
]
export const colorScale = writable(d3.scaleOrdinal(newsDesksNYT, colorScheme))
selectedOutlet.subscribe((outlet) => {
    if (outlet === 'NYT') {
        currentVisualMentionsDataset.set(visualMentionsNYT);
        currentCoappearanceDataset.set(coappearanceNYT);
        currentColorDefault.set('var(--color-nyt-default)');
        currentColorLight.set('var(--color-nyt-light)');
        colorScale.set(d3.scaleOrdinal(newsDesksNYT, colorScheme))
    } else {
        currentVisualMentionsDataset.set(visualMentionsZeit);
        currentCoappearanceDataset.set(coappearanceZeit);
        currentColorDefault.set('var(--color-zeit-default)');
        currentColorLight.set('var(--color-zeit-light)');
        colorScale.set(d3.scaleOrdinal(newsDesksZeit, colorScheme))
    }
});