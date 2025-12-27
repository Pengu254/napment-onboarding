import { motion } from 'framer-motion';
import { Card, Col, Row, Divider, Spacer } from './Card';
import { IconBox, Icon } from './Icon';
import { Title, Text } from './Typography';
import { Button } from './Button';
import styles from './OnboardingCard.module.css';

interface Step {
  label: string;
  completed: boolean;
}

interface OnboardingCardProps {
  title: string;
  subtitle: string;
  steps: Step[];
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimaryClick: () => void;
  onSecondaryClick?: () => void;
}

export function OnboardingCard({
  title,
  subtitle,
  steps,
  primaryLabel,
  secondaryLabel,
  onPrimaryClick,
  onSecondaryClick
}: OnboardingCardProps) {
  return (
    <Card size="sm">
      <Col align="center" gap={3} padding={{ top: 4, bottom: 2 }}>
        <IconBox name="sparkle-double" background="primary" />
        <Col align="center" gap={1}>
          <Title size="md" align="center">{title}</Title>
          <Text color="secondary" align="center">{subtitle}</Text>
        </Col>
      </Col>

      <Divider />

      <Col gap={2}>
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Row gap={2}>
              <Icon 
                name="check-circle" 
                color={step.completed ? 'success' : 'secondary'} 
              />
              <Text size="sm" color={step.completed ? 'primary' : 'secondary'}>
                {step.label}
              </Text>
              <Spacer />
            </Row>
          </motion.div>
        ))}
      </Col>

      <div className={styles.actions}>
        <Row gap={2}>
          <Button variant="primary" onClick={onPrimaryClick}>
            {primaryLabel}
          </Button>
          {secondaryLabel && onSecondaryClick && (
            <Button variant="outline" onClick={onSecondaryClick}>
              {secondaryLabel}
            </Button>
          )}
        </Row>
      </div>
    </Card>
  );
}

// Platform Selection Card
interface PlatformOption {
  id: string;
  name: string;
  icon: 'shopify' | 'woocommerce' | 'store';
  description: string;
}

interface PlatformSelectCardProps {
  title: string;
  subtitle: string;
  options: PlatformOption[];
  onSelect: (id: string) => void;
}

export function PlatformSelectCard({
  title,
  subtitle,
  options,
  onSelect
}: PlatformSelectCardProps) {
  return (
    <Card size="md">
      <Col align="center" gap={3} padding={{ top: 4, bottom: 2 }}>
        <IconBox name="store" background="primary" />
        <Col align="center" gap={1}>
          <Title size="md" align="center">{title}</Title>
          <Text color="secondary" align="center">{subtitle}</Text>
        </Col>
      </Col>

      <Divider />

      <Col gap={2}>
        {options.map((option, index) => (
          <motion.button
            key={option.id}
            className={styles.platformOption}
            onClick={() => onSelect(option.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className={styles.platformIcon}>
              <Icon name={option.icon} size="xl" />
            </span>
            <div className={styles.platformInfo}>
              <Text size="sm">{option.name}</Text>
              <Text size="xs" color="secondary">{option.description}</Text>
            </div>
            <Icon name="arrow-right" color="secondary" />
          </motion.button>
        ))}
      </Col>
    </Card>
  );
}

// Connection Card
interface ConnectionCardProps {
  platform: 'shopify' | 'woocommerce';
  title: string;
  description: string;
  features: string[];
  buttonLabel: string;
  onConnect: () => void;
  loading?: boolean;
}

export function ConnectionCard({
  platform,
  title,
  description,
  features,
  buttonLabel,
  onConnect,
  loading = false
}: ConnectionCardProps) {
  return (
    <Card size="md">
      <Col align="center" gap={3} padding={{ top: 4, bottom: 2 }}>
        <IconBox name={platform} background={platform === 'shopify' ? 'success' : 'primary'} />
        <Col align="center" gap={1}>
          <Title size="md" align="center">{title}</Title>
          <Text color="secondary" align="center">{description}</Text>
        </Col>
      </Col>

      <Divider />

      <Col gap={2}>
        {features.map((feature, index) => (
          <Row key={index} gap={2}>
            <Icon name="check-circle" color="success" />
            <Text size="sm">{feature}</Text>
            <Spacer />
          </Row>
        ))}
      </Col>

      <div className={styles.actions}>
        <Button 
          variant="primary" 
          fullWidth 
          onClick={onConnect}
          loading={loading}
        >
          {buttonLabel}
        </Button>
      </div>
    </Card>
  );
}

// Success Card
interface SuccessCardProps {
  title: string;
  subtitle: string;
  details: Array<{ label: string; value: string }>;
  buttonLabel: string;
  onContinue: () => void;
}

export function SuccessCard({
  title,
  subtitle,
  details,
  buttonLabel,
  onContinue
}: SuccessCardProps) {
  return (
    <Card size="md">
      <Col align="center" gap={3} padding={{ top: 4, bottom: 2 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <IconBox name="check-circle" background="success" />
        </motion.div>
        <Col align="center" gap={1}>
          <Title size="md" align="center">{title}</Title>
          <Text color="secondary" align="center">{subtitle}</Text>
        </Col>
      </Col>

      <Divider />

      <div className={styles.detailsBox}>
        {details.map((detail, index) => (
          <Row key={index} gap={2}>
            <Text size="sm" color="secondary">{detail.label}</Text>
            <Spacer />
            <Text size="sm">{detail.value}</Text>
          </Row>
        ))}
      </div>

      <div className={styles.actions}>
        <Button variant="primary" fullWidth onClick={onContinue}>
          {buttonLabel}
        </Button>
      </div>
    </Card>
  );
}

