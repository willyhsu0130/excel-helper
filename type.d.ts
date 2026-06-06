// src/global.d.ts
export interface IElectronAPI {
    submitForm: (formData: Record<string, string | number>) => Promise<{ success: boolean; error?: string }>;
    readExcelForm: (filePath: string) => Promise<{ success: boolean; workbookData?: Record<string, string | number | Date | null>; error?: string }>;
    getNativePath: (file: File) => string;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}