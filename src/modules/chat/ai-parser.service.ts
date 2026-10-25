import { prisma } from '../../config/database';
import { logger } from '../../shared/utils/logger';

export interface ParsedOrderResult {
  customerName?: string;
  phone?: string;
  fullAddress?: string;
  province?: string;
  district?: string;
  ward?: string;
  suggestedProduct?: {
    id: string;
    sku: string;
    name: string;
    price: number;
    stock: number;
  };
  quantity: number;
  notes?: string;
  confidence: number;
  rawText: string;
}

export class AiOrderParserService {
  /**
   * Parses customer conversational chat message and extracts purchasing entities:
   * recipient name, phone number, delivery address, products and quantities.
   * Utilizes regex heuristics and database fuzzy string matching.
   */
  async parseMessage(text: string): Promise<ParsedOrderResult> {
    const raw = text.trim();
    logger.info(`AI Order Parser analyzing message: "${raw}"`);

    // 1. Extract Vietnamese Phone Number (supports spaces, dots, dashes: 0912 345 678, 0379.649.280, etc.)
    const phoneRegex = /(?:(?:\+84)|0)(?:[35789])(?:[\s.-]?\d){8}/;
    const phoneMatch = raw.match(phoneRegex);
    const phone = phoneMatch ? phoneMatch[0].replace(/[\s.-]/g, '') : undefined;

    // 2. Extract Quantity
    // Patterns: "2 cái", "3 chiếc", "1 áo", "sl: 2", "x2", "số lượng 2"
    let quantity = 1;
    const qtyRegex = /(?:(\d+)\s*(?:cái|chiếc|bộ|hộp|sp|sản phẩm|áo|quần|đôi)|\b(?:sl|x|qty|số lượng)[:\s]*(\d+))/i;
    const qtyMatch = raw.match(qtyRegex);
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1] || qtyMatch[2], 10) || 1;
    }

    // 3. Extract Customer Name
    // Patterns: "tên (mình là|em là|anh là) [Tên]", "gửi cho [Tên]", "người nhận: [Tên]"
    let customerName: string | undefined;
    const nameRegex = /(?:(?:tên|mình là|em là|anh là|chị là|người nhận|khách)[:\s]+)([A-ZÀ-Ỹa-zà-ỹ\s]{2,25})(?=[,.\n]|\s(?:ở|tại|sđt|địa chỉ|ship)|$)/i;
    const nameMatch = raw.match(nameRegex);
    if (nameMatch && nameMatch[1]) {
      customerName = nameMatch[1].trim();
    }

    // 4. Extract Address
    // Patterns: "địa chỉ: ...", "về: ...", "ship đến: ...", "giao qua: ..."
    let fullAddress: string | undefined;
    const addressRegex = /(?:(?:địa chỉ|ship đến|gửi về|về|giao đến|tại|ở)[:\s]+)([^,.\n]+(?:,[^,.\n]+){1,4})/i;
    const addressMatch = raw.match(addressRegex);
    if (addressMatch && addressMatch[1]) {
      fullAddress = addressMatch[1].trim();
    } else {
      // Fallback: search for address indicators (số nhà, đường, phường, quận, tỉnh)
      const keywordRegex = /(?:số\s+\d+|đường\s+[^,]+|phường\s+[^,]+|quận\s+[^,]+|tp\s+[^,]+|tỉnh\s+[^,]+).*/i;
      const kwMatch = raw.match(keywordRegex);
      if (kwMatch) {
        fullAddress = kwMatch[0].trim();
      }
    }

    // 5. Match Product against Database catalog
    // Fetch all active products from DB
    const allProducts = await prisma.product.findMany();
    let bestMatchProduct: any = null;
    let highestScore = 0;

    const lowerRaw = raw.toLowerCase();

    for (const prod of allProducts) {
      let score = 0;
      const lowerName = prod.name.toLowerCase();
      const lowerSku = prod.sku.toLowerCase();

      // Direct SKU match
      if (lowerRaw.includes(lowerSku)) {
        score += 10;
      }

      // Keyword token matching
      const prodTokens = lowerName.split(/\s+/).filter((t) => t.length > 2);
      for (const token of prodTokens) {
        if (lowerRaw.includes(token)) {
          score += 2;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatchProduct = prod;
      }
    }

    // Default to first product if no specific keyword matched
    if (!bestMatchProduct && allProducts.length > 0) {
      bestMatchProduct = allProducts[0];
    }

    const confidence = bestMatchProduct && (phone || fullAddress) ? 0.92 : 0.65;

    return {
      customerName: customerName || undefined,
      phone,
      fullAddress,
      suggestedProduct: bestMatchProduct
        ? {
            id: bestMatchProduct.id,
            sku: bestMatchProduct.sku,
            name: bestMatchProduct.name,
            price: bestMatchProduct.price,
            stock: bestMatchProduct.stock,
          }
        : undefined,
      quantity: Math.max(1, quantity),
      confidence,
      rawText: raw,
    };
  }

  /**
   * Automatically inspects the latest customer messages in a conversation and parses order info
   */
  async parseFromConversation(conversationId: string): Promise<ParsedOrderResult> {
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        senderType: 'CUSTOMER',
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    if (messages.length === 0) {
      return {
        quantity: 1,
        confidence: 0,
        rawText: '',
      };
    }

    // Concatenate recent messages to form complete context
    const combinedText = messages
      .reverse()
      .map((m) => m.content)
      .join('\n');

    return this.parseMessage(combinedText);
  }
}
