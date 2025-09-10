export function normalize(text){
  return text.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^\w\s]/g,"")
    .trim();
}

export function levenshtein(a,b){
  const matrix=[];
  for(let i=0;i<=b.length;i++) matrix[i]=[i];
  for(let j=0;j<=a.length;j++) matrix[0][j]=j;
  for(let i=1;i<=b.length;i++){
    for(let j=1;j<=a.length;j++){
      if(b[i-1]===a[j-1]) matrix[i][j]=matrix[i-1][j-1];
      else matrix[i][j]=Math.min(matrix[i-1][j-1]+1, matrix[i][j-1]+1, matrix[i-1][j]+1);
    }
  }
  return matrix[b.length][a.length];
}

// 🔹 Similarity mejorada: compara palabra por palabra
export function similarity(a,b){
  const wordsA = normalize(a).split(/\s+/);
  const wordsB = normalize(b).split(/\s+/);
  let totalScore = 0;

  wordsA.forEach(wordA => {
    let best = 0;
    wordsB.forEach(wordB => {
      const score = 1 - levenshtein(wordA, wordB)/Math.max(wordA.length, wordB.length);
      if(score > best) best = score;
    });
    totalScore += best;
  });

  return totalScore / Math.max(wordsA.length, wordsB.length);
}
