import React, { useState, useEffect, useRef, useMemo } from 'react';
import { chatApi, type Conversation, type Message } from '../services/chatApi';
import { orderApi, type Order } from '../../order/services/orderApi';
import { QuickOrderDrawer } from '../components/QuickOrderDrawer';
import { FacebookConnectCard } from '../components/FacebookConnectCard';
import { MessageSquare, Send, Plus, Search, QrCode, Tag, ChevronDown, Check, Phone, MapPin, RotateCcw } from 'lucide-react';

export type CustomerTagKey = 'NEW' | 'ORDERED' | 'VIP' | 'WARNING';

export interface CustomerTag {
  key: CustomerTagKey;
  label: string;
  color: string;
  badgeBg: string;
}

export const CUSTOMER_TAGS: Record<CustomerTagKey, CustomerTag> = {
  NEW: { key: 'NEW', label: 'Khách mới', color: 'text-blue-700 border-blue-200 bg-blue-50', badgeBg: 'bg-blue-500' },
  ORDERED: { key: 'ORDERED', label: 'Khách đã mua', color: 'text-emerald-700 border-emerald-200 bg-emerald-50', badgeBg: 'bg-emerald-500' },
  VIP: { key: 'VIP', label: 'Khách VIP', color: 'text-purple-700 border-purple-200 bg-purple-50', badgeBg: 'bg-purple-500' },
  WARNING: { key: 'WARNING', label: 'Cảnh báo boom', color: 'text-rose-700 border-rose-200 bg-rose-50', badgeBg: 'bg-rose-500' },
};

/**
 * Tự động nhận diện phân loại khách hàng đơn giản & chuẩn xác
 */
export const autoClassifyCustomer = (
  orders: Order[]
): { tag: CustomerTagKey; reason: string } => {
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED');
  const successfulOrders = orders.filter((o) => o.status !== 'CANCELLED');
  const successfulMonetary = successfulOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // 1. Cảnh báo boom: có >= 2 đơn hủy HOẶC (có ít nhất 1 đơn hủy và 0 đơn thành công)
  if (cancelledOrders.length >= 2 || (cancelledOrders.length >= 1 && successfulOrders.length === 0)) {
    return { tag: 'WARNING', reason: `Có ${cancelledOrders.length} đơn hủy` };
  }

  // 2. Khách VIP: tổng chi tiêu >= 1.000.000đ hoặc từ 3 đơn thành công
  if (successfulMonetary >= 1000000 || successfulOrders.length >= 3) {
    return {
      tag: 'VIP',
      reason: `Chi tiêu ${(successfulMonetary / 1000).toLocaleString('vi-VN')}k (${successfulOrders.length} đơn)`,
    };
  }

  // 3. Khách đã mua: đã có từ 1 - 2 đơn hàng
  if (successfulOrders.length > 0) {
    return { tag: 'ORDERED', reason: `Đã mua ${successfulOrders.length} đơn hàng` };
  }

  // 4. Khách mới: chưa từng phát sinh đơn hàng
  return { tag: 'NEW', reason: 'Chưa phát sinh đơn' };
};

const QUICK_REPLIES = [
  {
    label: 'Chào khách',
    text: 'Dạ shop chào bạn ạ! Bạn đang quan tâm mẫu nào shop tư vấn cho mình nhé.',
  },
  {
    label: 'Xin SĐT & Địa chỉ',
    text: 'Bạn cho shop xin SĐT và địa chỉ nhận hàng để shop lên đơn gửi bạn nhé.',
  },
  {
    label: 'Báo giá & Ship',
    text: 'Dạ sản phẩm đang có sẵn, ship toàn quốc 30k (đơn từ 2 sản phẩm shop freeship) ạ.',
  },
  {
    label: 'Thanh toán VietQR',
    text: 'Dạ bạn có thể quét mã QR ở trên để thanh toán nhanh, shop chuẩn bị hàng gửi ngay nhé.',
  },
  {
    label: 'Đổi trả & Đồng kiểm',
    text: 'Shop có hỗ trợ kiểm tra hàng trước khi nhận và đổi size trong 7 ngày bạn nhé.',
  },
];

export const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual override tags per conversation ID (if staff modifies manually)
  const [manualTags, setManualTags] = useState<Record<string, CustomerTagKey>>({});
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  // Quick Order Drawer state & prefilled details
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [detectedOrderPhone, setDetectedOrderPhone] = useState<string>('');
  const [detectedOrderAddress, setDetectedOrderAddress] = useState<string>('');

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await chatApi.getConversations();
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data as any).conversations || [];
        setConversations(list);

        // Khôi phục nhãn phân loại thủ công đã lưu trong PostgreSQL Supabase
        const dbTags: Record<string, CustomerTagKey> = {};
        list.forEach((c: Conversation) => {
          if (c.customer.customTag && CUSTOMER_TAGS[c.customer.customTag as CustomerTagKey]) {
            dbTags[c.id] = c.customer.customTag as CustomerTagKey;
          }
        });
        setManualTags((prev) => ({ ...dbTags, ...prev }));

        if (list.length > 0 && !activeConversation) {
          setActiveConversation(list[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await chatApi.getMessages(convId);
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data as any).messages || [];
        setMessages(list);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getOrders();
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data as any).orders || [];
        setAllOrders(list);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const content = inputText.trim();
    setInputText('');

    try {
      await chatApi.sendMessage({
        conversationId: activeConversation.id,
        content,
        messageType: 'TEXT',
      });
      await fetchMessages(activeConversation.id);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter conversations by customer name or last message
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = c.customer.name.toLowerCase().includes(q);
    const msgMatch = c.lastMessage ? c.lastMessage.toLowerCase().includes(q) : false;
    return nameMatch || msgMatch;
  });

  // Smart detection of phone numbers in customer messages
  const detectedPhone = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.senderType === 'CUSTOMER') {
        const match = m.content.match(/(0[3|5|7|8|9][0-9]{8})\b/);
        if (match) return match[1];
      }
    }
    return null;
  }, [messages]);

  // Smart detection of shipping address in customer messages
  const detectedAddress = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.senderType === 'CUSTOMER') {
        const match = m.content.match(/(?:địa chỉ|giao về|ship về|giao qua|nhận tại|về|ở)\s*[:：]?\s*([^,\n\.\!]+(?:,[^,\n\.\!]+)*)/i);
        if (match && match[1].trim().length >= 6) {
          return match[1].trim();
        }
      }
    }
    return null;
  }, [messages]);

  // Orders of active conversation customer
  const customerOrders = useMemo(() => {
    if (!activeConversation) return [];
    return allOrders.filter((o) => o.customerId === activeConversation.customerId);
  }, [allOrders, activeConversation]);

  // Automatic classification info
  const autoTagInfo = useMemo(() => {
    if (!activeConversation) return { tag: 'NEW' as CustomerTagKey, reason: 'Chưa phát sinh đơn' };
    return autoClassifyCustomer(customerOrders);
  }, [customerOrders, activeConversation]);

  // Check if staff manually chose a custom tag for this customer (persisted in DB or local state)
  const isManualOverride = Boolean(
    activeConversation && (manualTags[activeConversation.id] || activeConversation.customer.customTag)
  );
  const activeTagKey: CustomerTagKey = (
    (activeConversation && (manualTags[activeConversation.id] || (activeConversation.customer.customTag as CustomerTagKey)))
    || autoTagInfo.tag
  );
  const activeTag = CUSTOMER_TAGS[activeTagKey];

  // Save manual tag change to database & local state
  const handleSelectTag = async (k: CustomerTagKey) => {
    if (!activeConversation) return;
    const convId = activeConversation.id;
    const customerId = activeConversation.customerId;

    setManualTags((prev) => ({ ...prev, [convId]: k }));
    setIsTagDropdownOpen(false);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId ? { ...c, customer: { ...c.customer, customTag: k } } : c
      )
    );
    setActiveConversation((prev) =>
      prev ? { ...prev, customer: { ...prev.customer, customTag: k } } : null
    );

    try {
      await chatApi.updateCustomerTag(customerId, k);
    } catch (err) {
      console.error('Lỗi lưu phân loại khách vào DB:', err);
    }
  };

  // Reset to auto-detection & clear manual override in database
  const handleResetTag = async () => {
    if (!activeConversation) return;
    const convId = activeConversation.id;
    const customerId = activeConversation.customerId;

    setManualTags((prev) => {
      const next = { ...prev };
      delete next[convId];
      return next;
    });
    setIsTagDropdownOpen(false);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId ? { ...c, customer: { ...c.customer, customTag: null } } : c
      )
    );
    setActiveConversation((prev) =>
      prev ? { ...prev, customer: { ...prev.customer, customTag: null } } : null
    );

    try {
      await chatApi.updateCustomerTag(customerId, null);
    } catch (err) {
      console.error('Lỗi khôi phục phân loại khách trong DB:', err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Thẻ Kết nối Fanpage Facebook */}
      <FacebookConnectCard />

      {/* KHUNG CHAT 3 CỘT CHÍNH */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex animate-in fade-in duration-200">
        {/* CỘT 1: CONVERSATION LIST (280px) */}
        <div className="w-72 border-r border-slate-200 flex flex-col justify-between shrink-0 bg-slate-50/50">
          <div>
            {/* Header Search */}
            <div className="p-3 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Hội thoại Messenger</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm khách hàng..."
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[calc(100vh-12rem)] divide-y divide-slate-100">
              {loading ? (
                <div className="p-6 text-center text-sm text-slate-400">Đang tải cuộc chat...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">Không tìm thấy hội thoại phù hợp</div>
              ) : (
                filteredConversations.map((c) => {
                  const isActive = activeConversation?.id === c.id;
                  const cOrders = allOrders.filter((o) => o.customerId === c.customerId);
                  const isCManual = Boolean(manualTags[c.id] || c.customer.customTag);
                  const cTagKey = (
                    manualTags[c.id] ||
                    (c.customer.customTag as CustomerTagKey) ||
                    autoClassifyCustomer(cOrders).tag
                  );
                  const cTag = CUSTOMER_TAGS[cTagKey] || CUSTOMER_TAGS.NEW;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveConversation(c);
                        setIsTagDropdownOpen(false);
                      }}
                      className={`w-full p-3 text-left flex items-start gap-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-900 border border-blue-200 font-medium'
                          : 'hover:bg-slate-100/70 text-slate-700'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {c.customer.name[0]}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${cTag.badgeBg}`} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm truncate">{c.customer.name}</span>
                          <span className="text-xs text-slate-400 font-mono">FB</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5 leading-normal">{c.lastMessage || 'Chưa có tin nhắn'}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cTag.color}`}>
                            {cTag.label}
                          </span>
                          {isCManual && (
                            <span className="text-[9px] text-slate-400 font-normal">thủ công</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* CỘT 2: CHAT THREAD WINDOW (Flex 1) */}
        <div className="flex-1 flex flex-col justify-between bg-white">
          {activeConversation ? (
            <>
              {/* Header Window */}
              <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {activeConversation.customer.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{activeConversation.customer.name}</h3>
                      {/* Tag Dropdown Badge */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border flex items-center gap-1.5 transition-all shadow-2xs hover:opacity-90 ${activeTag.color}`}
                          title={isManualOverride ? 'Đã chỉnh sửa thủ công (lưu vĩnh viễn vào hệ thống)' : `Tự động nhận diện: ${autoTagInfo.reason}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${activeTag.badgeBg}`} />
                          <span>{activeTag.label}</span>
                          {isManualOverride && (
                            <span className="text-[9px] px-1 py-0.2 font-medium bg-black/10 rounded">Thủ công</span>
                          )}
                          <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                        </button>

                        {isTagDropdownOpen && (
                          <div className="absolute left-0 mt-2 w-56 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl z-40 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-150">
                            <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-100">
                              <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                                Phân loại khách
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                  isManualOverride ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {isManualOverride ? 'Đã chỉnh thủ công' : 'Tự động nhận diện'}
                              </span>
                            </div>

                            <div className="py-1">
                              {(Object.keys(CUSTOMER_TAGS) as CustomerTagKey[]).map((k) => {
                                const t = CUSTOMER_TAGS[k];
                                const isSelected = activeTagKey === k;
                                return (
                                  <button
                                    key={k}
                                    type="button"
                                    onClick={() => handleSelectTag(k)}
                                    className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className={`h-2 w-2 rounded-full ${t.badgeBg}`} />
                                      <span className="font-semibold text-slate-800">{t.label}</span>
                                    </span>
                                    {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Reset to Auto Option if manually overridden */}
                            {isManualOverride && (
                              <div className="p-1 border-t border-slate-100 mt-0.5">
                                <button
                                  type="button"
                                  onClick={handleResetTag}
                                  className="w-full px-2.5 py-1.5 text-left text-[11px] font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg flex items-center gap-1.5 transition-colors"
                                  title="Khôi phục lại phân loại được hệ thống tự động nhận diện"
                                >
                                  <RotateCcw className="h-3 w-3 text-blue-600" />
                                  <span>
                                    Khôi phục tự động ({CUSTOMER_TAGS[autoTagInfo.tag].label})
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>Facebook Messenger</span>
                    </div>
                  </div>
                </div>

                {/* Single Primary Quick Order Trigger Button */}
                <button
                  onClick={() => {
                    setDetectedOrderPhone(detectedPhone || activeConversation.customer.phone || '');
                    setDetectedOrderAddress(detectedAddress || activeConversation.customer.address || '');
                    setIsQuickOrderOpen(true);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Mở form tạo đơn hàng (tự động điền SĐT & Địa chỉ)"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tạo đơn</span>
                  {(detectedPhone || detectedAddress) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  )}
                </button>
              </div>

              {/* Messages Scroll Thread */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#f8fafc]">
                {messages.map((m) => {
                  const isCustomer = m.senderType === 'CUSTOMER';
                  const isQR = m.messageType === 'QR_CODE';
                  return (
                    <div key={m.id} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-lg p-3.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                          isCustomer
                            ? 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                            : isQR
                            ? 'bg-blue-50 text-blue-900 border border-blue-200 rounded-br-none'
                            : 'bg-blue-600 text-white rounded-br-none'
                        }`}
                      >
                        {isQR && (
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2 font-bold text-blue-700 pb-2 border-b border-blue-200 text-sm">
                              <QrCode className="h-4.5 w-4.5 text-blue-600" />
                              <span>MÃ THANH TOÁN QR</span>
                            </div>
                            {/* Visual VietQR Code Image */}
                            <div className="p-3 bg-white rounded-xl border border-blue-200 flex flex-col items-center justify-center my-2.5 shadow-xs">
                              <img
                                src={(() => {
                                  const matchAmount = m.content.match(/(\d[\d\.]*)\s*đ/);
                                  const amountStr = matchAmount ? matchAmount[1].replace(/\./g, '') : '180000';
                                  const matchCode = m.content.match(/#(\w+)/);
                                  const code = matchCode ? matchCode[1] : '';
                                  return `https://img.vietqr.io/image/970422-0123456789-compact2.png?amount=${amountStr}&addInfo=TDMU${code}%20thanh%20toan&accountName=OMNICHANNEL%20HUB`;
                                })()}
                                alt="Mã VietQR Thanh Toán"
                                className="w-48 h-48 object-contain rounded-lg"
                              />
                              <span className="text-xs text-slate-500 font-medium mt-1.5">
                                Quét mã VietQR để thanh toán
                              </span>
                            </div>
                          </div>
                        )}
                        <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                        <span className={`text-xs mt-1.5 block text-right ${isCustomer ? 'text-slate-400' : isQR ? 'text-blue-500' : 'text-blue-100'}`}>
                          {new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Response Toolbar */}
              <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="font-semibold text-slate-500 shrink-0 text-xs">
                  Trả lời nhanh:
                </span>
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr.label}
                    type="button"
                    onClick={() => setInputText(qr.text)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-lg font-medium text-slate-600 transition-colors shrink-0"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>

              {/* Input Form Footer */}
              <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-200 flex items-center gap-2.5 bg-white">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Gửi</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-sm text-slate-400">
              <MessageSquare className="h-12 w-12 text-slate-300 mb-2" />
              <span>Chọn một cuộc hội thoại bên trái để bắt đầu chat & tạo đơn!</span>
            </div>
          )}
        </div>

        {/* CỘT 3: CUSTOMER CONTEXT SIDEBAR (280px) */}
        {activeConversation && (
          <div className="w-80 border-l border-slate-200 p-4 bg-slate-50/50 flex flex-col justify-between shrink-0 overflow-y-auto">
            <div className="space-y-4">
              <div className="text-center pb-3 border-b border-slate-200">
                <div className="h-12 w-12 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-2 shadow-xs">
                  {activeConversation.customer.name[0]}
                </div>
                <h4 className="font-bold text-slate-900 text-base">{activeConversation.customer.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Kênh: Facebook Messenger</p>
                <div className="mt-2.5 flex flex-col items-center gap-1">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${activeTag.color}`}>
                    {activeTag.label}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isManualOverride ? 'Đã chỉnh sửa thủ công' : `Tự động: ${autoTagInfo.reason}`}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <h5 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Hồ Sơ Khách Hàng</h5>
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-slate-600 text-sm shadow-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-500">SĐT:</span>
                    <strong className="text-slate-900 font-mono text-xs tabular-nums">
                      {activeConversation.customer.phone || detectedPhone || 'Chưa cập nhật'}
                    </strong>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-500">Địa chỉ:</span>
                    <strong className="text-slate-900 text-xs">
                      {activeConversation.customer.address || 'Chưa cập nhật'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Lịch sử đơn hàng của khách */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Lịch sử đơn hàng</h5>
                  <span className="text-xs text-slate-500 font-medium">{customerOrders.length} đơn</span>
                </div>
                {customerOrders.length > 0 ? (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {customerOrders.slice(0, 5).map((o) => (
                      <div key={o.id} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-slate-900 font-mono">#{o.orderCode}</span>
                          <span className="text-blue-600 font-bold">{Number(o.totalAmount).toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
                          <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                            {o.status === 'PAID' ? 'Đã thanh toán' : o.status === 'SHIPPED' ? 'Đang giao' : o.status === 'COMPLETED' ? 'Hoàn tất' : o.status === 'CANCELLED' ? 'Đã hủy' : 'Chờ thanh toán'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-center text-xs text-slate-400">
                    Chưa có đơn hàng nào
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Order Drawer */}
        {activeConversation && (
          <QuickOrderDrawer
            isOpen={isQuickOrderOpen}
            onClose={() => setIsQuickOrderOpen(false)}
            customerId={activeConversation.customerId}
            customerName={activeConversation.customer.name}
            conversationId={activeConversation.id}
            initialPhone={detectedOrderPhone || activeConversation.customer.phone || ''}
            initialAddress={detectedOrderAddress || activeConversation.customer.address || ''}
            originalPhone={activeConversation.customer.phone || ''}
            originalAddress={activeConversation.customer.address || ''}
            onCustomerUpdated={(updated) => {
              setActiveConversation((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  customer: {
                    ...prev.customer,
                    phone: updated.phone ?? prev.customer.phone,
                    address: updated.address ?? prev.customer.address,
                  },
                };
              });
              setConversations((prev) =>
                prev.map((c) =>
                  c.customerId === activeConversation.customerId
                    ? {
                        ...c,
                        customer: {
                          ...c.customer,
                          phone: updated.phone ?? c.customer.phone,
                          address: updated.address ?? c.customer.address,
                        },
                      }
                    : c
                )
              );
            }}
            onOrderCreated={() => {
              fetchMessages(activeConversation.id);
              fetchOrders();
            }}
          />
        )}
      </div>
    </div>
  );
};
