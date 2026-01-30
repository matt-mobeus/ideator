import type { VisualAssetType } from '@/types/asset.ts'
import type { Concept } from '@/types/concept.ts'
import type { AnalysisResult } from '@/types/analysis.ts'

export const VISUAL_PROMPTS: Record<VisualAssetType, { system: string; user: (concept: Concept, analysis?: AnalysisResult) => string }> = {
  infographic: {
    system: `You are an infographic designer. Generate SVG markup for a visually compelling infographic that communicates key data and insights.

Design principles:
- Clear visual hierarchy
- Use icons and visual metaphors
- Color-coded sections
- Readable typography
- Data visualization elements (charts, graphs)
- Professional layout

Return only valid SVG markup. Use viewBox for responsiveness.`,
    user: (concept: Concept, analysis?: AnalysisResult) => `Concept: ${concept.name}
Description: ${concept.description}
${analysis ? `\nKey Metrics:
- Market Viability: ${analysis.marketViability.score}/100
- Technical Feasibility: ${analysis.technicalFeasibility.score}/100
- Investment Potential: ${analysis.investmentPotential.score}/100
Key Risks: ${analysis.keyRisks.join(', ')}` : ''}

Generate an SVG infographic (800x1200px) that visualizes this concept and its key data points.`,
  },

  concept_diagram: {
    system: `You are a concept diagram designer. Generate SVG markup for a clear architectural or conceptual diagram.

Design principles:
- Use boxes, circles, and arrows
- Show relationships and flows
- Label all components
- Use consistent spacing
- Professional color scheme
- Clear connection lines

Return only valid SVG markup.`,
    user: (concept: Concept, _analysis?: AnalysisResult) => `Concept: ${concept.name}
Description: ${concept.description}
Domain: ${concept.domain}
Related Concepts: ${concept.relatedConcepts.join(', ')}
Parent Concepts: ${concept.parentConcepts.join(', ')}
Child Concepts: ${concept.childConcepts.join(', ')}

Generate an SVG concept diagram (1000x800px) showing the concept structure, components, and relationships.`,
  },

  timeline_graphic: {
    system: `You are a timeline designer. Generate SVG markup for a visual timeline showing progression, milestones, or phases.

Design principles:
- Horizontal or vertical timeline layout
- Clear milestone markers
- Date/phase labels
- Progress indicators
- Visual separation between phases
- Professional styling

Return only valid SVG markup.`,
    user: (concept: Concept, analysis?: AnalysisResult) => `Concept: ${concept.name}
Description: ${concept.description}
${analysis ? `\nRecommended Next Steps: ${analysis.recommendedNextSteps.join('; ')}` : ''}

Generate an SVG timeline graphic (1200x600px) showing the concept's development phases, milestones, or implementation roadmap.`,
  },

  comparison_chart: {
    system: `You are a comparison chart designer. Generate SVG markup for a clear comparison visualization.

Design principles:
- Side-by-side or matrix layout
- Feature comparison rows
- Visual indicators (checkmarks, scores)
- Color-coded advantages
- Clear labels and headers
- Easy to scan

Return only valid SVG markup.`,
    user: (concept: Concept, analysis?: AnalysisResult) => `Concept: ${concept.name}
Description: ${concept.description}
${analysis ? `\nStrengths and Opportunities: ${analysis.marketViability.analysis}
Key Differentiators: ${Object.entries(analysis.marketViability.factors).map(([k, v]) => `${k}: ${v}`).join(', ')}` : ''}

Generate an SVG comparison chart (1000x700px) comparing this concept against alternatives or showing competitive advantages.`,
  },

  data_visualization: {
    system: `You are a data visualization designer. Generate SVG markup for charts and graphs that effectively communicate data insights.

Design principles:
- Appropriate chart type (bar, line, pie, scatter)
- Clear axes and labels
- Legend if needed
- Data point annotations
- Professional color scheme
- Grid lines for reference

Return only valid SVG markup.`,
    user: (concept: Concept, analysis?: AnalysisResult) => `Concept: ${concept.name}
Description: ${concept.description}
${analysis ? `\nData to Visualize:
- Market Viability: ${analysis.marketViability.score}/100
  Factors: ${Object.entries(analysis.marketViability.factors).map(([k, v]) => `${k}=${v}`).join(', ')}
- Technical Feasibility: ${analysis.technicalFeasibility.score}/100
  Factors: ${Object.entries(analysis.technicalFeasibility.factors).map(([k, v]) => `${k}=${v}`).join(', ')}
- Investment Potential: ${analysis.investmentPotential.score}/100
  Factors: ${Object.entries(analysis.investmentPotential.factors).map(([k, v]) => `${k}=${v}`).join(', ')}` : ''}

Generate an SVG data visualization (1000x800px) with multiple charts showing the concept's metrics and factors.`,
  },
}
