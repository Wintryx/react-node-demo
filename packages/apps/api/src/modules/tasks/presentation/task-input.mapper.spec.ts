import { UpdateTaskDto } from './dto';
import { toUpdateTaskInput } from './task-input.mapper';

describe('task input mapper', () => {
  it('keeps dueDate undefined when not provided in patch', () => {
    const dto: UpdateTaskDto = {
      title: 'Updated title',
    };

    const result = toUpdateTaskInput(dto);
    expect(result.dueDate).toBeUndefined();
  });

  it('maps dueDate to Date when provided', () => {
    const dto: UpdateTaskDto = {
      dueDate: '2026-04-05T10:00:00.000Z',
    };

    const result = toUpdateTaskInput(dto);
    expect(result.dueDate).toEqual(new Date('2026-04-05T10:00:00.000Z'));
  });

  it('maps dueDate to null when explicitly cleared', () => {
    const dto: UpdateTaskDto = {
      dueDate: null,
    };

    const result = toUpdateTaskInput(dto);
    expect(result.dueDate).toBeNull();
  });
});
