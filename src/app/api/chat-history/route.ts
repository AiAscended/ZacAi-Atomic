/**
 * Chat History API Route
 * Handles CRUD operations for persistent chat history
 * 
 * Endpoints:
 * - GET    /api/chat-history         - List all chats
 * - GET    /api/chat-history?id=xxx  - Get specific chat
 * - POST   /api/chat-history         - Create new chat
 * - PUT    /api/chat-history         - Update chat (add message, rename, etc.)
 * - DELETE /api/chat-history?id=xxx  - Delete chat
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const CHAT_HISTORY_DIR = path.join(process.cwd(), 'src', 'ai', 'data', 'chat-history');

type ArbitraryRecord = Record<string, unknown>;

interface ChatMessage extends ArbitraryRecord {
  id: string;
  role: string;
  content: string;
  timestamp: string;
  domain?: string;
}

interface ChatMetadata {
  createdAt: string;
  updatedAt: string;
  lastAccessed: string;
  messageCount: number;
  domains: string[];
  tags: string[];
}

interface ChatHistory {
  id: string;
  title: string;
  folder: string | null;
  userId: string;
  messages: ChatMessage[];
  metadata: ChatMetadata;
}

type SortField = 'lastAccessed' | 'updatedAt' | 'createdAt' | 'title' | 'messageCount';
type SortOrder = 'asc' | 'desc';

const SORT_FIELDS: SortField[] = ['lastAccessed', 'updatedAt', 'createdAt', 'title', 'messageCount'];
const SORT_ORDERS: SortOrder[] = ['asc', 'desc'];

function normalizeSortField(value: string | null): SortField {
  if (value && SORT_FIELDS.includes(value as SortField)) {
    return value as SortField;
  }
  return 'lastAccessed';
}

function normalizeSortOrder(value: string | null): SortOrder {
  if (value && SORT_ORDERS.includes(value as SortOrder)) {
    return value as SortOrder;
  }
  return 'desc';
}

interface ChatSummary extends Pick<ChatHistory, 'id' | 'title' | 'folder'> {
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  lastAccessed: string;
  domains: string[];
  preview: string;
}

interface ChatListOptions {
  folder?: string | null;
  sortBy?: SortField;
  order?: SortOrder;
}

type AddMessagePayload = Omit<ChatMessage, 'id' | 'timestamp'>;

type ChatUpdateBody =
  | {
      chatId: string;
      folder?: string | null;
      userId?: string;
      action: 'addMessage';
      data: AddMessagePayload;
    }
  | {
      chatId: string;
      folder?: string | null;
      userId?: string;
      action: 'updateTitle';
      data: { title: string };
    }
  | {
    chatId: string;
    folder?: string | null;
    userId?: string;
    action: 'moveToFolder';
    data: { folder: string | null };
  };

interface CreateChatRequest {
  title?: string;
  folder?: string | null;
  userId?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

// ============================================================================
// Helper Functions
// ============================================================================

async function ensureUserDirectory(userId: string) {
  const userDir = path.join(CHAT_HISTORY_DIR, `user-${userId}`);
  try {
    await fs.mkdir(userDir, { recursive: true });
  } catch {
    // Directory might already exist
  }
  return userDir;
}

async function getChatFilePath(userId: string, chatId: string, folder?: string | null) {
  const userDir = await ensureUserDirectory(userId);
  if (folder) {
    return path.join(userDir, folder, `${chatId}.json`);
  }
  return path.join(userDir, `${chatId}.json`);
}

async function loadChat(userId: string, chatId: string, folder?: string | null): Promise<ChatHistory> {
  const filePath = await getChatFilePath(userId, chatId, folder);
  const data = await fs.readFile(filePath, 'utf-8');
  const chat = JSON.parse(data) as ChatHistory;
  
  // Update last accessed
  chat.metadata.lastAccessed = new Date().toISOString();
  await saveChat(userId, chat);
  
  return chat;
}

async function saveChat(userId: string, chat: Record<string, unknown>) {
  const filePath = await getChatFilePath(userId, chat.id as string, chat.folder as string | null);
  const dirPath = path.dirname(filePath);
  
  await fs.mkdir(dirPath, { recursive: true });
  
  (chat.metadata as Record<string, unknown>).updatedAt = new Date().toISOString();
  (chat.metadata as Record<string, unknown>).messageCount = (chat.messages as unknown[]).length;
  
  await fs.writeFile(filePath, JSON.stringify(chat, null, 2), 'utf-8');
}

async function listChats(userId: string, options: Record<string, unknown> = {}) {
  const { folder = null, sortBy = 'lastAccessed', order = 'desc' } = options;
  const userDir = await ensureUserDirectory(userId);
  const searchDir = folder ? path.join(userDir, folder as string) : userDir;
  
  const chats: Record<string, unknown>[] = [];
  
  try {
    const files = await getAllChatFiles(searchDir);
    
    for (const filePath of files) {
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        const chat: Record<string, unknown> = JSON.parse(data);
        
        chats.push({
          id: chat.id,
          title: chat.title,
          folder: chat.folder,
          messageCount: (chat.metadata as Record<string, unknown>).messageCount,
          createdAt: (chat.metadata as Record<string, unknown>).createdAt,
          updatedAt: (chat.metadata as Record<string, unknown>).updatedAt,
          lastAccessed: (chat.metadata as Record<string, unknown>).lastAccessed,
          domains: (chat.metadata as Record<string, unknown>).domains,
          preview: ((chat.messages as Record<string, unknown>[])[(chat.messages as Record<string, unknown>[]).length - 1]?.content as string)?.substring(0, 100) || '',
        });
      } catch (error) {
        console.error('Error loading chat:', filePath, error);
      }
    }
  } catch {
    // Directory doesn't exist yet
    return [];
  }
  
  // Sort
  const sortField: SortField = sortBy ?? 'lastAccessed';
  const sortOrder: SortOrder = order ?? 'desc';
  chats.sort((a, b) => {
    const aVal = a[sortBy as string] as string;
    const bVal = b[sortBy as string] as string;
    return order === 'desc' ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
  });
  
  return chats;
}

async function getAllChatFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...(await getAllChatFiles(fullPath)));
      } else if (entry.name.endsWith('.json') && entry.name.startsWith('chat-')) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist
  }
  
  return files;
}

// ============================================================================
// API Handlers
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('id');
    const folder = searchParams.get('folder');
    const userId = searchParams.get('userId') || 'aiascended-001';
    
    if (chatId) {
      // Get specific chat
      const chat = await loadChat(userId, chatId, folder);
      return NextResponse.json({ success: true, data: chat });
    } else {
      // List all chats
      const sortBy = normalizeSortField(searchParams.get('sortBy'));
      const order = normalizeSortOrder(searchParams.get('order'));
      
      const chats = await listChats(userId, { folder, sortBy, order });
      return NextResponse.json({ success: true, data: chats });
    }
  } catch (error: unknown) {
    console.error('[Chat History API] GET error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateChatRequest;
    const { title = 'New Chat', folder = null, userId = 'aiascended-001' } = body;
    
    const chatId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const timestamp = new Date().toISOString();
    
    const chat: ChatHistory = {
      id: chatId,
      title,
      folder,
      userId,
      messages: [],
      metadata: {
        createdAt: timestamp,
        updatedAt: timestamp,
        lastAccessed: timestamp,
        messageCount: 0,
        domains: [],
        tags: [],
      },
    };
    
    await saveChat(userId, chat);
    
    return NextResponse.json({ success: true, data: chat });
  } catch (error: unknown) {
    console.error('[Chat History API] POST error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatUpdateBody;
    const { chatId, folder, userId = 'aiascended-001' } = body;
    
    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'chatId is required' },
        { status: 400 }
      );
    }
    
    const chat = await loadChat(userId, chatId, folder);
    
    switch (body.action) {
      case 'addMessage': {
        const payload: AddMessagePayload = body.data;
        const messageWithMeta: ChatMessage = {
          ...payload,
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          timestamp: new Date().toISOString(),
        };
        (chat.messages as unknown[]).push(messageWithMeta);
        
        if (data.domain && !(chat.metadata as { domains: string[] }).domains.includes(data.domain)) {
          (chat.metadata as { domains: string[] }).domains.push(data.domain);
        }
        break;
      }
      case 'updateTitle': {
        chat.title = body.data.title;
        break;
        
      case 'moveToFolder':
        // Delete old file
        const oldPath = await getChatFilePath(userId, chatId, chat.folder as string | null);
        try {
          await fs.unlink(oldPath);
        } catch {
          // File might not exist
        }
        chat.folder = body.data.folder;
        break;
      }
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    await saveChat(userId, chat);
    
    return NextResponse.json({ success: true, data: chat });
  } catch (error: unknown) {
    console.error('[Chat History API] PUT error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('id');
    const folder = searchParams.get('folder');
    const userId = searchParams.get('userId') || 'aiascended-001';
    
    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'chatId is required' },
        { status: 400 }
      );
    }
    
    const filePath = await getChatFilePath(userId, chatId, folder);
    await fs.unlink(filePath);
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[Chat History API] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
