type ErrorType = "unique" | "foreignKey" | "notNull" | "concurrency";

export class PersistenceError extends Error {
  public readonly isUniqueConstraintViolation: boolean = false;
  public readonly isForeignKeyConstraintViolation: boolean = false;
  public readonly isNotNullConstraintViolation: boolean = false;
  public readonly isConcurrencyConflict: boolean = false;
  public readonly violatedEntityName: string | null = null;
  public readonly violatedPropertyName: string | null = null;

  private constructor(type: ErrorType, entityName: string | null, propertyName: string | null) {
    super();
    switch (type) {
      case "unique":
        this.isUniqueConstraintViolation = true;
        break;
      case "foreignKey":
        this.isForeignKeyConstraintViolation = true;
        break;
      case "notNull":
        this.isNotNullConstraintViolation = true;
        break;
      case "concurrency":
        this.isConcurrencyConflict = true;
    }

    this.violatedEntityName = entityName;
    this.violatedPropertyName = propertyName;
  }

  public static forUniqueConstraintViolation(entityName: string, propertyName: string): PersistenceError {
    return new PersistenceError("unique", entityName, propertyName);
  }

  public static forForeignKeyConstraintViolation(entityName: string, propertyName: string): PersistenceError {
    return new PersistenceError("foreignKey", entityName, propertyName);
  }

  public static forNotNullConstraint(propertyName: string): PersistenceError {
    return new PersistenceError("notNull", null, propertyName);
  }

  public static forConcurrencyConflict(): PersistenceError {
    return new PersistenceError("concurrency", null, null);
  }
}