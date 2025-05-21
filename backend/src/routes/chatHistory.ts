import express, { Router, Request, Response } from 'express';
import pool from '../db';
import { verifyToken } from '../middleware/auth';

const router: Router = express.Router();

// Define an interface for the expected request body for POST /api/chats
interface SaveChatRequestBody {
  chatId: number | null;
  title_suggestion: string | null;
  ui_selected_provider_for_session: string;
  user_message_content: string;
  assistant_message_content: string;
  assistant_message_actual_provider: string;
  assistant_message_actual_model_used: string | null;
}

// POST /api/chats - Create a new chat or add messages to an existing one
router.post('/', verifyToken, async (req: Request, res: Response) => {
  const {
    chatId,
    title_suggestion,
    ui_selected_provider_for_session,
    user_message_content,
    assistant_message_content,
    assistant_message_actual_provider,
    assistant_message_actual_model_used
  } = req.body as SaveChatRequestBody;

  const userId = (req.user as { id: number }).id;

  if (!userId) {
    return res.status(403).json({ error: 'User ID not found in token' });
  }

  if (!ui_selected_provider_for_session || !user_message_content || !assistant_message_content || !assistant_message_actual_provider) {
    return res.status(400).json({ error: 'Missing required fields for saving chat history.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let currentChatId = chatId;
    let chatDetailsResult;

    if (currentChatId === null) {
      const finalTitle = title_suggestion || user_message_content.substring(0, 75);
      const newChatQuery = `
        INSERT INTO chats (user_id, title, ui_selected_provider, created_at, updated_at, last_message_at)
        VALUES ($1, $2, $3, NOW(), NOW(), NOW())
        RETURNING id, title, ui_selected_provider, created_at, updated_at, last_message_at;
      `;
      const newChatResult = await client.query(newChatQuery, [
        userId,
        finalTitle,
        ui_selected_provider_for_session
      ]);
      currentChatId = newChatResult.rows[0].id;
      chatDetailsResult = newChatResult.rows[0];
    } else {
      const updateChatQuery = `
        UPDATE chats
        SET ui_selected_provider = $1, updated_at = NOW(), last_message_at = NOW()
        WHERE id = $2 AND user_id = $3
        RETURNING id, title, ui_selected_provider, created_at, updated_at, last_message_at;
      `;
      const updatedChatResult = await client.query(updateChatQuery, [
        ui_selected_provider_for_session,
        currentChatId,
        userId
      ]);
      if (updatedChatResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Chat not found or user not authorized.' });
      }
      chatDetailsResult = updatedChatResult.rows[0];
    }

    const userMessageQuery = `
      INSERT INTO messages (chat_id, role, content, timestamp)
      VALUES ($1, $2, $3, NOW()) RETURNING id;
    `;
    await client.query(userMessageQuery, [currentChatId, 'user', user_message_content]);

    const assistantMessageQuery = `
      INSERT INTO messages (chat_id, role, content, provider, model_used, timestamp)
      VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id;
    `;
    await client.query(assistantMessageQuery, [
      currentChatId,
      'assistant',
      assistant_message_content,
      assistant_message_actual_provider,
      assistant_message_actual_model_used
    ]);

    await client.query('COMMIT');
    res.status(201).json({
      message: chatId === null ? 'New chat created and messages saved.' : 'Messages added to chat.',
      chat: chatDetailsResult
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving chat history:', error);
    res.status(500).json({ error: 'Failed to save chat history' });
  } finally {
    client.release();
  }
});

// GET /api/chats - Fetch all chats for the user
router.get('/', verifyToken, async (req: Request, res: Response) => {
  const userId = (req.user as { id: number }).id;

  if (!userId) {
    return res.status(403).json({ error: 'User ID not found in token' });
  }

  try {
    const query = `
      SELECT id, user_id, title, ui_selected_provider, created_at, updated_at, last_message_at
      FROM chats
      WHERE user_id = $1
      ORDER BY last_message_at DESC;
    `;
    const result = await pool.query(query, [userId]);

    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching chat list:', error);
    res.status(500).json({ error: 'Failed to fetch chat list' });
  }
});

// GET /api/chats/:chatId - Fetch a specific chat with its messages
router.get('/:chatId', verifyToken, async (req: Request, res: Response) => {
  const userId = (req.user as { id: number }).id;
  const { chatId } = req.params;

  if (!userId) {
    return res.status(403).json({ error: 'User ID not found in token' });
  }
  if (!chatId || isNaN(parseInt(chatId))) {
    return res.status(400).json({ error: 'Invalid chat ID format.' });
  }

  const numericChatId = parseInt(chatId);

  try {
    // First, get the chat details
    const chatQuery = `
      SELECT id, user_id, title, ui_selected_provider, created_at, updated_at, last_message_at
      FROM chats
      WHERE id = $1 AND user_id = $2;
    `;
    const chatResult = await pool.query(chatQuery, [numericChatId, userId]);

    if (chatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found or user not authorized.' });
    }

    const chatDetails = chatResult.rows[0];

    // Then, get all messages for this chat
    const messagesQuery = `
      SELECT id, chat_id, role, content, provider, model_used, timestamp
      FROM messages
      WHERE chat_id = $1
      ORDER BY timestamp ASC;
    `;
    const messagesResult = await pool.query(messagesQuery, [numericChatId]);

    res.json({ 
      ...chatDetails,
      messages: messagesResult.rows
    });

  } catch (error) {
    console.error('Error fetching specific chat:', error);
    res.status(500).json({ error: 'Failed to fetch specific chat' });
  }
});

// PUT /api/chats/:chatId - Update chat title or UI selected provider
router.put('/:chatId', verifyToken, async (req: Request, res: Response) => {
  const userId = (req.user as { id: number }).id;
  const { chatId } = req.params;
  const { title, ui_selected_provider } = req.body;

  if (!userId) {
    return res.status(403).json({ error: 'User ID not found in token' });
  }
  if (!chatId || isNaN(parseInt(chatId))) {
    return res.status(400).json({ error: 'Invalid chat ID format.' });
  }

  const numericChatId = parseInt(chatId);

  if (!title && !ui_selected_provider) {
    return res.status(400).json({ error: 'No update fields provided (title or ui_selected_provider).' });
  }
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: 'Title must be a non-empty string if provided.' });
  }
  if (ui_selected_provider !== undefined && typeof ui_selected_provider !== 'string') {
    return res.status(400).json({ error: 'UI selected provider must be a string if provided.' });
  }

  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title.trim());
    }
    if (ui_selected_provider !== undefined) {
      updates.push(`ui_selected_provider = $${paramIndex++}`);
      values.push(ui_selected_provider);
    }

    values.push(numericChatId);
    values.push(userId);

    const query = `
      UPDATE chats
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING id, user_id, title, ui_selected_provider, created_at, updated_at, last_message_at;
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found or user not authorized for update.' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ error: 'Failed to update chat' });
  }
});

// DELETE /api/chats/:chatId - Delete a chat
router.delete('/:chatId', verifyToken, async (req: Request, res: Response) => {
  const userId = (req.user as { id: number }).id;
  const { chatId } = req.params;

  if (!userId) {
    return res.status(403).json({ error: 'User ID not found in token' });
  }
  if (!chatId || isNaN(parseInt(chatId))) {
    return res.status(400).json({ error: 'Invalid chat ID format.' });
  }

  const numericChatId = parseInt(chatId);

  try {
    const query = `
      DELETE FROM chats
      WHERE id = $1 AND user_id = $2;
    `;
    const result = await pool.query(query, [numericChatId, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Chat not found or user not authorized for delete.' });
    }

    res.status(204).send(); // No Content, standard for successful DELETE

  } catch (error) {
    console.error('Error deleting chat:', error);
    // Note: If there are messages associated, ON DELETE CASCADE should handle them.
    // If not, and messages table had a strict FK without CASCADE, this could fail here if messages exist.
    // Assuming ON DELETE CASCADE is on messages.chat_id FK as per standard good practice.
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

export default router; 