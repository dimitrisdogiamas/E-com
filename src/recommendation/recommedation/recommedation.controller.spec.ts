import { Test, TestingModule } from '@nestjs/testing';
import { RecommedationController } from './recommedation.controller';

describe('RecommedationController', () => {
  let controller: RecommedationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommedationController],
    }).compile();

    controller = module.get<RecommedationController>(RecommedationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
