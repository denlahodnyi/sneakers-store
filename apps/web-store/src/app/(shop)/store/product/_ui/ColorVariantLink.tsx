import Link from 'next/link';

import { getConicGradientFromHexes } from '~/shared/ui';

export default function ColorVariantLink(props: {
  disabled: boolean;
  color: string;
  hex: string[];
  href: string;
}) {
  const { disabled, color, hex, href, ...rest } = props;
  const Comp = disabled ? 'span' : Link;
  return (
    <Comp
      className="block size-6 rounded-full border border-solid border-border"
      style={{ backgroundImage: getConicGradientFromHexes(hex) }}
      {...(disabled ? ({} as { href: string }) : { href })}
      {...rest}
    >
      <span className="sr-only">{color}</span>
    </Comp>
  );
}
