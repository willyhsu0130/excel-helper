// src/ui/pages/Index.tsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const Index = () => {
    const navigator = useNavigate()
    const [isDragActive, setIsDragActive] = useState(false);
    const [status, setStatus] = useState({ message: '', error: false });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Handle drag events to update UI styling
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };

    // 2. Process the dropped or selected file
    const processFile = async (file: File) => {
        // Validation check for Excel file extension
        if (!file.name.endsWith('.xlsx')) {
            setStatus({ message: 'Please drop a valid Excel file (.xlsx)', error: true });
            return;
        }

        setStatus({ message: `Loading ${file.name}...`, error: false });

        try {
            const nativeFilePath = window.electronAPI.getNativePath(file);

            if (!nativeFilePath) {
                throw new Error("Unable to resolve native file system path.");
            }

            // Call the IPC handler we built in your backend main process
            const response = await window.electronAPI.readExcelForm(nativeFilePath);
          
            if (response.success) {
                setStatus({ message: `Successfully loaded spreadsheet data!`, error: false });
    
                navigator("/form")

            } else {
                console.log("error")
                setStatus({ message: `Error parsing file: ${response.error}`, error: true });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setStatus({ message: `Failed to process: ${errorMessage}`, error: true });
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div style={{ maxWidth: '500px', margin: '40px auto', fontFamily: 'sans-serif' }}>
            <h2>Excel File Importer</h2>

            {/* Hidden native input picker */}
            <input
                ref={fileInputRef}
                type="file"
                id="excel-upload-input"
                accept=".xlsx"
                onChange={handleFileInput}
                style={{ display: 'none' }}
            />

            {/* Interactive Dropbox container wrapper */}
            <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
                style={{
                    height: '200px',
                    border: `2px dashed ${isDragActive ? '#007acc' : '#cccccc'}`,
                    borderRadius: '10px',
                    backgroundColor: isDragActive ? '#f0f7ff' : '#fafafa',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                }}
            >
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
                    {isDragActive ? "Drop it here!" : "Drag and drop your Excel file here"}
                </p>
                <button
                    type="button"
                    style={{
                        padding: '8px 16px',
                        background: '#007acc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Browse Files
                </button>
            </div>

            {/* Feedback Status Alert Section */}
            {status.message && (
                <div style={{
                    marginTop: '20px',
                    padding: '12px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    backgroundColor: status.error ? '#fde8e8' : '#eafaf1',
                    color: status.error ? '#e02424' : '#0e6245',
                    border: `1px solid ${status.error ? '#f8b4b4' : '#bdf0d4'}`
                }}>
                    {status.message}
                </div>
            )}
        </div>
    );
};