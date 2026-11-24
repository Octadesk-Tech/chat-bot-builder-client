import { WarningTwoIcon } from '@chakra-ui/icons'
import { HStack, Text } from '@chakra-ui/react'

export const BlockErrorFallback = () => (
  <HStack
    data-testid="block-error-fallback"
    p="3"
    rounded="lg"
    borderWidth="1px"
    borderColor="red.200"
    bgColor="red.50"
    color="red.600"
    fontSize="sm"
  >
    <WarningTwoIcon />
    <Text>Não foi possível abrir este bloco</Text>
  </HStack>
)
