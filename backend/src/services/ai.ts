import { logger } from 'firebase-functions/v2';

import type {
  CareerMatch,
  ConfidenceInfo,
  EducationInfo,
  ExperienceInfo,
  ResumeAnalysis,
  SkillGapDifficulty,
  SkillGapItem,
  SkillGapPriority,
  SkillGroup,
} from '../types';

/**
 * Provider-independent AI contract. The rest of the app only ever talks to this
 * interface — it never calls Gemini/OpenAI directly. New providers are added
 * by implementing AIService and wiring them into getAIService().
 */
export interface AIService {
  /** Full structured analysis of a resume's raw text. */
  analyzeResume(rawText: string): Promise<ResumeAnalysis>;
  /** Top career matches for a set of skills. */
  matchCareers(skills: string[], experienceYears: number): Promise<CareerMatch[]>;
  /** Skills missing for the top matched career. */
  calculateSkillGap(
    currentSkills: string[],
    topCareer: CareerMatch | undefined,
  ): Promise<SkillGapItem[]>;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Stub provider — deterministic, keyword-based. Runs with no API key so the
// whole pipeline is testable locally. Production switches to Gemini via env.
// ---------------------------------------------------------------------------

const SKILL_KEYWORDS: Record<string, string[]> = {
  'Programming Languages': [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Golang',
    'Ruby', 'PHP', 'Swift', 'Kotlin', 'Rust', 'Scala', 'Dart', 'Perl',
  ],
  Frameworks: [
    'React', 'Angular', 'Vue.js', 'Vue', 'Next.js', 'Nuxt', 'Node.js', 'Express',
    'Django', 'Flask', 'Spring Boot', 'Spring', 'Laravel', 'Rails', 'ASP.NET',
    'Svelte', 'jQuery',
  ],
  Libraries: [
    'Redux', 'MobX', 'Lodash', 'Axios', 'Pandas', 'NumPy', 'SciPy', 'TensorFlow',
    'PyTorch', 'Keras', 'Matplotlib', 'D3.js', 'D3', 'Jest', 'Mocha', 'Chai',
  ],
  Databases: [
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Cassandra', 'DynamoDB',
    'Firebase', 'Firestore', 'Elasticsearch', 'MariaDB', 'Oracle',
  ],
  Cloud: [
    'AWS', 'Amazon Web Services', 'Azure', 'Microsoft Azure', 'GCP',
    'Google Cloud', 'Heroku', 'DigitalOcean', 'Cloudflare',
  ],
  DevOps: [
    'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitHub Actions', 'GitLab CI',
    'CircleCI', 'Ansible', 'CI/CD', 'Prometheus', 'Grafana',
  ],
  Tools: [
    'Git', 'Webpack', 'Babel', 'Vite', 'Figma', 'Jira', 'Confluence', 'Slack',
    'VS Code', 'Postman', 'NPM', 'Yarn', 'Linux', 'Unix', 'Bash',
  ],
  Languages: [
    'English', 'Spanish', 'French', 'German', 'Mandarin', 'Hindi', 'Portuguese',
    'Japanese', 'Arabic', 'Russian',
  ],
  Certifications: [
    'AWS Certified', 'Azure Certified', 'Google Certified', 'PMP', 'Scrum Master',
    'CKA', 'Certified Kubernetes', 'CompTIA', 'Oracle Certified',
  ],
};

const SOFT_SKILLS = [
  'Communication', 'Leadership', 'Teamwork', 'Collaboration', 'Problem-solving',
  'Problem Solving', 'Critical Thinking', 'Adaptability', 'Time Management',
  'Creativity', 'Mentoring', 'Presentation', 'Agile', 'Scrum',
];

interface CareerProfile {
  name: string;
  skills: string[];
}

const CAREER_PROFILES: CareerProfile[] = [
  { name: 'Software Engineer', skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'Git', 'AWS'] },
  { name: 'Frontend Developer', skills: ['JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'CSS', 'HTML', 'Redux'] },
  { name: 'Backend Developer', skills: ['Node.js', 'Python', 'Java', 'Go', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'API'] },
  { name: 'Data Scientist', skills: ['Python', 'Pandas', 'NumPy', 'SQL', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Statistics'] },
  { name: 'DevOps Engineer', skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Linux', 'Jenkins', 'Azure'] },
  { name: 'Machine Learning Engineer', skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Docker', 'AWS', 'Machine Learning'] },
  { name: 'Full Stack Developer', skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'PostgreSQL', 'AWS', 'Git'] },
  { name: 'Mobile Developer', skills: ['Swift', 'Kotlin', 'React Native', 'Java', 'Dart', 'Flutter'] },
  { name: 'Cloud Architect', skills: ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'Docker', 'Linux'] },
  { name: 'QA Engineer', skills: ['Selenium', 'Cypress', 'Jest', 'Python', 'Java', 'Automation', 'Testing'] },
];

const DEGREES: { name: string; rank: number }[] = [
  { name: 'PhD', rank: 7 }, { name: 'Doctorate', rank: 7 }, { name: 'Master', rank: 6 },
  { name: 'M.S.', rank: 6 }, { name: 'M.Tech', rank: 6 }, { name: 'MBA', rank: 6 },
  { name: 'Bachelor', rank: 5 }, { name: 'B.Tech', rank: 5 }, { name: 'B.Sc', rank: 5 },
  { name: 'B.S.', rank: 5 }, { name: 'Diploma', rank: 3 }, { name: 'Associate', rank: 3 },
  { name: 'High School', rank: 1 },
];

const ROLE_KEYWORDS = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack',
  'Full-Stack', 'Data Scientist', 'DevOps', 'Machine Learning', 'Mobile Developer',
  'Cloud Architect', 'QA', 'Developer', 'Engineer', 'Designer', 'Manager',
  'Architect', 'Analyst',
];

function findMatches(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const kw of keywords) {
    if (new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i').test(lower)) found.push(kw);
  }
  return found;
}

function extractSkills(text: string): { technicalSkills: SkillGroup[]; softSkills: string[] } {
  const technicalSkills: SkillGroup[] = [];
  for (const [category, keywords] of Object.entries(SKILL_KEYWORDS)) {
    const skills = findMatches(text, keywords);
    if (skills.length) technicalSkills.push({ category, skills });
  }
  const softSkills = findMatches(text, SOFT_SKILLS);
  return { technicalSkills, softSkills };
}

function extractExperience(text: string): ExperienceInfo {
  const yearsMatch = text.match(/(\d{1,2})\+?\s*years?/i);
  const years = yearsMatch ? parseInt(yearsMatch[1], 10) : 0;

  const foundRoles = ROLE_KEYWORDS.filter((r) =>
    new RegExp(`\\b${escapeRegex(r)}\\b`, 'i').test(text),
  );
  const currentRole = foundRoles[0] ?? '';
  const previousRoles = foundRoles.slice(1);

  const projects: string[] = [];
  const projRe = /project[s]?\s*:?\s*([^\n.;]{4,80})/gi;
  let m: RegExpExecArray | null;
  while ((m = projRe.exec(text)) !== null && projects.length < 5) {
    projects.push(m[1].trim());
  }
  return { years, currentRole, previousRoles, projects };
}

function extractEducation(text: string): EducationInfo {
  let best = '';
  let bestRank = 0;
  for (const d of DEGREES) {
    if (new RegExp(`\\b${escapeRegex(d.name)}\\b`, 'i').test(text) && d.rank > bestRank) {
      best = d.name;
      bestRank = d.rank;
    }
  }
  return { highestQualification: best };
}

function computeConfidence(
  technicalSkills: SkillGroup[],
  softSkills: string[],
  careers: CareerMatch[],
): ConfidenceInfo {
  const total =
    technicalSkills.reduce((n, g) => n + g.skills.length, 0) + softSkills.length;
  const skills = Math.min(100, total * 5);
  const careerMatch = careers.length ? careers[0].confidence : 0;
  const overall = Math.round((skills + careerMatch) / 2);
  return { overall, skills, careerMatch };
}

function buildGapItem(skill: string): SkillGapItem {
  const s = skill.toLowerCase();
  let difficulty: SkillGapDifficulty = 'moderate';
  let priority: SkillGapPriority = 'medium';
  let estimatedLearningTime = '1-2 months';

  if (['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'linux'].some((k) => s.includes(k))) {
    difficulty = 'hard';
    priority = 'high';
    estimatedLearningTime = '3-6 months';
  } else if (['english', 'spanish', 'french', 'german', 'japanese'].some((k) => s.includes(k))) {
    difficulty = 'easy';
    priority = 'low';
    estimatedLearningTime = '1-2 months';
  } else if (['git', 'figma', 'jira', 'webpack', 'vite', 'postman'].some((k) => s.includes(k))) {
    difficulty = 'easy';
    priority = 'low';
    estimatedLearningTime = '1-2 weeks';
  }
  return { skill, difficulty, priority, estimatedLearningTime };
}

export class StubAIService implements AIService {
  async analyzeResume(rawText: string): Promise<ResumeAnalysis> {
    const { technicalSkills, softSkills } = extractSkills(rawText);
    const experience = extractExperience(rawText);
    const education = extractEducation(rawText);
    const allSkills = [
      ...technicalSkills.flatMap((g) => g.skills),
      ...softSkills,
    ].map((s) => s.toLowerCase());

    const careers = await this.matchCareers(allSkills, experience.years);
    const missingSkills = await this.calculateSkillGap(allSkills, careers[0]);
    const confidence = computeConfidence(technicalSkills, softSkills, careers);

    return {
      technicalSkills,
      softSkills,
      experience,
      education,
      careers,
      missingSkills,
      confidence,
    };
  }

  async matchCareers(skills: string[], _experienceYears: number): Promise<CareerMatch[]> {
    const have = new Set(skills.map((s) => s.toLowerCase()));
    const scored = CAREER_PROFILES.map((profile) => {
      const matched = profile.skills.filter((s) => have.has(s.toLowerCase()));
      const confidence = Math.round((matched.length / profile.skills.length) * 100);
      return {
        careerName: profile.name,
        confidence,
        reason: matched.length
          ? `Strong match on ${matched.slice(0, 5).join(', ')}`
          : 'Limited skill overlap',
        topMatchingSkills: matched,
      } as CareerMatch;
    })
      .filter((c) => c.confidence > 0)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
    return scored;
  }

  async calculateSkillGap(
    currentSkills: string[],
    topCareer: CareerMatch | undefined,
  ): Promise<SkillGapItem[]> {
    if (!topCareer) return [];
    const profile = CAREER_PROFILES.find((c) => c.name === topCareer.careerName);
    if (!profile) return [];
    const have = new Set(currentSkills.map((s) => s.toLowerCase()));
    return profile.skills
      .filter((s) => !have.has(s.toLowerCase()))
      .map((s) => buildGapItem(s));
  }
}

// ---------------------------------------------------------------------------
// Gemini provider — real REST adapter, swappable via AI_PROVIDER=gemini.
// (Requires GEMINI_API_KEY. Untested in this sandbox; uses standard API.)
// ---------------------------------------------------------------------------

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

function stripCodeFences(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return match ? match[1].trim() : text.trim();
}

function normalizeAnalysis(raw: unknown): ResumeAnalysis {
  const r = (raw ?? {}) as Record<string, unknown>;
  const groups = (r.technicalSkills as SkillGroup[] | undefined) ?? [];
  const careers = (r.careers as CareerMatch[] | undefined) ?? [];
  const missing = (r.missingSkills as SkillGapItem[] | undefined) ?? [];
  const conf = (r.confidence as Partial<ConfidenceInfo> | undefined) ?? {};
  return {
    technicalSkills: groups,
    softSkills: (r.softSkills as string[] | undefined) ?? [],
    experience: (r.experience as ExperienceInfo) ?? {
      years: 0, currentRole: '', previousRoles: [], projects: [],
    },
    education: (r.education as EducationInfo) ?? { highestQualification: '' },
    careers,
    missingSkills: missing,
    confidence: {
      overall: typeof conf.overall === 'number' ? conf.overall : 0,
      skills: typeof conf.skills === 'number' ? conf.skills : 0,
      careerMatch: typeof conf.careerMatch === 'number' ? conf.careerMatch : 0,
    },
  };
}

export class GeminiAIService implements AIService {
  private async callGemini(prompt: string, timeoutMs: number): Promise<string> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY not configured');

    let res: Response;
    try {
      res = await fetch(`${GEMINI_URL}?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      if ((err as { name?: string })?.name === 'TimeoutError') {
        throw new Error('AI request timed out');
      }
      throw err;
    }

    if (res.status === 429) throw new Error('AI rate limit exceeded');
    if (!res.ok) throw new Error(`Gemini request failed: ${res.status}`);

    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty AI response');
    return text;
  }

  async analyzeResume(rawText: string): Promise<ResumeAnalysis> {
    const prompt =
      'Analyze the following resume text. Return ONLY JSON with this exact shape:\n' +
      '{"technicalSkills":[{"category":"Programming Languages|Frameworks|Libraries|Databases|Cloud|DevOps|Tools|Languages|Certifications","skills":[]}],' +
      '"softSkills":[],"experience":{"years":0,"currentRole":"","previousRoles":[],"projects":[]},' +
      '"education":{"highestQualification":""},"careers":[{"careerName":"","confidence":0,"reason":"","topMatchingSkills":[]}],' +
      '"missingSkills":[{"skill":"","priority":"high|medium|low","difficulty":"easy|moderate|hard","estimatedLearningTime":""}],' +
      '"confidence":{"overall":0,"skills":0,"careerMatch":0}}\n\nResume:\n' +
      rawText;
    const text = await this.callGemini(prompt, 60000);
    try {
      return normalizeAnalysis(JSON.parse(stripCodeFences(text)));
    } catch {
      throw new Error('Malformed AI response');
    }
  }

  async matchCareers(skills: string[], _experienceYears: number): Promise<CareerMatch[]> {
    const prompt =
      `Given these skills: ${skills.join(', ')}. Return JSON: ` +
      '[{"careerName":"","confidence":0,"reason":"","topMatchingSkills":[]}] (top 5 careers).';
    const text = await this.callGemini(prompt, 60000);
    try {
      return (JSON.parse(stripCodeFences(text)) as CareerMatch[]).slice(0, 5);
    } catch {
      throw new Error('Malformed AI response');
    }
  }

  async calculateSkillGap(
    currentSkills: string[],
    topCareer: CareerMatch | undefined,
  ): Promise<SkillGapItem[]> {
    if (!topCareer) return [];
    const prompt =
      `Current skills: ${currentSkills.join(', ')}. Target career: ${topCareer.careerName}. ` +
      'Return JSON: [{"skill":"","priority":"high|medium|low","difficulty":"easy|moderate|hard","estimatedLearningTime":""}] of missing skills.';
    const text = await this.callGemini(prompt, 60000);
    try {
      return JSON.parse(stripCodeFences(text)) as SkillGapItem[];
    } catch {
      throw new Error('Malformed AI response');
    }
  }
}

/**
 * Returns the configured AI provider. Defaults to the deterministic stub so the
 * pipeline runs without keys; set AI_PROVIDER=gemini (with GEMINI_API_KEY) to
 * use the live model.
 */
export function getAIService(): AIService {
  const provider = (process.env.AI_PROVIDER ?? 'stub').toLowerCase();
  if (provider === 'gemini') {
    logger.info('Using GeminiAIService');
    return new GeminiAIService();
  }
  return new StubAIService();
}
