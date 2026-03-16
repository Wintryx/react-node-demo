import { ConflictException, NotFoundException } from '@nestjs/common';

import { DeleteEmployeeUseCase } from './delete-employee.use-case';
import { InMemoryEmployeeRepository } from './test-helpers/in-memory-employee.repository';

describe('DeleteEmployeeUseCase', () => {
  it('throws ConflictException when employee still has assigned tasks', async () => {
    const repository = new InMemoryEmployeeRepository({
      assignedTaskEmployeeIds: [123],
      deleteResultOverride: true,
    });
    const useCase = new DeleteEmployeeUseCase(repository);

    await expect(useCase.execute(123)).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws NotFoundException when employee does not exist', async () => {
    const repository = new InMemoryEmployeeRepository({
      deleteResultOverride: false,
    });
    const useCase = new DeleteEmployeeUseCase(repository);

    await expect(useCase.execute(123)).rejects.toBeInstanceOf(NotFoundException);
  });
});
