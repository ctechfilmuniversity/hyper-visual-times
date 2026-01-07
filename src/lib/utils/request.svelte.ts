import { supabase } from "$lib/utils/state.svelte";
export async function getArticles(source, ids){
    return await supabase.from(`${source}_articles`).select("_id,headline, web_url, snippet, multimedia, pub_date, byline,news_desk").in("_id", ids);
}
export async function getCoveragePerCountry(){
    let { data } = await supabase.from("coverage_by_country").select();
    let { data: coverageByRegion } = await supabase.from("regions").select();
    return {
      data: data ? await data.map((d)=>{
        return {
          country: d.country,
          coords: [
            +d.Latitude,
            +d.Longitude
          ],
          count_zeit: +d.count_of_articles_zeit,
          count_nyt: +d.count_of_articles_nyt,
          iso: d.iso_alpha3,
          ids_of_articles_zeit: d.ids_of_articles_zeit,
          ids_of_articles_nyt: d.ids_of_articles_nyt,
          keywords_zeit: JSON.parse(d.keywords_zeit),
          keywords_nyt: JSON.parse(d.keywords_nyt)
        };
      }) : [],
      coverageByRegion: coverageByRegion && coverageByRegion[0] ? await JSON.parse(coverageByRegion[0].data) : null
    }
}