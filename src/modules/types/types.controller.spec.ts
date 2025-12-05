import { Test, TestingModule } from '@nestjs/testing';

import { BaseResponse } from '@/common/base';
import { TypesController } from './types.controller';
import { TypesService } from './types.service';

describe('TypesController', () => {
  let controller: TypesController;

  const mockTypesService = {
    _create: jest.fn(),
    _find: jest.fn(),
    _findOne: jest.fn(),
    _remove: jest.fn(),
    update: jest.fn(),
  };

  const mockImage = {
    url: '/storage/types/mock-image.webp',
    alt: 'Electronics',
    filename: 'mock-image.webp',
    position: 0,
  };

  const mockType = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Sample Type',
    description: 'This is a sample type',
    image: mockImage,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypesController],
      providers: [
        {
          provide: TypesService,
          useValue: mockTypesService,
        },
      ],
    }).compile();

    controller = module.get<TypesController>(TypesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new type successfully', async () => {
      const createDto = {
        name: 'Sample Type',
        description: 'This is a sample type',
        image: mockImage,
      };
      mockTypesService._create.mockResolvedValue(mockType);

      const result = await controller.create(createDto);
      expect(mockTypesService._create).toHaveBeenCalledWith(createDto);
      expect(result).toMatchObject({
        success: true,
        data: mockType,
        message: 'Type created successfully',
      });
      expect(result).toBeInstanceOf(BaseResponse);
    });
  });

  describe('update', () => {
    it('should update an existing type successfully', async () => {
      const updateDto = {
        name: 'Updated Type',
        description: 'This is an updated type',
        image: mockImage,
      };
      const typeId = '507f1f77bcf86cd799439011';
      const updatedType = { ...mockType, ...updateDto };
      mockTypesService.update.mockResolvedValue(updatedType);

      const result = await controller.update(typeId, updateDto);
      expect(mockTypesService.update).toHaveBeenCalledWith(
        typeId,
        updateDto,
        undefined,
      );
      expect(result).toMatchObject({
        success: true,
        data: updatedType,
        message: 'Type updated successfully',
      });
      expect(result).toBeInstanceOf(BaseResponse);
    });
  });

  describe('find', () => {
    it('should return paginated list of types with metadata', async () => {
      const mockTypes = [mockType];
      const mockPaginatedResult = {
        items: mockTypes,
        total: 1,
        page: 1,
        limit: 10,
      };
      const mockQuery = { page: 1, limit: 10 };
      mockTypesService._find.mockResolvedValue(mockPaginatedResult);
      const result = await controller._find(mockQuery);
      expect(mockTypesService._find).toHaveBeenCalledWith(mockQuery);
      expect(result).toMatchObject({
        success: true,
        data: mockTypes,
        message: 'Data Type retrieved successfully',
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
    it('should return a single type by ID', async () => {
      const typeId = '507f1f77bcf86cd799439011';
      mockTypesService._findOne.mockResolvedValue(mockType);

      const result = await controller._findOne(typeId);
      expect(mockTypesService._findOne).toHaveBeenCalledWith(typeId);
      expect(result).toMatchObject({
        success: true,
        data: mockType,
        message: 'Type retrieved successfully',
      });
      expect(result).toBeInstanceOf(BaseResponse);
    });
  });

  describe('remove', () => {
    it('should delete a type and return confirmation', async () => {
      const typeId = '507f1f77bcf86cd799439011';
      mockTypesService._remove.mockResolvedValue({ id: typeId });
      const result = await controller._remove(typeId);
      expect(mockTypesService._remove).toHaveBeenCalledWith(typeId);
      expect(result).toMatchObject({
        success: true,
        data: { id: typeId },
        message: 'Type removed successfully',
      });
      expect(result).toBeInstanceOf(BaseResponse);
    });
  });
});
