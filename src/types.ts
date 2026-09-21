export type SerializedError = {
  name: string;
  message: string;
  stack: string;
  code?: string|number;
  cause?: string;
  errors?: SerializedError[];
};

export type ErrorConstructorOptions = {
  construct?: boolean;
  args?: (subject: SerializedError) => unknown[];
};
