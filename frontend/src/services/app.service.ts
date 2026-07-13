import { initialAppData } from '@/mock/data'
import type { AppData } from '@/types'

/**
 * Async data layer for the frontend application state.
 *
 * Today these resolve the local mock (see `@/mock/data`). When a real backend
 * or AI service is introduced, replace the bodies with `fetch` / SDK calls and
 * keep the same Promise signatures — the context and hooks stay unchanged.
 */
export async function fetchAppData(): Promise<AppData> {
  // Simulate network / AI latency. Swap for a real request later.
  await new Promise((resolve) => setTimeout(resolve, 300))
  return initialAppData
}

export async function fetchSkills(): Promise<AppData['skills']> {
  const data = await fetchAppData()
  return data.skills
}

export async function fetchCareerMatches(): Promise<AppData['careerMatches']> {
  const data = await fetchAppData()
  return data.careerMatches
}

export async function fetchSkillGap(): Promise<AppData['skillGap']> {
  const data = await fetchAppData()
  return data.skillGap
}

export async function fetchRoadmap(): Promise<AppData['roadmap']> {
  const data = await fetchAppData()
  return data.roadmap
}

export async function fetchCourses(): Promise<AppData['courses']> {
  const data = await fetchAppData()
  return data.courses
}

export async function fetchProfile(): Promise<AppData['profile']> {
  const data = await fetchAppData()
  return data.profile
}
