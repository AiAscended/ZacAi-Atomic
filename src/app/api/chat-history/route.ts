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

const CHAT_HISTORY_DIR = path.join(process.cwd(), 'data', 'chat-history');

// ============================================================================
// Helper Functions
// ============================================================================

async function ensureUserDirectory(userId: string) {
  const userDir = path.join(CHAT_HISTORY_DIR, `user-${userId}`);
  try {
    await fs.mkdir(userDir, { recursive: true });
  } catch (error) {
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

async function loadChat(userId: string, chatId: string, folder?: string | null) {
  const filePath = await getChatFilePath(userId, chatId, folder);
  const data = await fs.readFile(filePath, 'utf-8');
  const chat = JSON.parse(data);
  
  // Update last accessed
  chat.metadata.lastAccessed = new Date().toISOString();
  await saveChat(userId, chat);
  
  return chat;
}

async function saveChat(userId: string, chat: any) {
  const filePath = await getChatFilePath(userId, chat.id, chat.folder);
  const dirPath = path.dirname(filePath);
  
  await fs.mkdir(dirPath, { recursive: true });
  
  chat.metadata.updatedAt = new Date().toISOString();
  chat.metadata.messageCount = chat.messages.length;
  
  await fs.writeFile(filePath, JSON.stringify(chat, null, 2), 'utf-8');
}

async function listChats(userId: string, options: any = {}) {
  const { folder = null, sortBy = 'lastAccessed', order = 'desc' } = options;
  const userDir = await ensureUserDirectory(userId);
  const searchDir = folder ? path.join(userDir, folder) : userDir;
  
  const chats: any[] = [];
  
  try {
    const files = await getAllChatFiles(searchDir);
    
    for (const filePath of files) {
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        const chat = JSON.parse(data);
        
        chats.push({
          id: chat.id,
          title: chat.title,
          folder: chat.folder,
          messageCount: chat.metadata.messageCount,
          createdAt: chat.metadata.createdAt,
          updatedAt: chat.metadata.updatedAt,
          lastAccessed: chat.metadata.lastAccessed,
          domains: chat.metadata.domains,
          preview: chat.messages[chat.messages.length - 1]?.content?.substring(0, 100) || '',
        });
      } catch (error) {
        console.error('Error loading chat:', filePath, error);
      }
    }
  } catch (error) {
    // Directory doesn't exist yet
    return [];
  }
  
  // Sort
  chats.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
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
        files.push(...await getAllChatFiles(fullPath));
      } else if (entry.name.endsWith('.json') && entry.name.startsWith('chat-')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
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
      const sortBy = searchParams.get('sortBy') || 'lastAccessed';
      const order = searchParams.get('order') || 'desc';
      
      const chats = await listChats(userId, { folder, sortBy, order });
      return NextResponse.json({ success: true, data: chats });
    }
  } catch (error: any) {
    console.error('[Chat History API] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title = 'New Chat', folder = null, userId = 'aiascended-001' } = body;
    
    const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const chat = {
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
  } catch (error: any) {
    console.error('[Chat History API] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, folder, userId = 'aiascended-001', action, data } = body;
    
    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'chatId is required' },
        { status: 400 }
      );
    }
    
    const chat = await loadChat(userId, chatId, folder);
    
    switch (action) {
      case 'addMessage':
        const messageWithMeta = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...data,
          timestamp: new Date().toISOString(),
        };
        chat.messages.push(messageWithMeta);
        
        if (data.domain && !chat.metadata.domains.includes(data.domain)) {
          chat.metadata.domains.push(data.domain);
        }
        break;
        
      case 'updateTitle':
        chat.title = data.title;
        break;
        
      case 'moveToFolder':
        // Delete old file
        const oldPath = await getChatFilePath(userId, chatId, chat.folder);
        try {
          await fs.unlink(oldPath);
        } catch (error) {
          // File might not exist
        }
        chat.folder = data.folder;
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    await saveChat(userId, chat);
    
    return NextResponse.json({ success: true, data: chat });
  } catch (error: any) {
    console.error('[Chat History API] PUT error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
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
  } catch (error: any) {
    console.error('[Chat History API] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
