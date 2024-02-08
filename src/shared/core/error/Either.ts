/**
 * @class Left - Define a left values
 * @template L - Define a type of error, case if the function returns
 * @template R - Define a type of success, case if the function returns
 * @prop {L} value - Store the error
 */
export class Left<L, R> {
  readonly value: L

  constructor(value: L) {
    this.value = value
  }

  /**
   * isRight - when it is called as type are seted to Right
   * @returns {boolean} - Check if the value is a right
   */
  isRight(): this is Right<L, R> {
    return false
  }

  /**
   * isLeft - when it is called as type are seted to Left
   * @returns {boolean} - Check if the value is a left
   */
  isLeft(): this is Left<L, R> {
    return true
  }
}

/**
 * @class Right - Define a right values
 * @template L - Define a type of error, case if the function returns
 * @template R - Define a type of success, case if the function returns
 * @prop {R} value - Store the success value
 */
export class Right<L, R> {
  readonly value: R

  constructor(value: R) {
    this.value = value
  }

  /**
   * isRight - when it is called as type are seted to Right
   * @returns {boolean} - Check if the value is a right
   */
  isRight(): this is Right<L, R> {
    return true
  }

  /**
   * isLeft - when it is called as type are seted to Left
   * @returns {boolean} - Check if the value is a left
   */
  isLeft(): this is Left<L, R> {
    return false
  }
}

/**
 * @class Either - Define a either type of values with can be returned of a function or method
 * @template L - Define a type of error, case if the function returns
 * @template R - Define a type of success, case if the function returns
 */
export type Either<L, R> = Left<L, R> | Right<L, R>

/**
 * left - Function factory to return a Left value
 * @prop {L} value - Value of the error
 * @returns {Left} - A instance of Left
 */
export const left = <L, R>(value: L): Either<L, R> => {
  return new Left(value)
}

/**
 * right - Function factory to return a Right value
 * @prop {R} value - Value of the success
 * @returns {Right} - A instance of Right
 */
export const right = <L, R>(value: R): Either<L, R> => {
  return new Right(value)
}