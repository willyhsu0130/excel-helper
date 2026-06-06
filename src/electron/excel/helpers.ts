import ExcelJS from 'exceljs';
import type { fieldType } from './types/fields.js';
import fs from "fs"

// 2. Define the allowed primitive types an Excel cell can return to your UI
export type ValidCellValue = string | number | Date | null;

// 3. Define the final structured data object returned to your React frontend
export type ExtractedDataResult = Record<string, ValidCellValue>;

export const readSpecificExcelFields = async (
    filePath: string,
    fields: fieldType[]
): Promise<ExtractedDataResult> => {

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const extractedData: ExtractedDataResult = {};

    for (const field of fields) {
        const worksheet = workbook.getWorksheet(field.sheetName);
        if (!worksheet) {
            console.warn(`Worksheet "${field.sheetName}" not found in workbook.`);
            extractedData[field.fieldName] = null;
            continue;
        }

        const cell = worksheet.getCell(field.location);
        let rawValue = cell.value;

        // Extract value from a formula object safely if present
        if (rawValue && typeof rawValue === 'object' && 'result' in rawValue) {
            rawValue = (rawValue as ExcelJS.CellFormulaValue).result;
        }

        // Process types without using 'any' by refining based on your format mapping
        if (rawValue === null || rawValue === undefined) {
            extractedData[field.fieldName] = null;
            continue;
        }

        if (field.format === 'Number') {
            const parsedNumber = Number(rawValue);
            extractedData[field.fieldName] = isNaN(parsedNumber) ? null : parsedNumber;
        } else if (field.format === 'Date') {
            extractedData[field.fieldName] = rawValue instanceof Date ? rawValue : new Date(String(rawValue));
        } else {
            // Defaulting to clean string output
            extractedData[field.fieldName] = String(rawValue).trim();
        }
    }

    return extractedData;
};


export const writeSpecificExcelFields = async (
    filePath: string,
    fields: fieldType[],
    data: Record<string, string | number>
): Promise<void> => {

    // 1. Verify the file actually exists before editing it
    if (!fs.existsSync(filePath)) {
        throw new Error(`The spreadsheet file at "${filePath}" could not be found.`);
    }

    // 2. Load the existing workbook file structure
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    // 3. Loop through your fields configuration blueprint rules
    fields.forEach((field) => {
        // Only modify cells that the form data payload actually contains
        if (field.fieldName in data) {
            const worksheet = workbook.getWorksheet(field.sheetName);
            if (!worksheet) {
                console.warn(`Worksheet "${field.sheetName}" not found in workbook during write.`);
                return;
            }

            // Find the cell mapping coordinate (e.g., "B2")
            const cell = worksheet.getCell(field.location);
            const newValue = data[field.fieldName];

            // Assign value based on the configuration formatting setting
            if (field.format === 'Number') {
                cell.value = Number(newValue);
            } else {
                cell.value = String(newValue).trim();
            }
        }
    });

    // 4. Overwrite and save the workbook back onto the original path location
    await workbook.xlsx.writeFile(filePath);
};
