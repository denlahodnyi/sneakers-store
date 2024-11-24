'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      className="toaster group"
      theme={theme as ToasterProps['theme']}
      toastOptions={{
        // unstyled: true,
        classNames: {
          toast:
            'flex items-center p-4 rounded-md border border-border shadow-lg bg-background',
          // title: 'group-[.error-group]:text-foreground',
          // toast:
          //   'group-[.error-group]:bg-red-300 group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          // description: 'group-[.toast]:text-muted-foreground',
          // actionButton:
          //   'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          // cancelButton:
          //   'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          error: 'error-group bg-destructive text-destructive-foreground',
          success: 'success-group bg-success text-success-foreground',
        },
      }}
      {...props}
    />
  );
};

const showErrorMessage = (message: string) => {
  toast.error(message);
};
const showSuccessMessage = (message: string) => {
  toast.success(message);
};

export { Toaster, showErrorMessage, showSuccessMessage };
