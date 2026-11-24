import { config } from "./config";

const API_BASE = `https://api.telegram.org/bot${config.botToken}`;

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramContact {
  phone_number: string;
  first_name: string;
  last_name?: string;
  user_id?: number;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: {
    id: number;
    type: string;
  };
  text?: string;
  contact?: TelegramContact;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: {
    chat: { id: number };
    message_id: number;
  };
  data?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface TelegramApiResponse<T = unknown> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

async function callApi<T = unknown>(
  method: string,
  payload?: Record<string, unknown>
): Promise<TelegramApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload ?? {}),
    });
    const data = (await res.json()) as TelegramApiResponse<T>;
    if (!data.ok) {
      console.error(`[Telegram API Error] ${method}:`, data.description);
    }
    return data;
  } catch (error) {
    console.error(`[Telegram Network Error] ${method}:`, error);
    return { ok: false, description: String(error) };
  }
}

export async function getMe() {
  return callApi<{ id: number; username: string; first_name: string }>("getMe");
}

export async function deleteWebhook() {
  return callApi("deleteWebhook", { drop_pending_updates: false });
}

export async function setMyCommands(
  commands: Array<{ command: string; description: string }>
) {
  return callApi("setMyCommands", { commands });
}

export async function getUpdates(offset: number, timeoutSec = 30) {
  try {
    const res = await fetch(
      `${API_BASE}/getUpdates?timeout=${timeoutSec}&offset=${offset}&allowed_updates=${encodeURIComponent(
        JSON.stringify(["message", "callback_query"])
      )}`
    );
    return (await res.json()) as TelegramApiResponse<TelegramUpdate[]>;
  } catch (error) {
    return { ok: false, description: String(error) } as TelegramApiResponse<TelegramUpdate[]>;
  }
}

export async function sendMessage(
  chatId: string | number,
  text: string,
  replyMarkup?: Record<string, unknown>
) {
  return callApi<{ message_id: number }>("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: replyMarkup,
  });
}

export async function sendDocumentBuffer(params: {
  chatId: string | number;
  buffer: Buffer;
  fileName: string;
  caption?: string;
  replyMarkup?: Record<string, unknown>;
}) {
  try {
    const form = new FormData();
    form.append("chat_id", String(params.chatId));
    if (params.caption) {
      form.append("caption", params.caption);
      form.append("parse_mode", "HTML");
    }
    if (params.replyMarkup) {
      form.append("reply_markup", JSON.stringify(params.replyMarkup));
    }
    const blob = new Blob([new Uint8Array(params.buffer)]);
    form.append("document", blob, params.fileName);

    const res = await fetch(`${API_BASE}/sendDocument`, {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as TelegramApiResponse<{
      message_id: number;
      document?: { file_id?: string };
    }>;
    if (!data.ok) {
      console.error("[Telegram sendDocument Error]:", data.description);
    }
    return data;
  } catch (error) {
    console.error("[Telegram sendDocument Network Error]:", error);
    return { ok: false, description: String(error) } as TelegramApiResponse<{
      message_id: number;
      document?: { file_id?: string };
    }>;
  }
}

export async function sendDocumentByFileId(params: {
  chatId: string | number;
  fileId: string;
  caption?: string;
}) {
  return callApi<{ message_id: number; document?: { file_id?: string } }>("sendDocument", {
    chat_id: params.chatId,
    document: params.fileId,
    caption: params.caption,
    parse_mode: "HTML",
  });
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
  showAlert = false
) {
  return callApi("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  });
}
