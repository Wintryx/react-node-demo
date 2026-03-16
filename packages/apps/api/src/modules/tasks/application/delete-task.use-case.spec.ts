import { NotFoundException } from '@nestjs/common';

import { DeleteTaskUseCase } from './delete-task.use-case';
import { InMemoryTaskRepository } from './test-helpers/in-memory-task.repository';

describe('DeleteTaskUseCase', () => {
  it('throws NotFoundException when task does not exist', async () => {
    const repository = new InMemoryTaskRepository({
      deleteResultOverride: false,
    });
    const useCase = new DeleteTaskUseCase(repository);

    await expect(useCase.execute(123)).rejects.toBeInstanceOf(NotFoundException);
  });
});
