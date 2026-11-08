import { MemoryStorage } from '@/test/MemoryStorage';

import { MockChatService } from './MockChatService';

describe('50,000-message pagination', () => {
  test('retains one small page instead of eagerly materializing the full history', async () => {
    const service = new MockChatService(new MemoryStorage());
    await service.seedHistory(50_000);

    const eagerStartedAt = Date.now();
    const eager = await service.getPage({ limit: 50_000 });
    const eagerDuration = Date.now() - eagerStartedAt;
    const eagerPayloadCharacters = JSON.stringify(eager.messages).length;

    const pagedStartedAt = Date.now();
    const page = await service.getPage({ limit: 50 });
    const pagedDuration = Date.now() - pagedStartedAt;
    const pagedPayloadCharacters = JSON.stringify(page.messages).length;

    console.info({
      eagerDuration,
      eagerPayloadCharacters,
      pagedDuration,
      pagedPayloadCharacters,
    });
    expect(eager.messages).toHaveLength(50_000);
    expect(page.messages).toHaveLength(50);
    expect(pagedPayloadCharacters).toBeLessThan(eagerPayloadCharacters / 500);
  });
});
