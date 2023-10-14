
import TypeValidator from './TypeValidator';

export default class SQLQueryBuilder {

    private columns: string | string[] = '*';
    private columns_once: string | string[] = '*';
    private filters: { column: string; operator: string; value: string }[] = [];
    private inConditions: { column: string; values: any[] }[] = [];
    private sorters: { column: string; order: string }[] = [];
    private columnTypes: Record<string, string> = {};
    private typeValidator: TypeValidator = new TypeValidator();

    setColumnType(column: string, type: string): this {
        // console.log("\tsetColumnType(" + JSON.stringify(arguments) + ")");

        this.columnTypes[column] = type;
        return this;
    }

    addInCondition(column: string, values: any[]): this {
        // console.log("\taddInCondition(" + JSON.stringify(arguments) + ")");

        this.inConditions.push({ column, values });
        return this;
    }

    select(columns: string[]): this {
        // console.log("\taddSelect(" + JSON.stringify(arguments) + ")");

        if (Array.isArray(columns) && columns.length > 0) {
            columns.forEach(column => {
                if (!this.columnTypes.hasOwnProperty(column) && column.startsWith('COUNT(') === false) {
                    throw new Error(`Column "${column}" does not exist.`);
                }
            });
            this.columns = columns.join(', ');
        } else {
            throw new Error('Columns must be provided as an array.');
        }
        return this;
    }

    select_once(columns: string[]): this {
        // console.log("\taddSelect(" + JSON.stringify(arguments) + ")");

        if (Array.isArray(columns) && columns.length > 0) {
            columns.forEach(column => {
                if (!this.columnTypes.hasOwnProperty(column) && column.startsWith('COUNT(') === false) {
                    throw new Error(`Column "${column}" does not exist.`);
                }
            });
            this.columns_once = columns.join(', ');
        } else {
            throw new Error('Columns must be provided as an array.');
        }
        return this;
    }


    addFilter(column: string, operator: string, value: any): this {
        // console.log("\taddFilter(" + JSON.stringify(arguments) + ")");
        const expectedType = this.columnTypes[column];
        if (expectedType && !this.typeValidator.isValidType(column, value, expectedType)) {
            throw new Error(`Expected type "${expectedType}" for column "${column}", got "${typeof value} = ${value}".`);
        } else {
            this.filters.push({ column, operator, value: String(value) });
        }
        return this;
    }

    addSorter(column: string, order: string): this {
        // console.log("\taddSorter(" + JSON.stringify(arguments) + ")");

        this.sorters.push({ column, order });
        return this;
    }

    private limitValue: number | undefined;
    private offsetValue: number | undefined;

    limit(limit: number): this {
        if(limit <= 0) {
            this.limitValue = undefined;
        } else {
            this.limitValue = limit;
        }
        return this;
    }

    offset(offset: number): this {
        if(offset <= 0) {
            this.offsetValue = undefined;
        } else {
            this.offsetValue = offset;
        }
        return this;
    }

    buildQuery(tableName: string): string {

        const columns = this.columns_once !== '*' ? this.columns_once : this.columns;
        this.columns_once = '*';

        let query = `SELECT ${columns} FROM ${tableName}`;

        if (this.filters.length > 0 || this.inConditions.length > 0) {

            query += ' WHERE ';

            const conditions: { column: string; operator: string; value: string }[] = [...this.filters];

            this.inConditions.forEach(inCondition => {
                const expectedType = this.columnTypes[inCondition.column];

                // console.log("\t\tinCondition: " + JSON.stringify(inCondition));
                // console.log("\t\tvalues: " + JSON.stringify(inCondition.values));

                const validatedValues = inCondition.values.filter(value =>
                    {
                        // console.log("\t\t\tExpected type: " + expectedType + ", value: " + value);
                        return true;
                        return this.typeValidator.isValidType(inCondition.column, value, expectedType)
                    }
                );

                // console.log("\t\tvalidatedValues: " + JSON.stringify(validatedValues));

                if (validatedValues.length > 0) {
                    const valuesList = validatedValues.map(value =>
                        (this.columnTypes[inCondition.column] === 'string') ? `'${value}'` : value
                    ).join(', ');
                    conditions.push({ column: inCondition.column, operator: 'IN', value: `(${valuesList})` });
                }
            });

            const conditionStrings = conditions.map(condition =>
                {
                    const valueDisplay = (this.columnTypes[condition.column] === 'string' && condition.operator != 'IN') ? `'${condition.value}'` : condition.value;
                    return `${condition.column} ${condition.operator} ${valueDisplay}`
                }
            );

            query += conditionStrings.join(' AND ');
        }

        if (this.sorters.length > 0) {
            query += ' ORDER BY ';
            query += this.sorters.map(sorter => `${sorter.column} ${sorter.order}`).join(', ');
        }

        if (this.limitValue !== undefined) {
            query += ` LIMIT ${this.limitValue}`;
        }

        if (this.offsetValue !== undefined) {
            query += ` OFFSET ${this.offsetValue}`;
        }

        return query;
    }
}
