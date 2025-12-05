/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';

import { CategoriesRepository } from './categories.repository';
import { CategoriesService } from './categories.service';
import { Category } from './schemas';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: CategoriesRepository;

  const mockCategoryRepository = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<CategoriesRepository>(CategoriesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createDto = {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        image: mockImage,
      };

      mockCategoryRepository.create.mockResolvedValue(mockCategory);

      const result = await service._create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('find', () => {
    it('should return paginated categories', async () => {
      const paginationQuery = { page: 1, limit: 10 };
      const paginatedResult = {
        items: [mockCategory],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockCategoryRepository.find.mockResolvedValue(paginatedResult);

      const result = await service._find(paginationQuery);

      expect(repository.find).toHaveBeenCalledWith(paginationQuery);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);

      const result = await service._findOne(id);

      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service._findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service._findOne(id)).rejects.toThrow(
        `${Category.name} with id ${id} not found`,
      );
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto = { name: 'Updated Electronics' };
      const updatedCategory = { ...mockCategory, ...updateDto };

      mockCategoryRepository.update.mockResolvedValue(updatedCategory);

      const result = await service._update(id, updateDto);

      expect(repository.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(updatedCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto = { name: 'Updated Electronics' };
      mockCategoryRepository.update.mockResolvedValue(null);

      await expect(service._update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockCategoryRepository.remove.mockResolvedValue(true);

      const result = await service._remove(id);

      expect(repository.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual({ id });
    });

    it('should throw NotFoundException when category not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockCategoryRepository.remove.mockResolvedValue(false);

      await expect(service._remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
