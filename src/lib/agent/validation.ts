export interface RawFact {
  entity: string;
  metric: string;
  value: string;
  date?: string;
  sourceId: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceReliability: number;
}

export interface ValidatedFact {
  id: string;
  entity: string;
  metric: string;
  value: string;
  date?: string;
  sourceId: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceReliability: number;
  parsedNumber?: number;
  isOutlier: boolean;
  confidence: number; // 0 to 1
  contradictsFactId?: string;
  reasoning?: string;
}

export interface Contradiction {
  metric: string;
  factA: ValidatedFact;
  factB: ValidatedFact;
  deviationPercent: number;
}

export interface ValidationResult {
  facts: ValidatedFact[];
  contradictions: Contradiction[];
  overallConfidenceScore: number; // 0 to 100
  outlierAnalysisSummary: string;
}

/**
 * Parses numeric values from arbitrary strings (e.g. "88.4 million" -> 88400000)
 */
export function parseNumericValue(valStr: string): number | null {
  const clean = valStr.toLowerCase().replace(/[^0-9.kmb]/g, "").trim();
  if (!clean) return null;
  
  const numMatch = clean.match(/^[0-9.]+/);
  if (!numMatch) return null;
  
  let num = parseFloat(numMatch[0]);
  if (isNaN(num)) return null;
  
  if (clean.includes("b") || valStr.toLowerCase().includes("billion")) {
    num *= 1_000_000_000;
  } else if (clean.includes("m") || valStr.toLowerCase().includes("million")) {
    num *= 1_000_000;
  } else if (clean.includes("k") || valStr.toLowerCase().includes("thousand")) {
    num *= 1_000;
  }
  
  return num;
}

/**
 * Performs outlier detection, contradiction flag, and scores overall data consensus
 */
export function crossValidateFacts(rawFacts: RawFact[]): ValidationResult {
  const validatedFacts: ValidatedFact[] = rawFacts.map((rf, idx) => ({
    id: `fact-${idx}`,
    entity: rf.entity,
    metric: rf.metric,
    value: rf.value,
    date: rf.date,
    sourceId: rf.sourceId,
    sourceUrl: rf.sourceUrl,
    sourceTitle: rf.sourceTitle,
    sourceReliability: rf.sourceReliability,
    parsedNumber: parseNumericValue(rf.value) || undefined,
    isOutlier: false,
    confidence: rf.sourceReliability,
  }));

  const contradictions: Contradiction[] = [];
  
  // Group facts by metric to analyze clusters
  const metricGroups: { [key: string]: ValidatedFact[] } = {};
  validatedFacts.forEach(f => {
    const key = f.metric.toLowerCase();
    if (!metricGroups[key]) metricGroups[key] = [];
    metricGroups[key].push(f);
  });

  let outlierCount = 0;
  let totalAnalyzedGroups = 0;
  let totalGroupConfidences = 0;
  let analysisNotes: string[] = [];

  // Analyze each metric group
  Object.keys(metricGroups).forEach(metricKey => {
    const group = metricGroups[metricKey];
    const numericFacts = group.filter(f => f.parsedNumber !== undefined);
    
    if (numericFacts.length < 2) {
      // Not enough data to cross-validate, trust the source reliability
      group.forEach(f => {
        f.confidence = f.sourceReliability;
      });
      totalAnalyzedGroups++;
      totalGroupConfidences += group[0]?.sourceReliability || 0.8;
      return;
    }

    totalAnalyzedGroups++;

    // Calculate median of parsed numbers
    const sortedVals = numericFacts.map(f => f.parsedNumber!).sort((a, b) => a - b);
    const mid = Math.floor(sortedVals.length / 2);
    const medianVal = sortedVals.length % 2 !== 0 ? sortedVals[mid] : (sortedVals[mid - 1] + sortedVals[mid]) / 2;

    // Detect outliers: any value that deviates by more than 35% from the median is flagged
    // especially if its source has lower reliability
    numericFacts.forEach(f => {
      const val = f.parsedNumber!;
      const pctDeviation = Math.abs(val - medianVal) / (medianVal || 1);
      
      if (pctDeviation > 0.35) {
        f.isOutlier = true;
        f.confidence = Math.max(0.1, f.sourceReliability * (1 - pctDeviation));
        f.reasoning = `Flagged as outlier: deviates from median (${(pctDeviation * 100).toFixed(0)}% deviation)`;
        outlierCount++;
      } else {
        // Agreement bonus: boost confidence if it lies close to the median
        const proximityBonus = (1 - pctDeviation) * 0.15; // up to 15% bonus
        f.confidence = Math.min(0.99, f.sourceReliability + proximityBonus);
        f.reasoning = `Validated by consensus (within ${(pctDeviation * 100).toFixed(1)}% of cluster median)`;
      }
    });

    // Detect contradictions: Compare high-reliability sources (reliability >= 0.8)
    // If they differ by more than 15%, log a contradiction
    const highReliabilityFacts = numericFacts.filter(f => f.sourceReliability >= 0.8 && !f.isOutlier);
    for (let i = 0; i < highReliabilityFacts.length; i++) {
      for (let j = i + 1; j < highReliabilityFacts.length; j++) {
        const fA = highReliabilityFacts[i];
        const fB = highReliabilityFacts[j];
        const valA = fA.parsedNumber!;
        const valB = fB.parsedNumber!;
        
        const deviation = Math.abs(valA - valB) / ((valA + valB) / 2);
        
        if (deviation > 0.15) {
          fA.contradictsFactId = fB.id;
          fB.contradictsFactId = fA.id;
          
          fA.confidence *= 0.85; // Penalty for contradiction
          fB.confidence *= 0.85;
          
          fA.reasoning = `${fA.reasoning || ""}. Contradicts estimation by ${fB.sourceTitle}`.trim();
          fB.reasoning = `${fB.reasoning || ""}. Contradicts estimation by ${fA.sourceTitle}`.trim();

          contradictions.push({
            metric: fA.metric,
            factA: fA,
            factB: fB,
            deviationPercent: deviation * 100
          });
        }
      }
    }

    // Compute average confidence of non-outliers in this group
    const validFacts = group.filter(f => !f.isOutlier);
    const avgGroupConf = validFacts.reduce((sum, f) => sum + f.confidence, 0) / (validFacts.length || 1);
    totalGroupConfidences += avgGroupConf;

    // Construct outlier analysis notes
    const outliers = group.filter(f => f.isOutlier);
    if (outliers.length > 0) {
      const outlierDetails = outliers.map(o => `"${o.value}" from ${o.sourceTitle} (score ${o.sourceReliability})`).join(", ");
      analysisNotes.push(`For metric "${group[0].metric}": Filtered outlier(s) [${outlierDetails}] as they deviated significantly from the consensus cluster (~${medianVal.toLocaleString()}).`);
    }
    if (contradictions.length > 0) {
      const metricContradictions = contradictions.filter(c => c.metric.toLowerCase() === metricKey);
      if (metricContradictions.length > 0) {
        analysisNotes.push(`Discrepancy detected in "${group[0].metric}": High-credibility sources disagree by up to ${metricContradictions[0].deviationPercent.toFixed(0)}%. Recalculated confidence with agreement penalties.`);
      }
    }
  });

  // Calculate overall confidence score (0 to 100)
  const baseScore = totalAnalyzedGroups > 0 ? (totalGroupConfidences / totalAnalyzedGroups) * 100 : 85;
  // Apply minor penalties for outliers and contradictions
  const outlierPenalty = outlierCount * 2.5;
  const contradictionPenalty = contradictions.length * 4.0;
  const overallConfidenceScore = Math.max(10, Math.min(99, Math.round(baseScore - outlierPenalty - contradictionPenalty)));

  // Build structured outlier analysis summary text
  let outlierAnalysisSummary = "";
  if (analysisNotes.length > 0) {
    outlierAnalysisSummary = analysisNotes.join("\n\n");
  } else {
    outlierAnalysisSummary = "All parsed data points fall within acceptable standard deviations. No significant outliers or contradictions were detected across the gathered web sources.";
  }

  return {
    facts: validatedFacts,
    contradictions,
    overallConfidenceScore,
    outlierAnalysisSummary
  };
}
