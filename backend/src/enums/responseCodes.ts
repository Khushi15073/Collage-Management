/**
 * Enum for HTTP response status codes.
 * 
 * This enum defines commonly used HTTP status codes to standardize responses
 * and improve code readability across the application.
 */
export enum ResponseCodes {
    // Success codes
    OK = 200,                    // OK
    CREATED = 201,               // Created
    NO_CONTENT = 204,            // No Content
    PARTIAL_CONTENT = 206,

    // Client error codes
    BAD_REQUEST = 400,           // Bad Request
    UNAUTHORIZED = 401,          // Unauthorized
    UNPROCESS_ABLE_ENTITY = 422,          // Unauthorized
    FORBIDDEN = 403,             // Forbidden
    NOT_FOUND = 404,             // Not Found
    METHOD_NOT_ALLOWED = 405,    // Method Not Allowed
    CONFLICT = 409,              // Conflict
    TOO_MANY_REQUESTS = 429,     // Too Many Requests

    // Server error codes
    INTERNAL_SERVER_ERROR = 500, // Internal Server Error
    NOT_IMPLEMENTED = 501,       // Not Implemented
    BAD_GATEWAY = 502,           // Bad Gateway
    SERVICE_UNAVAILABLE = 503,   // Service Unavailable
    GATEWAY_TIMEOUT = 504        // Gateway Timeout
}