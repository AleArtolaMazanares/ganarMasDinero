import fetch from 'node-fetch';

export async function searchWikipedia(query){
  try{
    const url = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    if(data.query && data.query.search && data.query.search.length>0){
      const textos = data.query.search.slice(0,2)
        .map(item => item.snippet.replace(/<\/?[^>]+(>|$)/g, ""));
      return textos.join(". ") + (textos.length>1 ? "..." : "");
    }
    return "No encontré información clara.";
  }catch(err){
    console.error("Error Wikipedia API:", err);
    return "Error consultando Wikipedia 😢";
  }
}

export function extractSummary(wikiText, maxLength = 300){
  if(!wikiText) return null;
  // Tomamos solo la primera oración
  const firstSentence = wikiText.split('. ')[0];
  // Limitamos la longitud
  return firstSentence.length > maxLength ? firstSentence.slice(0, maxLength) + '...' : firstSentence;
}
