import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import { successResponse } from '../../shared/utils/api-response';

const productService = new ProductService();

export class ProductController {
  /**
   * Controller handler to create a new product.
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.createProduct(req.body);
      successResponse({
        res,
        statusCode: 201,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Controller handler to get list of products with pagination.
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await productService.listProducts(req.query as any);
      successResponse({
        res,
        message: 'Products retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Controller handler to fetch single product details.
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getProductById(req.params.id);
      successResponse({
        res,
        message: 'Product retrieved successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Controller handler to edit product information.
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      successResponse({
        res,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Controller handler to delete a product.
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await productService.deleteProduct(req.params.id);
      successResponse({
        res,
        message: 'Product deleted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
