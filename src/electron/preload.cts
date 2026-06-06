// preload.cts
import electron = require('electron');

const { contextBridge, ipcRenderer, webUtils } = electron;

contextBridge.exposeInMainWorld('electronAPI', {
    submitForm: (formData: Record<string, string | number>) =>
        ipcRenderer.invoke('submit-form', formData),

    readExcelForm: (filePath: string) => ipcRenderer.invoke('read-excel-data', filePath),

    getNativePath: (file: File) => webUtils.getPathForFile(file)
});

export { };