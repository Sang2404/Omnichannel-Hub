import { prisma } from '../../config/database';
import { ApiError } from '../../shared/utils/api-error';
import { z } from 'zod';
import { createProductSchema, updateProductSchema, queryProductSchema } from './product.validation';

type CreateProductInput = z.infer<typeof createProductSchema>;
type UpdateProductInput = z.infer<typeof updateProductSchema>;
type QueryProductInput = z.infer<typeof queryProductSchema>;

export class ProductService {
  /**
   * Helper function to serialize Shopee product mappings cleanly.
   * Converts BigInt fields to String to prevent JSON serialization errors.
   */
  private serializeProduct(product: any) {
    if (product && product.shopeeItemMapping) {
      product.shopeeItemMapping.shopeeItemId = product.shopeeItemMapping.shopeeItemId.toString();
    }
    return product;
  }

  /**
   * Creates a new Product.
   * If shopeeItemId is provided, creates a Shopee mapping transactionally.
   * 
   * @param input - Validated product parameters
   */
  async createProduct(input: CreateProductInput) {
    const existingProduct = await prisma.product.findUnique({
      where: { sku: input.sku },
    });

    if (existingProduct) {
      throw ApiError.badRequest(`SKU '${input.sku}' already exists`);
    }

    const { shopeePrice, shopeeItemId, ...productData } = input;

    // Use Prisma transaction to ensure mapping is created successfully along with product
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: productData,
      });

      if (shopeeItemId && shopeePrice) {
        await tx.shopeeProductMapping.create({
          data: {
            productId: newProduct.id,
            shopeeItemId: BigInt(shopeeItemId),
            shopeePrice,
          },
        });
      }

      return tx.product.findUnique({
        where: { id: newProduct.id },
        include: { shopeeItemMapping: true },
      });
    });

    return this.serializeProduct(product);
  }

  /**
   * Retrieves list of Products with search query and pagination.
   * 
   * @param query - Validated query parameters
   */
  async listProducts(query: QueryProductInput) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { shopeeItemMapping: true },
      }),
    ]);

    const serializedProducts = products.map((p) => this.serializeProduct(p));

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      products: serializedProducts,
    };
  }

  /**
   * Retrieves a single Product by ID.
   * 
   * @param id - UUID of product
   */
  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { shopeeItemMapping: true },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return this.serializeProduct(product);
  }

  /**
   * Updates an existing Product.
   * Supports transactional updates of Shopee product mapping.
   * 
   * @param id - UUID of product
   * @param input - Validated product attributes
   */
  async updateProduct(id: string, input: UpdateProductInput) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { shopeeItemMapping: true },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (input.sku && input.sku !== product.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: input.sku },
      });
      if (existingSku) {
        throw ApiError.badRequest(`SKU '${input.sku}' already exists`);
      }
    }

    const { shopeePrice, shopeeItemId, ...productData } = input;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: productData,
      });

      if (shopeeItemId && shopeePrice) {
        await tx.shopeeProductMapping.upsert({
          where: { productId: id },
          update: {
            shopeeItemId: BigInt(shopeeItemId),
            shopeePrice,
          },
          create: {
            productId: id,
            shopeeItemId: BigInt(shopeeItemId),
            shopeePrice,
          },
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: { shopeeItemMapping: true },
      });
    });

    return this.serializeProduct(updated);
  }

  /**
   * Deletes a Product by ID.
   * Mapping table deletes cascade automatically due to `@relation(onDelete: Cascade)` in schema.
   * 
   * @param id - UUID of product
   */
  async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    await prisma.product.delete({
      where: { id },
    });

    return { id, message: 'Product deleted successfully' };
  }
}
