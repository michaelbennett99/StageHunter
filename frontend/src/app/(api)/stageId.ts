export async function getRandomStageId(): Promise<number> {
  const res = await fetch('/api/random');
  return res.json();
}

export async function getDailyStageId(): Promise<number> {
  const res = await fetch('/api/daily');
  return res.json();
}
