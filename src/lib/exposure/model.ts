// Personal exposure model ("Vos données parlent" self-audit). Deterministic:
// explicit factors, explicit correlation rules, no AI. The index is an
// AWARENESS indicator, never a probability of being hacked.

export type ModuleId = 'identity' | 'social' | 'professional' | 'technical' | 'metadata' | 'habits' | 'accounts';

export type ItemId =
  | 'birthDate'
  | 'phone'
  | 'address'
  | 'idDocument'
  | 'family'
  | 'children'
  | 'quizzes'
  | 'employer'
  | 'email'
  | 'secretsPublished'
  | 'samePseudo'
  | 'photoLocation'
  | 'travelLive'
  | 'routine'
  | 'noMfa'
  | 'passwordReuse'
  | 'realSecretAnswers';

/** visibility: public / friends / nobody — yesno: yes / not sure / no. */
export type AnswerKind = 'visibility' | 'yesno';
export type Answer = 'high' | 'mid' | 'none';

/** How accessible the information is, per answer. */
export const ACCESS: Record<Answer, number> = { high: 1, mid: 0.5, none: 0 };

export interface ItemMeta {
  id: ItemId;
  module: ModuleId;
  kind: AnswerKind;
  /** 0–1 factors: sensitivity, ease of correlation, exploitation potential, persistence. */
  sensitivity: number;
  correlation: number;
  exploitation: number;
  persistence: number;
}

const item = (id: ItemId, module: ModuleId, kind: AnswerKind, s: number, c: number, e: number, p: number): ItemMeta => ({
  id,
  module,
  kind,
  sensitivity: s,
  correlation: c,
  exploitation: e,
  persistence: p,
});

export const ITEMS: ItemMeta[] = [
  item('birthDate', 'identity', 'visibility', 0.7, 0.6, 0.7, 0.9),
  item('phone', 'identity', 'visibility', 0.6, 0.9, 0.8, 0.8),
  item('address', 'identity', 'visibility', 0.8, 0.6, 0.7, 0.9),
  item('idDocument', 'identity', 'yesno', 1, 0.8, 1, 1),
  item('family', 'social', 'visibility', 0.6, 0.7, 0.7, 0.8),
  item('children', 'social', 'visibility', 0.9, 0.6, 0.8, 0.9),
  item('quizzes', 'social', 'yesno', 0.5, 0.5, 0.6, 0.7),
  item('employer', 'professional', 'visibility', 0.5, 0.8, 0.7, 0.7),
  item('email', 'professional', 'visibility', 0.5, 0.8, 0.8, 0.8),
  item('secretsPublished', 'technical', 'yesno', 1, 0.5, 1, 0.9),
  item('samePseudo', 'technical', 'yesno', 0.4, 1, 0.6, 0.8),
  item('photoLocation', 'metadata', 'yesno', 0.7, 0.6, 0.7, 0.9),
  item('travelLive', 'habits', 'yesno', 0.7, 0.5, 0.8, 0.5),
  item('routine', 'habits', 'visibility', 0.5, 0.5, 0.6, 0.6),
  item('noMfa', 'accounts', 'yesno', 0.9, 0.3, 1, 0.7),
  item('passwordReuse', 'accounts', 'yesno', 0.9, 0.4, 1, 0.8),
  item('realSecretAnswers', 'accounts', 'yesno', 0.7, 0.7, 0.8, 0.9),
];

/**
 * Weight of an item before accessibility: sensitivity 25 %, correlation 20 %,
 * exploitation 20 %, persistence 10 %. Accessibility (the remaining 25 %)
 * multiplies it: a private piece of information exposes nothing.
 */
export function itemWeight(m: ItemMeta): number {
  return 0.25 * m.sensitivity + 0.2 * m.correlation + 0.2 * m.exploitation + 0.1 * m.persistence;
}

export type Severity = 'moderate' | 'high' | 'critical';

export type ScenarioId =
  | 'identityTheft'
  | 'simSwap'
  | 'accountTakeover'
  | 'recovery'
  | 'spearPhishing'
  | 'fakeRelative'
  | 'burglary'
  | 'childTargeting'
  | 'linkedAccounts'
  | 'secretLeak'
  | 'tailoredScam';

export interface Scenario {
  id: ScenarioId;
  severity: Severity;
  /** AND of ORs: every group needs at least one exposed item. */
  require: ItemId[][];
}

export const SCENARIOS: Scenario[] = [
  { id: 'secretLeak', severity: 'critical', require: [['secretsPublished']] },
  { id: 'accountTakeover', severity: 'critical', require: [['passwordReuse'], ['noMfa']] },
  { id: 'identityTheft', severity: 'critical', require: [['idDocument'], ['birthDate', 'address']] },
  { id: 'childTargeting', severity: 'critical', require: [['children'], ['address', 'photoLocation', 'routine']] },
  { id: 'simSwap', severity: 'high', require: [['phone'], ['idDocument', 'birthDate']] },
  { id: 'recovery', severity: 'high', require: [['realSecretAnswers'], ['birthDate', 'family', 'quizzes', 'address']] },
  { id: 'spearPhishing', severity: 'high', require: [['employer'], ['email', 'phone']] },
  { id: 'fakeRelative', severity: 'high', require: [['family'], ['phone']] },
  { id: 'burglary', severity: 'high', require: [['travelLive'], ['address', 'photoLocation']] },
  { id: 'linkedAccounts', severity: 'moderate', require: [['samePseudo'], ['employer', 'email', 'phone', 'family']] },
  { id: 'tailoredScam', severity: 'moderate', require: [['quizzes', 'birthDate'], ['phone', 'email']] },
];

const SCENARIO_BONUS: Record<Severity, number> = { moderate: 2, high: 5, critical: 8 };
/** An item counts in a correlation once it is at least partly accessible. */
const EXPOSED = 0.5;

export type Answers = Partial<Record<ItemId, Answer>>;

/** 0–1 accessibility of every item (unanswered = not exposed). */
export type Access = Partial<Record<ItemId, number>>;

export const accessFromAnswers = (answers: Answers): Access =>
  Object.fromEntries(Object.entries(answers).map(([id, a]) => [id, ACCESS[a as Answer]])) as Access;

export type Level = 'low' | 'moderate' | 'high' | 'critical';

export interface ExposureReport {
  index: number;
  level: Level;
  exposed: ItemId[];
  scenarios: Scenario[];
  /** Items that would lower the index the most if made private. */
  quickWins: { id: ItemId; gain: number }[];
}

export function matchScenarios(access: Access): Scenario[] {
  const isExposed = (id: ItemId) => (access[id] ?? 0) >= EXPOSED;
  return SCENARIOS.filter((s) => s.require.every((group) => group.some(isExposed)));
}

export function exposureIndex(access: Access): number {
  const total = ITEMS.reduce((sum, m) => sum + itemWeight(m), 0);
  const exposed = ITEMS.reduce((sum, m) => sum + itemWeight(m) * (access[m.id] ?? 0), 0);
  const bonus = matchScenarios(access).reduce((sum, s) => sum + SCENARIO_BONUS[s.severity], 0);
  return Math.min(100, Math.round((100 * exposed) / total + bonus));
}

export function levelFor(index: number): Level {
  if (index >= 70) return 'critical';
  if (index >= 40) return 'high';
  if (index >= 20) return 'moderate';
  return 'low';
}

const QUICK_WINS = 3;

export function buildReport(access: Access): ExposureReport {
  const index = exposureIndex(access);
  const exposed = ITEMS.filter((m) => (access[m.id] ?? 0) > 0).map((m) => m.id);
  // "What if": the gain from making each exposed item private.
  const quickWins = exposed
    .map((id) => ({ id, gain: index - exposureIndex({ ...access, [id]: 0 }) }))
    .filter((w) => w.gain > 0)
    .sort((a, b) => b.gain - a.gain)
    .slice(0, QUICK_WINS);
  return { index, level: levelFor(index), exposed, scenarios: matchScenarios(access), quickWins };
}
