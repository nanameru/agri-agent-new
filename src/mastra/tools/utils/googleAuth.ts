import { google } from 'googleapis';

let authInitialized = false;

/**
 * Google APIのグローバル認証を初期化します。
 * 環境変数 `GOOGLE_APPLICATION_CREDENTIALS_JSON` を使用します。
 * 一度だけ実行されます。
 */
async function initializeAuth() {
  if (authInitialized) {
    return;
  }

  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentialsJson) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set.');
  }

  try {
    const credentials = JSON.parse(credentialsJson);

    // すべてのAPIで共通のスコープを持つ認証インスタンスを作成
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/presentations',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });

    // googleapis全体で使われるグローバルな認証クライアントとして設定
    google.options({ auth });
    authInitialized = true;

  } catch (error) {
    console.error("Failed to parse or use Google credentials:", error);
    throw new Error("Invalid Google credentials provided in GOOGLE_APPLICATION_CREDENTIALS_JSON.");
  }
}

/**
 * Google Slides APIのクライアントを取得します。
 */
export async function getSlidesClient() {
  await initializeAuth();
  return google.slides({ version: 'v1' });
}

/**
 * Google Sheets APIのクライアントを取得します。
 */
export async function getSheetsClient() {
  await initializeAuth();
  return google.sheets({ version: 'v4' });
}

/**
 * Google Docs APIのクライアントを取得します。
 */
export async function getDocsClient() {
  await initializeAuth();
  return google.docs({ version: 'v1' });
}

/**
 * Google Drive APIのクライアントを取得します。
 */
export async function getDriveClient() {
  await initializeAuth();
  return google.drive({ version: 'v3' });
}

/**
 * 認証を初期化します（後方互換性のため）
 */
export async function getGoogleAuth() {
  await initializeAuth();
  return google;
} 