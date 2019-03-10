import { deprecate } from 'util';

/**
 * Deprecate a method.
 * 
 * @param message - The deprecation message.
 * 
 * @public
 */
export function deprecated(message: string): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    // tslint:disable-next-line
    const method = descriptor.value as Function;
    descriptor.value = deprecate(
      method,
      `${target.prototype ? 'Static ' : ''}${String(propertyKey)} is deprecated. ${message}`);
  };
}
