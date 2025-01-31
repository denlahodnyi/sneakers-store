'use client';
import { SearchIcon } from 'lucide-react';
import Form from 'next/form';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function ProductsSearchForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const sp = useSearchParams();
  const queryParamVal = sp.get('q');
  const defaultParamVal =
    queryParamVal && queryParamVal.length ? queryParamVal : '';

  useEffect(() => {
    if (!queryParamVal && formRef.current) formRef.current.reset();
  }, [queryParamVal]);

  return (
    <Form
      ref={formRef}
      action="/store/search"
      className="bg-muted-2 relative flex items-center rounded-lg px-3 focus-within:border focus-within:border-solid focus-within:border-input"
    >
      <SearchIcon aria-hidden className="text-muted-2-foreground absolute" />
      <input
        type="search"
        placeholder="Search"
        className="placeholder:text-muted-2-foreground z-[1] h-[40px] w-full bg-transparent pl-[34px] text-lg outline-none"
        name="q"
        defaultValue={defaultParamVal}
      />
      <input type="submit" className="hidden" />
    </Form>
  );
}
