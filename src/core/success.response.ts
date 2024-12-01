'use strict'

enum StatusCode {
    OK = 200,
    CREATE = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204
}

enum ReasonStatusCode {
    OK = 'Success!',
    CREATED = 'Created!',
    ACCEPTED = 'Accepted',
    NO_CONTENT = 'No Content'
}

interface Metadata {
    [key: string]: any
}

interface ResponseOptions {
    message?: string;
    metadata?: Metadata;
}

class SuccessResponse {
    message: string;
    status: StatusCode;
    metadata: Metadata;

    constructor({
        message,
        reasonStatusCode = ReasonStatusCode.OK,
        statusCode = StatusCode.OK,
        metadata = {}
    }: {
        message?: string;
        reasonStatusCode?: ReasonStatusCode;
        statusCode?: StatusCode;
        metadata?: Metadata;
    }) {
        this.message = message || reasonStatusCode
        this.status = statusCode
        this.metadata = metadata
    }

    send(res: any) {
        return res.status(this.status).json(this);
    }
}

class OK extends SuccessResponse {
    constructor({
        message,
        metadata
    }: ResponseOptions) {
        super({message, metadata})
    }
}

class CREATED extends SuccessResponse {
    constructor({
        message,
        reasonStatusCode = ReasonStatusCode.CREATED,
        statusCode = StatusCode.CREATE,
        metadata
    } : ResponseOptions & {
        statusCode?: StatusCode,
        reasonStatusCode?: ReasonStatusCode
    }) {
        super({message, reasonStatusCode, statusCode, metadata})
    }
}

export { OK, CREATED, SuccessResponse};