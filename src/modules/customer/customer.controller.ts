import { Request, Response, NextFunction } from 'express';
import { CustomerService } from './customer.service';
import { successResponse } from '../../shared/utils/api-response';

const customerService = new CustomerService();

export class CustomerController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await customerService.createCustomer(req.body);
      successResponse({
        res,
        statusCode: 201,
        message: 'Customer created successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await customerService.listCustomers(req.query as any);
      successResponse({
        res,
        message: 'Customers retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      successResponse({
        res,
        message: 'Customer retrieved successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await customerService.updateCustomer(req.params.id, req.body);
      successResponse({
        res,
        message: 'Customer updated successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await customerService.deleteCustomer(req.params.id);
      successResponse({
        res,
        message: 'Customer deleted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
