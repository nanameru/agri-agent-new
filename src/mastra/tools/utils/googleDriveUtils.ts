import { getDriveClient } from './googleAuth';

/**
 * 指定されたファイルIDを持つファイルを、指定されたメールアドレスと共有します。
 * @param fileId 共有するファイルのID
 * @param emailAddress 共有先のメールアドレス
 */
export async function shareFileWithUser(fileId: string, emailAddress: string) {
    if (!fileId || !emailAddress) {
        console.warn("File ID or email address is missing, skipping file sharing.");
        return;
    }

    const drive = await getDriveClient();

    try {
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'writer', // 編集者権限を付与
                type: 'user',
                emailAddress: emailAddress,
            },
            // これを追加することで、共有相手に通知メールが飛ぶのを防ぐ場合
            // sendNotificationEmail: false, 
        });
        console.log(`Successfully shared file ${fileId} with ${emailAddress}`);
    } catch (error) {
        console.error(`Failed to share file ${fileId} with ${emailAddress}:`, error);
        // エラーを投げずに警告に留めることで、ファイル作成自体は成功として継続させる
    }
} 