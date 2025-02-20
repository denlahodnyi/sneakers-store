'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { z } from 'zod';

import { useAuth } from '~/features/authentication';
import { useCart } from '~/features/cart';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  PhoneInput,
  showErrorMessage,
  useForm,
  type SubmitHandler,
} from '~/shared/ui';

const formScheme = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(1),
});

export default function CheckoutCustomerForm() {
  const auth = useAuth();
  const { cart } = useCart();
  const [defaultFirstName, defaultLastName] = auth?.user?.name
    ? auth?.user.name.split(' ')
    : ['', ''];
  const form = useForm<z.infer<typeof formScheme>>({
    resolver: zodResolver(formScheme),
    defaultValues: {
      firstName: defaultFirstName || '',
      lastName: defaultLastName || '',
      email: auth?.user?.email || '',
      phone: auth?.user?.phone || '',
    },
  });
  const [submitButtonRoot, setSubmitButtonRoot] = useState<null | HTMLElement>(
    null,
  );

  useEffect(() => {
    const el = document.getElementById('pay-button-section');
    setSubmitButtonRoot(el);
  }, []);

  const onSubmit: SubmitHandler<z.infer<typeof formScheme>> = async (data) => {
    const res = await fetch('/api/checkout_session', {
      method: 'POST',
      body: JSON.stringify({
        userId: auth?.user?.id || null,
        customerData: {
          name: data.lastName
            ? `${data.firstName} ${data.lastName}`
            : data.firstName,
          email: data.email,
          phone: data.phone,
        },
        cart,
      }),
    });
    const result = (await res.json()) as
      | { success: true; url: string }
      | { success: false; error: string };

    if (result.success && result.url) {
      window.location.href = result.url;
    } else if (!result.success) {
      showErrorMessage(result.error);
    }
  };

  return (
    <Form {...form}>
      <form
        className="grid grid-cols-2 grid-rows-2 gap-4"
        id="customer-data-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input required placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input required placeholder="Dow" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input required placeholder="example@email.com" {...field} />
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
                  initialValue={value}
                  inputProps={{ name, onBlur, required: true }}
                  onChangeNumber={(v) => {
                    if (value !== v) onChange(v);
                  }}
                  onChangeValidity={(isValid, message) => {
                    if (
                      !isValid &&
                      fieldState.isDirty &&
                      fieldState.error?.message !== message
                    ) {
                      form.setError('phone', {
                        message: message || 'Invalid',
                        type: 'phoneInputValidation',
                      });
                    } else if (
                      isValid &&
                      fieldState.invalid &&
                      // Clear only error caused by input component itself
                      fieldState.error?.type === 'phoneInputValidation'
                    ) {
                      form.clearErrors('phone');
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {submitButtonRoot &&
          createPortal(
            <Button
              className="w-full text-lg"
              disabled={cart.items.length === 0}
              form="customer-data-form"
              size="lg"
              type="submit"
            >
              Continue payment
            </Button>,
            submitButtonRoot,
          )}
      </form>
    </Form>
  );
}
