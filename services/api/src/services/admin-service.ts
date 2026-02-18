import {
  getOverviewCounts,
  listEmailEvents,
  listEmailJobs,
  listRecentDigests,
  listSources
} from "../repositories/admin-repository.js";

export async function getAdminOverview() {
  return getOverviewCounts();
}

export async function getAdminSources() {
  return listSources(50);
}

export async function getAdminDigests() {
  return listRecentDigests(50);
}

export async function getAdminEmailJobs() {
  return listEmailJobs(50);
}

export async function getAdminEmailEvents() {
  return listEmailEvents(100);
}
