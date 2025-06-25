import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getDocsClient } from './utils/googleAuth';
import { shareFileWithUser } from './utils/googleDriveUtils';

/**
 * createGoogleDocsTool
 * --------------------
 * Creates a new Google Docs document.
 */
export const createGoogleDocsTool = createTool({
  id: 'google-docs-create',
  description: 'Create a new Google Docs document.',
  inputSchema: z.object({
    title: z
      .string()
      .min(1)
      .describe('The title of the new document.'),
    content: z
      .string()
      .optional()
      .describe('The initial content of the document. Use newline characters (\\n) for line breaks.'),
    shareWithEmail: z
      .string()
      .email()
      .optional()
      .describe('Email address to share the document with (editor access).'),
  }),
  outputSchema: z.object({
    documentId: z.string().describe("The ID of the created document."),
    documentUrl: z.string().url().describe("The URL of the created document."),
  }),
  execute: async ({ context }) => {
    const { title, content, shareWithEmail } = context;
    const docs = await getDocsClient();

    try {
      const document = await docs.documents.create({
        requestBody: {
          title,
        },
      });

      const documentId = document.data.documentId;
      if (!documentId) {
        throw new Error('Failed to create document, no ID returned.');
      }

      if (content) {
        await docs.documents.batchUpdate({
          documentId,
          requestBody: {
            requests: [
              {
                insertText: {
                  location: {
                    index: 1,
                  },
                  text: content,
                },
              },
            ],
          },
        });
      }

      if (shareWithEmail) {
        await shareFileWithUser(documentId, shareWithEmail);
      }

      const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

      return {
        documentId,
        documentUrl,
      };
    } catch (error) {
      console.error('Error creating Google Docs document:', error);
      if (error instanceof Error) {
          throw new Error(`Google Docs API error: ${error.message}`);
      }
      throw new Error('An unknown error occurred while creating the Google Docs document.');
    }
  },
}); 