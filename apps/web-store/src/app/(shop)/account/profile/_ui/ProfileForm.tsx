'use client';

import { startTransition, useActionState, useEffect, useRef } from 'react';
import { LoaderIcon } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuth } from '~/features/authentication';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  PhoneInput,
  showErrorMessage,
  showSuccessMessage,
  useForm,
  type SubmitHandler,
} from '~/shared/ui';
import { updateUserServerFn } from '../_api';

const formSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  phone: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

function ProfileForm() {
  const authCtx = useAuth();
  const user = authCtx?.user;
  const [firstName, lastName] = user?.name ? user.name.split(' ') : ['', ''];
  const [actionState, submitAction, actionLoading] = useActionState(
    updateUserServerFn,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName,
      lastName,
      phone: user?.phone || '',
    },
    reValidateMode: 'onSubmit',
  });
  const {
    formState: { isDirty },
    setError,
    clearErrors,
  } = form;

  useEffect(() => {
    if (actionState && actionState.success === false) {
      if (actionState.errors) {
        if (actionState.errors.name) {
          setError('firstName', {
            message: actionState.errors.name[0],
          });
          setError('lastName', {
            message: actionState.errors.name[0],
          });
        }
        if (actionState.errors.phone) {
          setError('phone', {
            message: actionState.errors.phone[0],
            type: 'required',
          });
        }
      }
      if (actionState.clientMessage) {
        showErrorMessage(actionState.clientMessage);
      }
    } else if (actionState?.success) {
      showSuccessMessage('Profile was successfully updated');
    }
  }, [actionState, setError]);

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    startTransition(() => {
      if (formRef.current) {
        const name = data.lastName
          ? `${data.firstName} ${data.lastName}`
          : data.firstName;
        const fd = new FormData();
        fd.set('id', user?.id as string);
        fd.set('name', name);
        fd.set('phone', data.phone);
        submitAction(fd);
      }
    });
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        className="space-y-3"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <input name="id" type="hidden" value={user?.id} />
        {!!user?.email && (
          <div className="space-y-2">
            <Label>Email</Label>
            <Input disabled readOnly defaultValue={user.email} />
          </div>
        )}
        <FormField
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input placeholder="Dow" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({
            field: { ref, name, value, onChange, onBlur },
            fieldState,
          }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <PhoneInput
                  ref={(intTel) => {
                    ref(intTel?.getInput());
                  }}
                  initOptions={{ containerClass: 'w-full' }}
                  initialValue={value}
                  inputProps={{ name, onBlur, required: false }}
                  onChangeNumber={(v) => {
                    if (value !== v) onChange(v);
                  }}
                  onChangeValidity={(isValid, message) => {
                    if (
                      !isValid &&
                      fieldState.isDirty &&
                      fieldState.error?.message !== message
                    ) {
                      setError('phone', {
                        message: message || 'Invalid',
                        type: 'phoneInputValidation',
                      });
                    } else if (
                      isValid &&
                      fieldState.invalid &&
                      // Clear only error caused by input component itself
                      fieldState.error?.type === 'phoneInputValidation'
                    ) {
                      clearErrors('phone');
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={!isDirty || actionLoading} type="submit">
          {actionLoading && <LoaderIcon className="animate-spin" />}
          Save
        </Button>
      </form>
    </Form>
  );
}

export default ProfileForm;
