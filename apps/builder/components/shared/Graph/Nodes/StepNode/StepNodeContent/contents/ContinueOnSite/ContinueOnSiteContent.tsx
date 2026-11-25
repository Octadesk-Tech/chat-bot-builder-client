import React from 'react'
import { Stack, Text, chakra } from '@chakra-ui/react'

import { ContinueOnSiteOptions } from 'models'

import { CtaUrlIcon } from 'assets/icons'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'

type Props = {
  options?: ContinueOnSiteOptions
}

export const ContinueOnSiteContent = ({ options }: Props) => {
    const hasMessageContent = Boolean(
    options?.title ||
      options?.description ||
      options?.footer
  )

  const hasContent = Boolean(
    hasMessageContent ||
      options?.buttonText
  )

  if (!hasContent) {
    return (
      <Text color="gray.500" fontSize="sm">
        Clique para editar...
      </Text>
    )
  }

  return (
    <Stack spacing={1}>
      {options?.title && (
        <Text h={'auto'} ml={'8px'} fontWeight="bold" noOfLines={1}>
          {options.title}
        </Text>
      )}

      {options?.description && (
        <Text h={'auto'} ml={'8px'} noOfLines={3}>
          {options.description}
        </Text>
      )}

      {options?.footer && (
        <Text h={'auto'} ml={'8px'} color="gray.400" fontSize="xs" noOfLines={2}>
          {options.footer}
        </Text>
      )}

      {hasMessageContent && <OctaDivider />}

      {options?.buttonText && (
        <chakra.span
          alignSelf="center"
          display="flex"
          alignItems="center"
          gap="0.2rem"
          ml={'8px'}
          color="green.700"
          rounded="md"
          py="0.5"
          fontSize="sm"
        >
          <CtaUrlIcon boxSize={4} />
          {options.buttonText}
        </chakra.span>
      )}
    </Stack>
  )
}
