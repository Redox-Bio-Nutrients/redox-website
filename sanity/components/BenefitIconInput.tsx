// sanity/components/BenefitIconInput.tsx
//
// WHY: keyBenefitsSection's icon is stored as a plain name string
// ("stress-resilience"), but 55 names in a dropdown are unpickable by
// eye. This shows the icons themselves as a filterable grid, drawn from
// the same SVG folder the website renders from (sanity/lib/benefitIcons.ts),
// so the Studio can't offer an icon the site doesn't have.

import { useMemo, useState } from 'react'
import { Box, Button, Card, Flex, Grid, Stack, Text, TextInput } from '@sanity/ui'
import { set, unset } from 'sanity'
import type { StringInputProps } from 'sanity'
import { BENEFIT_ICON_OPTIONS, useBenefitIconSvg } from '../lib/benefitIcons'

/** One icon, loaded lazily; an empty box of the same size until then. */
export function BenefitIconPreview({ name, size }: { name?: string; size: number | string }) {
  const svg = useBenefitIconSvg(name)
  return (
    <span
      aria-hidden
      style={{ display: 'block', width: size, height: size, color: '#2E6B3E' }}
      // Repo-owned SVGs (src/assets/benefit-icons), not user content.
      dangerouslySetInnerHTML={svg ? { __html: svg.replace('<svg ', '<svg width="100%" height="100%" ') } : undefined}
    />
  )
}

export function BenefitIconInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props
  const [query, setQuery] = useState('')
  const current = BENEFIT_ICON_OPTIONS.find((icon) => icon.name === value)
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? BENEFIT_ICON_OPTIONS.filter((icon) => icon.label.toLowerCase().includes(q)) : BENEFIT_ICON_OPTIONS
  }, [query])

  return (
    <Stack space={3}>
      <Card padding={3} radius={2} border tone={current ? 'positive' : 'default'}>
        <Flex align="center" gap={3}>
          {current ? <BenefitIconPreview name={current.name} size={40} /> : null}
          <Box flex={1}>
            <Text size={1} weight="semibold">
              {current ? current.label : 'No icon chosen'}
            </Text>
          </Box>
          {current && !readOnly ? (
            <Button mode="ghost" text="Clear" fontSize={1} onClick={() => onChange(unset())} />
          ) : null}
        </Flex>
      </Card>
      <TextInput
        placeholder="Filter icons, e.g. root, stress, nutrient"
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        readOnly={readOnly}
      />
      <Grid columns={[3, 4, 6]} gap={2}>
        {shown.map((icon) => (
          <Button
            key={icon.name}
            mode={icon.name === value ? 'default' : 'ghost'}
            tone={icon.name === value ? 'positive' : 'default'}
            padding={2}
            disabled={readOnly}
            title={icon.label}
            onClick={() => onChange(set(icon.name))}
          >
            <Stack space={2}>
              <Flex justify="center">
                <BenefitIconPreview name={icon.name} size={44} />
              </Flex>
              <Text size={0} align="center" textOverflow="ellipsis">
                {icon.label}
              </Text>
            </Stack>
          </Button>
        ))}
      </Grid>
    </Stack>
  )
}
