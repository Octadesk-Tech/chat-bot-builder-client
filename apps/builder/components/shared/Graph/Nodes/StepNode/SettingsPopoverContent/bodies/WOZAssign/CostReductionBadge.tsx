import { HStack, Text, Tooltip } from '@chakra-ui/react'
import { FaWhatsapp } from 'react-icons/fa'

const CostReductionBadge = () => (
  <Tooltip
    label="Ao ativar, o WOZ não envia mensagem em cada redirecionamento. No WhatsApp Oficial, isso reduz o número de mensagens cobradas."
    placement="bottom"
    hasArrow
    bg="gray.800"
    color="white"
    fontSize="sm"
    borderRadius="md"
    px={3}
    py={2}
    textAlign="center"
  >
    <HStack
      as="span"
      display="inline-flex"
      spacing={1.5}
      bg="#CFF2DB"
      color="#254B3A"
      borderRadius="md"
      px={3}
      py={1.5}
      cursor="default"
    >
      <Text as="span" fontSize="xs">
        Menos mensagem e redução de custo
      </Text>
      <FaWhatsapp size={14} />
    </HStack>
  </Tooltip>
)

export default CostReductionBadge
