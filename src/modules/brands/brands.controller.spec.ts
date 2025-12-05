import { Test, TestingModule } from '@nestjs/testing';
import { CreateBrandDto, UpdateBrandDto } from './dto';

import { BaseResponse } from '@/common/base';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';

describe('BrandsController', () => {
  let controller: BrandsController;

  const mockBrandService = {
    _create: jest.fn(),
    _find: jest.fn(),
    _findOne: jest.fn(),
    _update: jest.fn(),
    _remove: jest.fn(),
    update: jest.fn(),
  };

  const mockImage = {
    url: '/storage/brands/mock-image.webp',
    alt: 'Sample Brand',
    filename: 'mock-image.webp',
    position: 0,
  };

  const mockBrand = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Sample Brand',
    description: 'This is a sample brand',
    image: mockImage,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandsController],
      providers: [
        {
          provide: BrandsService,
          useValue: mockBrandService,
        },
      ],
    }).compile();

    controller = module.get<BrandsController>(BrandsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new brand successfully', async () => {
      const createDto: CreateBrandDto = {
        name: 'Sample Brand',
        description: 'This is a sample brand',
        image: mockImage,
      };

      mockBrandService._create.mockResolvedValue(mockBrand);

      const result = await controller.create(createDto);

      expect(mockBrandService._create).toHaveBeenCalledWith(createDto);
      expect(result).toMatchObject({
        success: true,
        data: mockBrand,
        message: 'Brand created successfully',
      });
      expect(result).toBeInstanceOf(BaseResponse);
    });
  });

  describe('update', () => {
    it('should update an existing brand successfully', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto: UpdateBrandDto = {
        name: 'Updated Brand',
        description: 'Updated description for brand',
      };
      const updatedBrand = { ...mockBrand, ...updateDto };

      mockBrandService.update.mockResolvedValue(updatedBrand);

      const result = await controller.update(id, updateDto);

      expect(mockBrandService.update).toHaveBeenCalledWith(
        id,
        updateDto,
        undefined,
      );
      expect(result).toMatchObject({
        success: true,
        data: updatedBrand,
        message: 'Brand updated successfully',
      });
      expect(result).toBeInstanceOf(BaseResponse);
    });
  });

  describe('find', () => {
    it('should return paginated list of brands with metadata', async () => {
      const mockBrands = [mockBrand];
      const mockPaginatedResult = {
        items: mockBrands,
        total: 1,
        page: 1,
        limit: 10,
      };
      const mockQuery = { page: 1, limit: 10 };
      mockBrandService._find.mockResolvedValue(mockPaginatedResult);

      const result = await controller._find(mockQuery);

      expect(mockBrandService._find).toHaveBeenCalledWith(mockQuery);
      expect(result).toMatchObject({
        success: true,
        data: mockBrands,
        message: 'Data Brand retrieved successfully',
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
      expect(result).toBeInstanceOf(BaseResponse);
    });
  });

  describe('findOne', () => {
    it('should return a single brand by ID', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockBrandService._findOne.mockResolvedValue(mockBrand);

      const result = await controller._findOne(id);

      expect(mockBrandService._findOne).toHaveBeenCalledWith(id);
      expect(result).toMatchObject({
        success: true,
        data: mockBrand,
        message: 'Brand retrieved successfully',
      });
      expect(result).toBeInstanceOf(BaseResponse);
    });
  });

  describe('remove', () => {
    it('should delete a brand and return confirmation', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockBrandService._remove.mockResolvedValue({ id });

      const result = await controller._remove(id);

      expect(mockBrandService._remove).toHaveBeenCalledWith(id);
      expect(result).toMatchObject({
        success: true,
        data: { id },
        message: 'Brand removed successfully',
      });
      expect(result).toBeInstanceOf(BaseResponse);
    });
  });
});
