import { Test, TestingModule } from '@nestjs/testing';
import { FavouriteProductsController } from './favourite-products.controller';

describe('FavouriteProductsController', () => {
  let controller: FavouriteProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavouriteProductsController],
    }).compile();

    controller = module.get<FavouriteProductsController>(FavouriteProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
