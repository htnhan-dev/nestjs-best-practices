/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';

import { NotFoundException } from '@nestjs/common';
import { BrandsRepository } from './brands.repository';
import { BrandsService } from './brands.service';
import { Brand } from './schemas';

describe('BrandsService', () => {
  let service: BrandsService;
  let repository: BrandsRepository;

  const mockBrandRepository = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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
      providers: [
        BrandsService,
        {
          provide: BrandsRepository,
          useValue: mockBrandRepository,
        },
      ],
    }).compile();

    service = module.get<BrandsService>(BrandsService);
    repository = module.get<BrandsRepository>(BrandsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new brand', async () => {
      const createDto = {
        name: 'Sample Brand',
        description: 'This is a sample brand',
        image: mockImage,
      };

      mockBrandRepository.create.mockResolvedValue(mockBrand);

      const result = await service._create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockBrand);
    });
  });

  describe('find', () => {
    it('should return paginated brands', async () => {
      const paginationQuery = { page: 1, limit: 10 };
      const paginatedResult = {
        items: [mockBrand],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockBrandRepository.find.mockResolvedValue(paginatedResult);

      const result = await service._find(paginationQuery);

      expect(repository.find).toHaveBeenCalledWith(paginationQuery);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a brand by id', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockBrandRepository.findById.mockResolvedValue(mockBrand);

      const result = await service._findOne(id);

      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockBrand);
    });

    it('should throw NotFoundException when brand not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockBrandRepository.findById.mockResolvedValue(null);

      await expect(service._findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service._findOne(id)).rejects.toThrow(
        `${Brand.name} with id ${id} not found`,
      );
    });
  });

  describe('update', () => {
    it('should update a brand', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto = { name: 'Updated Brand' };
      const updatedBrand = { ...mockBrand, ...updateDto };

      mockBrandRepository.update.mockResolvedValue(updatedBrand);

      const result = await service._update(id, updateDto);

      expect(repository.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(updatedBrand);
    });

    it('should throw NotFoundException when brand not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto = { name: 'Updated Brand' };
      mockBrandRepository.update.mockResolvedValue(null);

      await expect(service._update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a brand', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockBrandRepository.remove.mockResolvedValue(true);

      const result = await service._remove(id);

      expect(repository.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual({ id });
    });

    it('should throw NotFoundException when brand not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockBrandRepository.remove.mockResolvedValue(false);

      await expect(service._remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
