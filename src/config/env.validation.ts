import {
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidationError,
  validateSync,
} from 'class-validator';

import { Type, plainToInstance } from 'class-transformer';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  PORT = 3000;
}

export const validateEnv = (
  config: Record<string, unknown>,
): EnvironmentVariables => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors: ValidationError[] = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(JSON.stringify(errors, null, 2));
  }

  return validatedConfig;
};
