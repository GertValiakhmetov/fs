export class InvalidInputError extends Error {
    constructor() {
        super('Invalid input');
    }
}

export class OperationFailedError extends Error {
    constructor() {
        super('Operation Failed');
    }
}
