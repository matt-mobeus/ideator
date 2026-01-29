// ================================================================
// IDEATOR — Visual Generator (BE-6.2)
// Generates static visual assets (SVG) from analysis data
// ================================================================

import type { Concept, AnalysisResult, GeneratedAsset } from '../../shared/types';
import { AssetType } from '../../shared/types';
import { generateId } from '../../shared/utils';

export class VisualGenerator {
  async generate(
    concept: Concept,
    analysis: AnalysisResult,
    assetType: AssetType
  ): Promise<GeneratedAsset> {
    let svg: string;

    switch (assetType) {
      case AssetType.INFOGRAPHIC:
        svg = this.generateScorecard(concept, analysis);
        break;
      case AssetType.COMPARISON_CHART:
        svg = this.generateRadarChart(concept, analysis);
        break;
      case AssetType.DATA_VISUALIZATION:
        svg = this.generateBarChart(concept, analysis);
        break;
      default:
        svg = this.generateScorecard(concept, analysis);
    }

    const blob = new Blob([svg], { type: 'image/svg+xml' });

    return {
      id: generateId(),
      assetType,
      conceptId: concept.id,
      filePath: `assets/${concept.id}/${assetType.toLowerCase()}.svg`,
      blob,
      mimeType: 'image/svg+xml',
      generatedTimestamp: new Date(),
      provenance: { claims: [] },
    };
  }

  private generateScorecard(concept: Concept, analysis: AnalysisResult): string {
    const { compositeScore, marketViability, technicalFeasibility, investmentPotential, validityTier } = analysis;
    const tierColor = compositeScore >= 75 ? '#22c55e' : compositeScore >= 50 ? '#eab308' : compositeScore >= 25 ? '#f97316' : '#ef4444';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="system-ui,sans-serif">
  <rect width="600" height="400" fill="#0f172a" rx="12"/>
  <text x="300" y="40" fill="white" font-size="18" font-weight="bold" text-anchor="middle">${this.escSvg(concept.name)}</text>
  <text x="300" y="65" fill="#94a3b8" font-size="12" text-anchor="middle">${this.escSvg(concept.domain)} · ${validityTier}</text>
  <circle cx="300" cy="170" r="70" fill="none" stroke="${tierColor}" stroke-width="8" stroke-dasharray="${compositeScore * 4.4} 440" transform="rotate(-90 300 170)"/>
  <text x="300" y="180" fill="white" font-size="36" font-weight="bold" text-anchor="middle">${compositeScore}</text>
  <text x="300" y="200" fill="#94a3b8" font-size="11" text-anchor="middle">Composite Score</text>
  <g transform="translate(80,280)">
    <rect width="${marketViability.score * 1.4}" height="24" fill="#3b82f6" rx="4"/>
    <text x="0" y="-5" fill="#94a3b8" font-size="11">Market: ${marketViability.score}</text>
  </g>
  <g transform="translate(80,320)">
    <rect width="${technicalFeasibility.score * 1.4}" height="24" fill="#8b5cf6" rx="4"/>
    <text x="0" y="-5" fill="#94a3b8" font-size="11">Technical: ${technicalFeasibility.score}</text>
  </g>
  <g transform="translate(80,360)">
    <rect width="${investmentPotential.score * 1.4}" height="24" fill="#06b6d4" rx="4"/>
    <text x="0" y="-5" fill="#94a3b8" font-size="11">Investment: ${investmentPotential.score}</text>
  </g>
</svg>`;
  }

  private generateRadarChart(concept: Concept, analysis: AnalysisResult): string {
    const scores = [analysis.marketViability.score, analysis.technicalFeasibility.score, analysis.investmentPotential.score];
    const labels = ['Market', 'Technical', 'Investment'];
    const cx = 200, cy = 200, r = 150;

    const points = scores.map((s, i) => {
      const angle = (2 * Math.PI * i) / 3 - Math.PI / 2;
      const dist = (s / 100) * r;
      return `${cx + dist * Math.cos(angle)},${cy + dist * Math.sin(angle)}`;
    }).join(' ');

    const labelPoints = labels.map((l, i) => {
      const angle = (2 * Math.PI * i) / 3 - Math.PI / 2;
      return `<text x="${cx + (r + 20) * Math.cos(angle)}" y="${cy + (r + 20) * Math.sin(angle)}" fill="#94a3b8" font-size="12" text-anchor="middle">${l}: ${scores[i]}</text>`;
    }).join('\n  ');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" font-family="system-ui,sans-serif">
  <rect width="400" height="400" fill="#0f172a" rx="12"/>
  <polygon points="${points}" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" stroke-width="2"/>
  ${labelPoints}
  <text x="200" y="30" fill="white" font-size="14" font-weight="bold" text-anchor="middle">${this.escSvg(concept.name)}</text>
</svg>`;
  }

  private generateBarChart(concept: Concept, analysis: AnalysisResult): string {
    const data = [
      { label: 'Market', score: analysis.marketViability.score, color: '#3b82f6' },
      { label: 'Technical', score: analysis.technicalFeasibility.score, color: '#8b5cf6' },
      { label: 'Investment', score: analysis.investmentPotential.score, color: '#06b6d4' },
    ];

    const bars = data.map((d, i) => {
      const x = 80 + i * 160;
      const h = d.score * 2.5;
      return `<rect x="${x}" y="${300 - h}" width="120" height="${h}" fill="${d.color}" rx="4"/>
    <text x="${x + 60}" y="320" fill="#94a3b8" font-size="12" text-anchor="middle">${d.label}</text>
    <text x="${x + 60}" y="${295 - h}" fill="white" font-size="14" font-weight="bold" text-anchor="middle">${d.score}</text>`;
    }).join('\n  ');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 360" font-family="system-ui,sans-serif">
  <rect width="560" height="360" fill="#0f172a" rx="12"/>
  <text x="280" y="30" fill="white" font-size="14" font-weight="bold" text-anchor="middle">${this.escSvg(concept.name)}</text>
  ${bars}
</svg>`;
  }

  private escSvg(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
