import { Test, TestingModule } from '@nestjs/testing';
import { ProductSkusController } from './product-skus.controller';

describe('ProductSkusController', () => {
  let controller: ProductSkusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductSkusController],
    }).compile();

    controller = module.get<ProductSkusController>(ProductSkusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
