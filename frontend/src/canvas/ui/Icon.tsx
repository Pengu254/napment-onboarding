import styles from './Icon.module.css';

type IconName = 
  | 'sparkle-double'
  | 'check-circle'
  | 'shopify'
  | 'woocommerce'
  | 'arrow-right'
  | 'loader'
  | 'store'
  | 'package'
  | 'image'
  | 'users';

type IconColor = 'primary' | 'success' | 'warning' | 'error' | 'white' | 'secondary';
type IconSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface IconProps {
  name: IconName;
  color?: IconColor;
  size?: IconSize;
}

const icons: Record<IconName, string> = {
  'sparkle-double': '✨',
  'check-circle': '✓',
  'shopify': '🛍️',
  'woocommerce': '🛒',
  'arrow-right': '→',
  'loader': '◌',
  'store': '🏪',
  'package': '📦',
  'image': '🖼️',
  'users': '👥'
};

export function Icon({ name, color = 'primary', size = 'md' }: IconProps) {
  return (
    <span className={`${styles.icon} ${styles[color]} ${styles[size]}`}>
      {icons[name]}
    </span>
  );
}

interface IconBoxProps {
  name: IconName;
  background?: 'primary' | 'success' | 'warning' | 'error';
}

export function IconBox({ name, background = 'primary' }: IconBoxProps) {
  return (
    <div className={`${styles.iconBox} ${styles[`bg-${background}`]}`}>
      <Icon name={name} color="white" size="2xl" />
    </div>
  );
}

