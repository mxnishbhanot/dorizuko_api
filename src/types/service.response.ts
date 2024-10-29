export type ServiceResponse<T> = Promise<T | null>;
export type ServiceArrayResponse<T> = Promise<T[]>;
export type ServiceBooleanResponse = Promise<boolean>;