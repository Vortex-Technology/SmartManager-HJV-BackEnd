/**
 *  @class WatchedList - Difines a list that can be watched for changes
 *  @template T - The type of item
 *  @prop {T} currentItems - The current items in the list
 *  @prop {T} initial - The initial items in the list. It's save a initial state when the class is instantiated
 *  @prop {T} new - The new items added to the list
 *  @prop {T} removed - The items that were removed from the list
 */
export abstract class WatchedList<T> {
  public currentItems: T[]

  private initial: T[]

  private new: T[]

  private removed: T[]

  constructor(initialItems?: T[]) {
    this.currentItems = initialItems || []
    this.initial = initialItems || []
    this.new = []
    this.removed = []
  }

  /**
   * Compare two items to verify if they are equals
   * @prop {T} a - The first item
   * @prop {T} b - The second item
   * @returns {boolean} - Equals or not
   */
  abstract compareItems(a: T, b: T): boolean

  /**
   * getItems
   * @returns {T[]} - Return the current items on the list
   */
  public getItems(): T[] {
    return this.currentItems
  }

  /**
   * getNewItems
   * @returns {T[]} - Return the new items added on the list
   */
  public getNewItems(): T[] {
    return this.new
  }

  /**
   * getRemovedItems
   * @returns {T[]} - Return the removed items of the list
   */
  public getRemovedItems(): T[] {
    return this.removed
  }

  /**
   * isCurrentItem
   *
   * @prop {T} - Item to verify
   * @returns {boolean} - The item is in the current item on the list
   */
  private isCurrentItem(item: T): boolean {
    return (
      this.currentItems.filter((v: T) => this.compareItems(item, v)).length !==
      0
    )
  }

  /**
   * isNewItem
   *
   * @prop {T} - Item to verify
   * @returns {boolean} - The item is in the new item on the list
   */
  private isNewItem(item: T): boolean {
    return this.new.filter((v: T) => this.compareItems(item, v)).length !== 0
  }

  /**
   * isRemovedItem
   *
   * @prop {T} - Item to verify
   * @returns {boolean} - The item is in the removed item on the list
   */
  private isRemovedItem(item: T): boolean {
    return (
      this.removed.filter((v: T) => this.compareItems(item, v)).length !== 0
    )
  }

  /**
   * removeFromNew - remove an item from the new items
   *
   * @prop {T} - Item to remove
   */
  private removeFromNew(item: T): void {
    this.new = this.new.filter((v) => !this.compareItems(v, item))
  }

  /*
   * removeFromCurrent - remove an item from the current items
   *
   * @prop {T} - Item to remove
   */
  private removeFromCurrent(item: T): void {
    this.currentItems = this.currentItems.filter(
      (v) => !this.compareItems(item, v),
    )
  }

  /**
   * removeFromRemoved - remove an item from the removed items
   *
   * @prop {T} - Item to remove
   */
  private removeFromRemoved(item: T): void {
    this.removed = this.removed.filter((v) => !this.compareItems(item, v))
  }

  /**
   * wasAddedInitially
   *
   * @prop {T} - Item to verify
   * @returns {boolean} - return if an item was added on the initial state
   */
  private wasAddedInitially(item: T): boolean {
    return (
      this.initial.filter((v: T) => this.compareItems(item, v)).length !== 0
    )
  }

  /**
   * exists
   *
   * @prop {T} - Item to verify
   * @returns {boolean} - The item exists on the list
   */
  public exists(item: T): boolean {
    return this.isCurrentItem(item)
  }

  /**
   * add - add an item to the current list
   *
   * @prop {T} - Item to add
   */
  public add(item: T): void {
    if (this.isRemovedItem(item)) {
      this.removeFromRemoved(item)
    }

    if (!this.isNewItem(item) && !this.wasAddedInitially(item)) {
      this.new.push(item)
    }

    if (!this.isCurrentItem(item)) {
      this.currentItems.push(item)
    }
  }

  /**
   * remove - remove an item from the current list
   *
   * @prop {T} - Item to remove
   */
  public remove(item: T): void {
    this.removeFromCurrent(item)

    if (this.isNewItem(item)) {
      this.removeFromNew(item)

      return
    }

    if (!this.isRemovedItem(item)) {
      this.removed.push(item)
    }
  }

  /**
   * update - update the list
   *
   * @prop {T} - Item to update
   */
  public update(items: T[]): void {
    const newItems = items.filter((a) => {
      return !this.getItems().some((b) => this.compareItems(a, b))
    })

    const removedItems = this.getItems().filter((a) => {
      return !items.some((b) => this.compareItems(a, b))
    })

    this.currentItems = items
    this.new = newItems
    this.removed = removedItems
  }
}
