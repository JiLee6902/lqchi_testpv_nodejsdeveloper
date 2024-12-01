'use strict'

import { statusCodes } from "../utils/statusCodes.js";
import { reasonPhrases } from "../utils/reasonPhrase.js";

class ErrorResponse extends Error {
    status: number;
    now: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.now = Date.now()

        Object.setPrototypeOf(this, ErrorResponse.prototype)
    }
}


class BadRequestError extends ErrorResponse {
    constructor(
        message: string = reasonPhrases.BAD_REQUEST,
        status: number = statusCodes.BAD_REQUEST
    ) {
        super(message,status);
        Object.setPrototypeOf(this, BadRequestError.prototype)
    }
}

class AuthFailureError extends ErrorResponse {
    constructor(
        message: string = reasonPhrases.UNAUTHORIZED,
        status: number = statusCodes.UNAUTHORIZED
    ) {
        super(message, status);
        Object.setPrototypeOf(this, AuthFailureError.prototype);
    }
}

class NotFoundError extends ErrorResponse {
    constructor(
        message: string = reasonPhrases.NOT_FOUND,
        status: number = statusCodes.NOT_FOUND
    ) {
        super(message, status);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export {
    ErrorResponse,
    BadRequestError,
    AuthFailureError,
    NotFoundError,
};