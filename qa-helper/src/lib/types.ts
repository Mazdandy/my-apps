// Shared types for QA-Helper MVP

export type SourceType = 'paste' | 'upload'

export type DocType = 'strategy' | 'plan' | 'testcase'

export const DOC_TYPES: { value: DocType; label: string; desc: string }[] = [
  {
    value: 'strategy',
    label: 'Test Strategy',
    desc: 'Pendekatan & level testing, scope, risiko.',
  },
  {
    value: 'plan',
    label: 'Test Plan',
    desc: 'Ruang lingkup, lingkungan, jadwal, kriteria keluar.',
  },
  {
    value: 'testcase',
    label: 'Test Case',
    desc: 'Skenario fungsional rinci dari requirement PRD.',
  },
]

export interface PrdSummary {
  title: string
  modules: string[]
  requirements: string[] // satu kalimat requirement per item
  raw: string // simpan teks asli untuk traceability
}

export interface StrategyDoc {
  title: string
  purpose: string
  scopeIn: string[]
  scopeOut: string[]
  levels: string[] // level testing yang disarankan
  approach: string[] // pendekatan per area/modul
  environment: string[]
  risks: { risk: string; mitigation: string }[]
}

export interface PlanDoc {
  title: string
  scope: string
  environment: string[]
  schedule: { phase: string; detail: string }[]
  roles: string[]
  entryCriteria: string[]
  exitCriteria: string[]
  assumptions: string[]
}

export interface TestCase {
  id: string
  module: string
  title: string
  preconditions: string
  steps: string[]
  testData: string
  expected: string
  priority: 'High' | 'Medium' | 'Low'
  traceability: string // requirement asal di PRD
}

export interface TestCaseDoc {
  title: string
  cases: TestCase[]
}

export type Docs = Partial<{
  strategy: StrategyDoc
  plan: PlanDoc
  testcase: TestCaseDoc
}>

export type BrainstormOutput = Record<DocType, string> // markdown per jenis

export function emptyBrainstorm(): BrainstormOutput {
  return { strategy: '', plan: '', testcase: '' }
}
