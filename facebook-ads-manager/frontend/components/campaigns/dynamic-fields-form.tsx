'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import type { DynamicField } from '@/lib/templates/dynamic-fields';
import { applyFieldDefaults } from '@/lib/templates/dynamic-fields';

interface DynamicFieldsFormProps {
  fields: DynamicField[];
  initialValues?: Record<string, any>;
  onChange: (values: Record<string, any>, isValid: boolean) => void;
}

function generateZodSchema(fields: DynamicField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case 'text':
        fieldSchema = z.string();
        if (field.validation?.pattern) {
          fieldSchema = (fieldSchema as z.ZodString).regex(
            new RegExp(field.validation.pattern),
            `Invalid format for ${field.name}`
          );
        }
        if (field.validation?.min) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            field.validation.min,
            `Minimum length is ${field.validation.min}`
          );
        }
        if (field.validation?.max) {
          fieldSchema = (fieldSchema as z.ZodString).max(
            field.validation.max,
            `Maximum length is ${field.validation.max}`
          );
        }
        break;

      case 'number':
        fieldSchema = z.number();
        if (field.validation?.min !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).min(
            field.validation.min,
            `Minimum value is ${field.validation.min}`
          );
        }
        if (field.validation?.max !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).max(
            field.validation.max,
            `Maximum value is ${field.validation.max}`
          );
        }
        break;

      case 'url':
        fieldSchema = z.string().url('Must be a valid URL');
        break;

      default:
        fieldSchema = z.string();
    }

    if (field.required) {
      if (field.type === 'number') {
        fieldSchema = fieldSchema;
      } else {
        fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.name} is required`);
      }
    } else {
      fieldSchema = fieldSchema.optional();
    }

    shape[field.name] = fieldSchema;
  }

  return z.object(shape);
}

export function DynamicFieldsForm({
  fields,
  initialValues = {},
  onChange,
}: DynamicFieldsFormProps) {
  const schema = generateZodSchema(fields);
  const defaultValues = applyFieldDefaults(fields, initialValues);

  const {
    register,
    watch,
    formState: { errors, isValid },
    trigger,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const formValues = watch();

  useEffect(() => {
    onChange(formValues, isValid);
  }, [formValues, isValid, onChange]);

  useEffect(() => {
    trigger();
  }, [trigger]);

  if (fields.length === 0) {
    return (
      <Card className="flex h-48 items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground">
            This template has no dynamic fields to configure.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Click Next to continue.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-blue-50/50 p-4 dark:bg-blue-950/20">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Dynamic Fields
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Fill in the fields below to personalize your campaign. Required
              fields are marked with an asterisk (*).
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {fields.map((field) => {
          const error = errors[field.name];
          const isMultiline =
            field.type === 'text' &&
            field.validation?.max &&
            field.validation.max > 100;

          return (
            <div
              key={field.name}
              className={isMultiline ? 'md:col-span-2' : ''}
            >
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.name
                    .split(/[_-]/)
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    )
                    .join(' ')}
                  {field.required && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </Label>

                {isMultiline ? (
                  <Textarea
                    id={field.name}
                    {...register(field.name)}
                    placeholder={field.placeholder || `Enter ${field.name}...`}
                    className={error ? 'border-destructive' : ''}
                    aria-invalid={!!error}
                    aria-describedby={
                      error ? `${field.name}-error` : undefined
                    }
                    rows={4}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type === 'number' ? 'number' : 'text'}
                    {...register(field.name, {
                      valueAsNumber: field.type === 'number',
                    })}
                    placeholder={field.placeholder || `Enter ${field.name}...`}
                    className={error ? 'border-destructive' : ''}
                    aria-invalid={!!error}
                    aria-describedby={
                      error ? `${field.name}-error` : undefined
                    }
                    step={field.type === 'number' ? 'any' : undefined}
                  />
                )}

                {field.placeholder && !error && (
                  <p className="text-xs text-muted-foreground">
                    {field.placeholder}
                  </p>
                )}

                {error && (
                  <p
                    id={`${field.name}-error`}
                    className="text-sm text-destructive"
                    role="alert"
                  >
                    {error.message as string}
                  </p>
                )}

                {field.validation && !error && (
                  <div className="text-xs text-muted-foreground">
                    {field.type === 'number' && (
                      <>
                        {field.validation.min !== undefined &&
                          field.validation.max !== undefined && (
                            <span>
                              Range: {field.validation.min} - {field.validation.max}
                            </span>
                          )}
                        {field.validation.min !== undefined &&
                          field.validation.max === undefined && (
                            <span>Min: {field.validation.min}</span>
                          )}
                        {field.validation.max !== undefined &&
                          field.validation.min === undefined && (
                            <span>Max: {field.validation.max}</span>
                          )}
                      </>
                    )}
                    {field.type === 'text' && (
                      <>
                        {field.validation.min !== undefined &&
                          field.validation.max !== undefined && (
                            <span>
                              Length: {field.validation.min} -{' '}
                              {field.validation.max} characters
                            </span>
                          )}
                        {field.validation.max !== undefined &&
                          field.validation.min === undefined && (
                            <span>Max: {field.validation.max} characters</span>
                          )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
