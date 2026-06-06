import type { fieldType } from "./types/fields.js"

export const fields = [{
    fieldName: "Salary",
    sheetName: "Sheet1",
    location: "B2",
    format: "Number"
}, {
    fieldName: "Name",
    sheetName: "Sheet1",
    location: "C2",
    format: "String"
}] as fieldType[]