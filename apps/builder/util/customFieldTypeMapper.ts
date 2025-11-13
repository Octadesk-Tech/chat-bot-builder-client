/**
 * Maps CustomFieldTypes numeric values to their corresponding primitive type strings
 * @param fieldType - The numeric field type from CustomFieldTypes enum
 * @returns The corresponding primitive type string: 'string', 'number', 'float', 'date', or 'boolean'
 */
export const mapCustomFieldTypeToString = (fieldType: number): string => {
  switch (fieldType) {
    case 4:
      return 'boolean'
    case 5:
      return 'number'
    case 6:
      return 'float'
    case 7:
      return 'date'
    default:
      return 'string'
  }
}
