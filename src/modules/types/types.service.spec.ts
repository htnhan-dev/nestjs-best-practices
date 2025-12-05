import { Test, TestingModule } from '@nestjs/testing';

import { TypesRepository } from '@/modules/types/types.repository';
import { TypesService } from './types.service';

describe('TypesService', () => {
  let service: TypesService;

  const mockTypesRepository = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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
    description: 'This is a sample type description',
    image: mockImage,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypesService,
        {
          provide: TypesRepository,
          useValue: mockTypesRepository,
        },
      ],
    }).compile();

    service = module.get<TypesService>(TypesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new type', async () => {
      const createDto = {
        name: 'Sample Type',
        description: 'This is a sample type description',
        image: mockImage,
      };
      mockTypesRepository.create.mockResolvedValue(mockType);

      const result = await service._create(createDto);
      expect(mockTypesRepository.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockType);
    });
  });

  describe('find', () => {
    it('should return paginated types', async () => {
      const mockTypes = [mockType];
      const mockPaginatedResult = {
        items: mockTypes,
        totalItems: 1,
        currentPage: 1,
        totalPages: 1,
      };
      const paginationQuery = { page: 1, limit: 10 };
      mockTypesRepository.find.mockResolvedValue(mockPaginatedResult);
      const result = await service._find(paginationQuery);
      expect(mockTypesRepository.find).toHaveBeenCalledWith(paginationQuery);
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('findById', () => {
    it('should return a type by ID', async () => {
      const typeId = '507f1f77bcf86cd799439011';
      mockTypesRepository.findById.mockResolvedValue(mockType);
      const result = await service._findOne(typeId);
      expect(mockTypesRepository.findById).toHaveBeenCalledWith(typeId);
      expect(result).toEqual(mockType);
    });
  });

  describe('update', () => {
    it('should update a type', async () => {
      const typeId = '507f1f77bcf86cd799439011';
      const updateDto = {
        name: 'Updated Type Name',
        description: 'Updated description',
      };
      const updatedType = { ...mockType, ...updateDto };
      mockTypesRepository.update.mockResolvedValue(updatedType);
      const result = await service._update(typeId, updateDto);
      expect(mockTypesRepository.update).toHaveBeenCalledWith(
        typeId,
        updateDto,
      );
      expect(result).toEqual(updatedType);
    });
  });

  describe('remove', () => {
    it('should remove a type', async () => {
      const typeId = '507f1f77bcf86cd799439011';
      mockTypesRepository.remove.mockResolvedValue(true);
      const result = await service._remove(typeId);
      expect(mockTypesRepository.remove).toHaveBeenCalledWith(typeId);
      expect(result).toEqual({ id: typeId });
    });
  });
});
