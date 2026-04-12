/**
 * Playwright global setup — seeds the test database with sample data
 * so E2E tests have meaningful content to interact with.
 *
 * Expects the backend server to be running at BASE_URL (default http://localhost:3001).
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

async function seedGames() {
  const games = [
    {
      title: 'Elden Ring',
      platform: 'PlayStation 5',
      genre: 'Action RPG',
      developer: 'FromSoftware',
      release_year: 2022,
      vibe_intensity: 'brutal',
      vibe_story_pace: 'slow_burn',
      vibe_mood: 'dark',
    },
    {
      title: 'Stardew Valley',
      platform: 'Nintendo Switch',
      genre: 'Simulation',
      developer: 'ConcernedApe',
      release_year: 2016,
      vibe_intensity: 'chill',
      vibe_story_pace: 'steady',
      vibe_mood: 'cozy',
    },
    {
      title: 'Cyberpunk 2077',
      platform: 'PC',
      genre: 'Action RPG',
      developer: 'CD Projekt Red',
      release_year: 2020,
      vibe_intensity: 'intense',
      vibe_story_pace: 'fast_paced',
      vibe_mood: 'intense',
    },
  ];

  const created = [];
  for (const game of games) {
    const res = await fetch(`${BASE_URL}/api/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game),
    });
    if (res.ok) {
      created.push(await res.json());
    } else {
      // Game might already exist (unique constraint) — that's fine
      const text = await res.text();
      if (!text.includes('unique') && !text.includes('duplicate')) {
        console.warn(`  ⚠ Failed to create game "${game.title}": ${text}`);
      }
    }
  }
  return created;
}

async function seedBacklogItems(games) {
  const statuses = ['playing', 'want_to_play', 'completed'];
  for (let i = 0; i < games.length && i < statuses.length; i++) {
    const res = await fetch(`${BASE_URL}/api/backlog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game_id: games[i].id,
        status: statuses[i],
        priority: 90 - i * 10,
        why_i_want_to_play: `Test seed data for ${games[i].title}`,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      if (!text.includes('unique') && !text.includes('duplicate')) {
        console.warn(`  ⚠ Failed to add backlog item: ${text}`);
      }
    }
  }
}

export default async function globalSetup() {
  console.log('🌱 E2E global setup: seeding test data...');

  // Wait for backend to be ready
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) break;
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  try {
    const games = await seedGames();
    if (games.length > 0) {
      await seedBacklogItems(games);
      console.log(`  ✓ Seeded ${games.length} games with backlog items`);
    } else {
      console.log('  ✓ Games already exist (skipped seeding)');
    }
  } catch (err) {
    console.warn(`  ⚠ Seed failed (tests may still pass): ${err.message}`);
  }
}
