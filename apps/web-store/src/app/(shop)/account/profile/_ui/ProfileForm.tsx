'use client';

import {
  startTransition,
  useActionState,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { LoaderIcon } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthContext } from '~/features/authentication';
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
  showErrorMessage,
  showSuccessMessage,
  useForm,
  type SubmitHandler,
} from '~/shared/ui';
import { updateUserServerFn } from '../_api';

const formSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

const splitUserName = (name: string) => {
  return name.split(' ');
};

function ProfileForm() {
  const authCtx = useContext(AuthContext);
  const user = authCtx?.user;
  const [firstName, lastName] = user?.name
    ? splitUserName(user.name)
    : ['', ''];
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
    },
  });
  const { isDirty } = form.formState;

  useEffect(() => {
    if (actionState && actionState.success === false) {
      if (actionState.errors) {
        if (actionState.errors.name) {
          form.setError('firstName', {
            message: (actionState.errors.name as string[])[0],
          });
          form.setError('lastName', {
            message: (actionState.errors.name as string[])[0],
          });
        }
      } else if (actionState.clientMessage) {
        showErrorMessage(actionState.clientMessage);
      }
    } else if (actionState?.success) {
      showSuccessMessage('Profile was successfully updated');
    }
  }, [actionState]);

  const onSubmit: SubmitHandler<FormSchema> = () => {
    startTransition(() => {
      if (formRef.current) {
        submitAction(new FormData(formRef.current));
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
        <Button disabled={!isDirty || actionLoading} type="submit">
          {actionLoading && <LoaderIcon className="animate-spin" />}
          Save
        </Button>
      </form>
    </Form>
  );
}

export default ProfileForm;
