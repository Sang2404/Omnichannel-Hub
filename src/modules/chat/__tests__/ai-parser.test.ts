import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiOrderParserService } from '../ai-parser.service';
import { prisma } from '../../../config/database';

// Mock Prisma
vi.mock('../../../config/database', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
    },
    message: {
      findMany: vi.fn(),
    },
  },
}));

describe('AI Order Parser Service (NER & Fuzzy Match)', () => {
  let service: AiOrderParserService;

  const mockProducts = [
    {
      id: 'prod-1',
      sku: 'TSHIRT-01',
      name: 'Áo T-Shirt Cotton Unisex',
      price: 199000,
      stock: 45,
    },
    {
      id: 'prod-2',
      sku: 'JEANS-01',
      name: 'Quần Jeans Slimfit',
      price: 399000,
      stock: 20,
    },
  ];

  beforeEach(() => {
    service = new AiOrderParserService();
    vi.clearAllMocks();
    (prisma.product.findMany as any).mockResolvedValue(mockProducts);
  });

  it('should extract customer phone, address, quantity, and match product', async () => {
    const rawMessage =
      'Shop ơi ship cho mình 2 cái Áo T-Shirt Cotton về số 45 Lê Hồng Phong, TP Thủ Dầu Một, Bình Dương nhé. SĐT 0912345678, tên là Sang';

    const result = await service.parseMessage(rawMessage);

    expect(result.phone).toBe('0912345678');
    expect(result.quantity).toBe(2);
    expect(result.suggestedProduct?.sku).toBe('TSHIRT-01');
    expect(result.fullAddress).toContain('Lê Hồng Phong');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should handle variations in phone number formats (with spaces)', async () => {
    const rawMessage = 'Giao 1 áo thun qua 0379 649 280 nha shop';

    const result = await service.parseMessage(rawMessage);

    expect(result.phone).toBe('0379649280');
    expect(result.quantity).toBe(1);
    expect(result.suggestedProduct).toBeDefined();
  });
});
