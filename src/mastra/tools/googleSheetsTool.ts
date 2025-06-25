import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getSheetsClient } from './utils/googleAuth';
import { shareFileWithUser } from './utils/googleDriveUtils';

/**
 * createGoogleSheetsTool
 * ----------------------
 * Creates a new Google Sheets spreadsheet.
 */
export const createGoogleSheetsTool = createTool({
  id: 'google-sheets-create',
  description: 'Create a new Google Sheets spreadsheet.',
  inputSchema: z.object({
    title: z
      .string()
      .min(1)
      .describe('The title of the new spreadsheet.'),
    shareWithEmail: z
      .string()
      .email()
      .optional()
      .describe('Email address to share the spreadsheet with (editor access).'),
  }),
  outputSchema: z.object({
    spreadsheetId: z.string().describe("The ID of the created spreadsheet."),
    spreadsheetUrl: z.string().url().describe("The URL of the created spreadsheet."),
  }),
  execute: async ({ context }) => {
    const { title, shareWithEmail } = context;
    const sheets = await getSheetsClient();

    try {
      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title,
          },
        },
      });

      const spreadsheetId = spreadsheet.data.spreadsheetId;
      if (!spreadsheetId) {
        throw new Error('Failed to create spreadsheet, no ID returned.');
      }

      if (shareWithEmail) {
        await shareFileWithUser(spreadsheetId, shareWithEmail);
      }

      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

      return {
        spreadsheetId,
        spreadsheetUrl,
      };
    } catch (error) {
      console.error('Error creating Google Sheets spreadsheet:', error);
      if (error instanceof Error) {
          throw new Error(`Google Sheets API error: ${error.message}`);
      }
      throw new Error('An unknown error occurred while creating the Google Sheets spreadsheet.');
    }
  },
}); 