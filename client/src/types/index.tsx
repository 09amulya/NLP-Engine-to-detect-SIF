export type SIFLevel = "HIGH" | "MEDIUM" | "LOW";

export type HSEPriorityLevel =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export interface SafetyExtraction {
  activity: string | null;
  hazard: string | null;
  location: string | null;
  unsafe_act: string | null;
  unsafe_condition: string | null;
  barrier_failure: string | null;
  potential_consequence: string | null;
  primary_lsr: string | null;
  secondary_lsr: string | null;
  evidence: string[];
  confidence: number;
}

export interface SIFClassification {
  sif_level: SIFLevel;
  score: number;
}

export interface SafetyReport {
  report_id: string;
  source_file: string;
  source_type: string;
  original_report: string;

  raw_extraction: SafetyExtraction;
  normalized_extraction: SafetyExtraction;

  sif_classification: SIFClassification;
}

export interface PrecursorPattern {
  pattern_id: string;

  activity: string;
  hazard: string;
  barrier_failure: string;

  related_lsrs: string[];

  countries: string[];

  occurrence_count: number;
  high_sif_count: number;
  medium_sif_count: number;
  low_sif_count: number;

  average_sif_score?: number;

  priority_score: number;
  priority: SIFLevel;

  report_ids: string[];
}

export interface HSEPriorityItem {
  priority_rank: number;
  pattern_id: string;

  priority: HSEPriorityLevel;
  hse_priority_score: number;

  activity: string;
  hazard: string;
  barrier_failure: string;

  related_lsrs: string[];
  countries: string[];

  occurrence_count: number;
  high_sif_count: number;
  medium_sif_count: number;

  recommendation: string;

  report_ids: string[];
}