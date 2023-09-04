class TypeValidator {
    private typeMap: Record<string, (value: any) => boolean> = {
        string: (value: any) => typeof value === 'string',
        number: (value: any) => typeof value === 'number',
        date: (value: any) => typeof value === 'string' && !isNaN(Date.parse(value)),
        // Add more type validations as needed
    };

    isValidType(column: string, value: any, expectedType: string): boolean {
        const validator = this.typeMap[expectedType];
        return validator ? validator(value) : false;
    }
}

export default TypeValidator;
