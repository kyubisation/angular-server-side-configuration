import { deprecate } from 'util';

export function deprecated(message: string): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    // tslint:disable-next-line
    const method = descriptor.value as Function;
    descriptor.value = deprecate(
      method,
      `${target.prototype ? 'Static ' : ''}${String(propertyKey)} is deprecated. ${message}`);
  };
}
