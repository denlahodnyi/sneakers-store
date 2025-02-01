'use client';

import { Button, FormGroup, MenuItem, TextField } from '@mui/material';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Role, type UserResponseDto } from '@sneakers-store/contracts';
import { startTransition, useActionState, useEffect, useRef } from 'react';

import { userSchema, type UserSchema } from '~/entities/user';
import { createUser } from '../_api/user.server-fn';

type UserFormProps = {
  defaultValues?: UserResponseDto;
} & ({ actionType: 'create'; id?: never } | { actionType: 'edit'; id: string });

function UserForm({ id, defaultValues, actionType }: UserFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createUser, undefined);
  const {
    control,
    formState: { isDirty },
    handleSubmit,
    setError,
  } = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          email: defaultValues.email || '',
          name: defaultValues.name || '',
          role: defaultValues.role || ('' as UserSchema['role']),
        }
      : {
          name: '',
          email: '',
          role: '' as UserSchema['role'],
        },
  });

  const onSubmit: SubmitHandler<UserSchema> = (data) => {
    startTransition(() => {
      action(
        actionType === 'edit'
          ? { ...data, _action: 'edit', id }
          : { ...data, _action: 'create' },
      );
    });
  };

  useEffect(() => {
    if (!state?.success && state?.errors) {
      (
        Object.entries(state.errors) as [keyof typeof state.errors, string[]][]
      ).forEach(([key, messages]) => {
        if (
          Array.isArray(messages) &&
          (key === 'email' || key === 'name' || key === 'role')
        ) {
          setError(key, {
            type: 'custom',
            message: messages[0],
          });
        }
      });
    }
  }, [setError, state]);

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      <FormGroup sx={{ gap: 5, maxWidth: '480px' }}>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField
              required
              label="Name"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              required
              label="Email"
              type="email"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="role"
          render={({ field, fieldState }) => (
            <TextField
              select
              label="Role"
              {...field}
              error={fieldState.invalid}
              helperText={fieldState.error?.message}
            >
              <MenuItem value="">N/A</MenuItem>
              <MenuItem value={Role.SUPER_ADMIN}>{Role.SUPER_ADMIN}</MenuItem>
              <MenuItem value={Role.ADMIN}>{Role.ADMIN}</MenuItem>
            </TextField>
          )}
        />
      </FormGroup>
      <Button
        disabled={!isDirty || pending}
        size="large"
        sx={{ mt: 5 }}
        type="submit"
        variant="contained"
      >
        Save
      </Button>
    </form>
  );
}

export default UserForm;
