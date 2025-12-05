import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { Test, TestingModule } from '@nestjs/testing';

import { BaseResponse } from '@/common/base';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockCategoryService = {
    _create: jest.fn(),
    _find: jest.fn(),
    _findOne: jest.fn(),
    _update: jest.fn(),
    _remove: jest.fn(),
    update: jest.fn(),
  };

  const mockImage = {
    url: '/storage/categories/mock-image.webp',
    alt: 'Electronics',
    filename: 'mock-image.webp',
    position: 0,
  };

  const mockCategory = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    image: mockImage,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new category successfully', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        image: mockImage,
      };

      mockCategoryService._create.mockResolvedValue(mockCategory);

      const result = await controller.create(createDto);

      expect(mockCategoryService._create).toHaveBeenCalledWith(createDto);
      expect(result).toMatchObject({
        success: true,
        data: mockCategory,
        message: 'Category created successfully',
      });
      expect(result).toBeInstanceOf(BaseResponse);
    });
  });

  describe('update', () => {
    it('should update an existing category successfully', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto: UpdateCategoryDto = {
        name: 'Updated Electronics',
        description: 'Updated description for electronic devices',
      };
      const updatedCategory = { ...mockCategory, ...updateDto };

      mockCategoryService.update.mockResolvedValue(updatedCategory);

      const result = await controller.update(id, updateDto);

      expect(mockCategoryService.update).toHaveBeenCalledWith(
        id,
        updateDto,
        undefined,
      );
      expect(result).toMatchObject({
        success: true,
        data: updatedCategory,
        message: 'Category updated successfully',
      });
      expect(result).toBeInstanceOf(BaseResponse);
    });
  });

  describe('find', () => {
    it('should return paginated list of categories with metadata', async () => {
      const mockCategories = [mockCategory];
      const mockPaginatedResult = {
        items: mockCategories,
        total: 1,
        page: 1,
        limit: 10,
      };
      const mockQuery = { page: 1, limit: 10 };
      mockCategoryService._find.mockResolvedValue(mockPaginatedResult);

      const result = await controller._find(mockQuery);

      expect(mockCategoryService._find).toHaveBeenCalledWith(mockQuery);
      expect(result).toMatchObject({
        success: true,
        data: mockCategories,
        message: 'Data Category retrieved successfully',
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
    it('should return a single category by ID', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockCategoryService._findOne.mockResolvedValue(mockCategory);

      const result = await controller._findOne(id);

      expect(mockCategoryService._findOne).toHaveBeenCalledWith(id);
      expect(result).toMatchObject({
        success: true,
        data: mockCategory,
        message: 'Category retrieved successfully',
      });
      expect(result).toBeInstanceOf(BaseResponse);
    });
  });

  describe('remove', () => {
    it('should delete a category and return confirmation', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockCategoryService._remove.mockResolvedValue({ id });

      const result = await controller._remove(id);

      expect(mockCategoryService._remove).toHaveBeenCalledWith(id);
      expect(result).toMatchObject({
        success: true,
        data: { id },
        message: 'Category removed successfully',
      });
      expect(result).toBeInstanceOf(BaseResponse);
    });
  });
});
