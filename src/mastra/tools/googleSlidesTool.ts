import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getSlidesClient } from './utils/googleAuth';
import { shareFileWithUser } from './utils/googleDriveUtils';

/**
 * googleSlidesTool
 * ----------------
 * Creates and manipulates Google Slides presentations.
 *
 * NOTE: Service account credentials must be provided via the 
 * `GOOGLE_APPLICATION_CREDENTIALS_JSON` environment variable.
 */
export const createGoogleSlidesTool = createTool({
  id: 'google-slides-create',
  description: 'Create a new Google Slides presentation.',
  inputSchema: z.object({
    title: z
      .string()
      .min(1)
      .describe('The title of the new presentation.'),
    shareWithEmail: z
      .string()
      .email()
      .optional()
      .describe('Email address to share the presentation with (editor access).'),
  }),
  outputSchema: z.object({
    presentationId: z.string().describe("The ID of the created presentation."),
    presentationUrl: z.string().url().describe("The URL of the created presentation."),
  }),
  execute: async ({ context }) => {
    const { title, shareWithEmail } = context;
    const slides = await getSlidesClient();

    try {
      const presentation = await slides.presentations.create({
        requestBody: {
          title,
        },
      });

      const presentationId = presentation.data.presentationId;
      if (!presentationId) {
        throw new Error('Failed to create presentation, no ID returned.');
      }

      // ファイル共有処理を呼び出し
      if (shareWithEmail) {
        await shareFileWithUser(presentationId, shareWithEmail);
      }

      const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;

      return {
        presentationId,
        presentationUrl,
      };
    } catch (error) {
      console.error('Error creating Google Slides presentation:', error);
      // エラーメッセージをより具体的にする
      if (error instanceof Error) {
          throw new Error(`Google Slides API error: ${error.message}`);
      }
      throw new Error('An unknown error occurred while creating the Google Slides presentation.');
    }
  },
}); 