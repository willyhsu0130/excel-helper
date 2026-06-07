// src/ui/pages/Form.tsx
import React, { useState, useEffect } from 'react';
import { fields } from '../../electron/excel/settings';
import type { fieldType } from '../../electron/excel/types/fields'; // Import the type for explicit array validation
import { Link } from 'react-router-dom';

export const Form = () => {

    const typedFields = fields as fieldType[];

    // 1. Helper to generate a blank default state object dynamically based on fields setup
    const createInitialState = (): Record<string, string> => {
        return typedFields.reduce((acc, field) => {
            acc[field.fieldName] = '';
            return acc;
        }, {} as Record<string, string>);
    };

    // 2. Initialize dynamic form data state dictionary
    const [formData, setFormData] = useState<Record<string, string>>(createInitialState);
    const [status, setStatus] = useState({ message: '', error: false });

    // Inside src/ui/pages/Form.tsx

    useEffect(() => {

        const loadCachedSpreadsheetData = async () => {
            try {
                // Ask the background memory for the last file's values
                const incomingWorkbookData = await window.electronAPI.getActiveExcelData();

                // If there's data cached back there, populate the form inputs instantly!
                if (incomingWorkbookData) {
                    const updatedState: Record<string, string> = {};

                    typedFields.forEach((field) => {
                        const extractedValue = incomingWorkbookData[field.fieldName];

                        if (extractedValue instanceof Date) {
                            updatedState[field.fieldName] = extractedValue.toISOString().split('T')[0];
                        } else if (extractedValue !== null && extractedValue !== undefined) {
                            updatedState[field.fieldName] = String(extractedValue);
                        } else {
                            updatedState[field.fieldName] = '';
                        }
                    });

                    setFormData(updatedState);
                    setStatus({ message: 'Loaded current spreadsheet values from background cache!', error: false });
                }
            } catch (err) {
                console.error("Failed to pull background workbook state data:", err);
            }
        };

        loadCachedSpreadsheetData();
    }, [typedFields]); // Notice we don't need window event listeners anymore!

    // 3. Dynamically update key matching the input name token
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // 4. Handle dynamic form submission structures
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus({ message: 'Saving tracking data...', error: false });

        // Process data formats strictly according to their field settings rules
        const processedPayload: Record<string, string | number> = {};

        typedFields.forEach((field) => {
            const rawValue = formData[field.fieldName];
            if (field.format === 'Number') {
                processedPayload[field.fieldName] = parseFloat(rawValue) || 0;
            } else {
                processedPayload[field.fieldName] = rawValue || '';
            }
        });

        try {
            // No type casting needed anymore! The signatures line up perfectly with your global definitions.
            const response = await window.electronAPI.submitForm(processedPayload);

            if (response.success) {
                setStatus({ message: 'Configuration values saved successfully!', error: false });
                setFormData(createInitialState()); // Reset elements completely
            } else {
                setStatus({ message: `Failed to save: ${response.error}`, error: true });
            }
        } catch (err) {
            console.error(err);
            setStatus({ message: 'Cannot establish backend IPC pipeline execution.', error: true });
        }
    };

    // 5. Match string configuration values to HTML standard type attribute inputs
    const getInputType = (format: 'String' | 'Number' | 'Date'): string => {
        switch (format) {
            case 'Number': return 'number';
            case 'Date': return 'date';
            default: return 'text';
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '20px auto', fontFamily: 'sans-serif' }}>
            <Link to="/">GO back </Link>
            <h2>Form</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                {/* Dynamically render fields using your strictly typed array mapper */}
                {typedFields.map((field) => (
                    <div key={field.fieldName} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label
                            htmlFor={field.fieldName}
                            style={{ fontWeight: 'bold', fontSize: '14px' }}
                        >
                            {field.fieldName}
                            <span style={{ fontSize: '11px', color: '#666', fontWeight: 'normal', marginLeft: '5px' }}>
                                ({field.sheetName} - {field.location})
                            </span>
                        </label>
                        <input
                            type={getInputType(field.format)}
                            id={field.fieldName}
                            name={field.fieldName}
                            value={formData[field.fieldName] || ''}
                            onChange={handleChange}
                            min={field.format === 'Number' ? "0" : undefined}
                            step={field.format === 'Number' ? "0.01" : undefined}
                            style={{
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                fontSize: '14px'
                            }}
                            required
                        />
                    </div>
                ))}

                <button
                    type="submit"
                    style={{
                        padding: '10px',
                        background: '#007acc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        marginTop: '10px'
                    }}
                >
                    Save Structure Data
                </button>

                {status.message && (
                    <div style={{
                        color: status.error ? '#e02424' : '#0e6245',
                        fontWeight: 'bold',
                        marginTop: '10px',
                        padding: '10px',
                        backgroundColor: status.error ? '#fde8e8' : '#eafaf1',
                        borderRadius: '4px'
                    }}>
                        {status.message}
                    </div>
                )}
            </form>
        </div>
    );
};