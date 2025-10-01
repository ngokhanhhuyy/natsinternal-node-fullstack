import type { IDomainEvent } from "../domain-events/domain-event-interface.js";

export abstract class AbstractEntity {
  private _domainEvents: IDomainEvent[] = [];

  public get domainEvents(): readonly IDomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(event: IDomainEvent): void {
    this._domainEvents.push(event);
  }

  protected clearAllDomainEvents(): void {
    this._domainEvents = [];
  }
}