import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { getPreloadPath } from './pathResolver.js';
import { readSpecificExcelFields, writeSpecificExcelFields } from './excel/helpers.js';
import { fields } from './excel/settings.js';

let activeExcelFilePath: string | null = null;

app.on("ready", () => {
    const mainWindow = new BrowserWindow({
        width: 600,
        height: 700,
        webPreferences: {

            preload: getPreloadPath(),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    if (isDev()) {
        mainWindow.loadURL("http://localhost:5174");
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }
    // pollResource();
});

// 2. Listen for the form submission IPC
ipcMain.handle('submit-form', async (_event, data: Record<string, string | number>) => {
    try {
        // Check if we have a saved file path to write to
        if (!activeExcelFilePath) {
            throw new Error("No active Excel file has been loaded yet. Please drop a file first.");
        }

        console.log('Main process modifying Excel path:', activeExcelFilePath);

        // Pass the saved file path directly into your helper function
        await writeSpecificExcelFields(activeExcelFilePath, fields, data);

        return { success: true };

    } catch (err) {
        console.error('Failed to write spreadsheet data:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        return { success: false, error: errorMessage };
    }
});

ipcMain.handle('read-excel-data', async (_event, filePath) => {
    try {
        // 1. Log the incoming local path to verify it's hitting the backend
        activeExcelFilePath = filePath
        console.log('Main process parsing Excel file from path:', filePath);

        // 2. Call your ExcelJS helper to read and parse the workbook rows
        const extractedWorkbookData = await readSpecificExcelFields(filePath, fields);

        // 3. Return the parsed spreadsheet data object back to React!
        return {
            success: true,
            workbookData: extractedWorkbookData
        };

    } catch (err) {
        console.error('Failed to parse Excel file:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';

        // Return the error back to the frontend UI gracefully
        return { success: false, error: errorMessage };
    }
})