import { listTopics } from "../repositories/topic-repository.js";

export async function getTopics() {
  return listTopics();
}
