import { Parameter } from '@aws-sdk/client-ssm';

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// The aws-sdk decides to make all parameters optional, this is silly...
export type ParameterWithRequired = WithRequired<Parameter, 'Name' | 'Value'>;
