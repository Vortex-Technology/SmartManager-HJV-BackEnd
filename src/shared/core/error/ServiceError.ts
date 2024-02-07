/**
 * @class ServiceError - A abstract class for service errors
 * @prop {string} message - Error message
 * @prop {number} status - HTTP status
 */
export abstract class ServiceError {
  abstract message: string

  abstract status: number
}