import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Stack,
  Text,
} from '@chakra-ui/react'
import React from 'react'
import { FormsSelect } from './FormSelect'
import { CreateTicketOptions } from 'models'

export const PersonalizedForm = ({
  onOptionsChange,
}: {
  onOptionsChange: (options: CreateTicketOptions) => void
}) => {
  return (
    <Stack mt="10px">
      <Accordion allowToggle>
        <AccordionItem
          border="1px solid #C4C7CF"
          borderRadius="8px"
          bg="white"
          boxShadow="sm"
        >
          <AccordionButton
            _expanded={{ bg: 'white' }}
            _hover={{ bg: 'white' }}
            borderRadius="8px"
          >
            <Text
              fontFamily="Poppins, sans-serif"
              fontSize="14px"
              fontWeight="medium"
              fontStyle="normal"
              lineHeight="24px"
            >
              Seleção do formulário personalizado
            </Text>
            <AccordionIcon ml="auto" />
          </AccordionButton>
          <AccordionPanel pb={4} as={Stack} spacing="6">
            <Box>
              Os formularios de ticket devem ser preenchidos ao abrir uma
              solicitação
            </Box>
            <FormsSelect onSelect={onOptionsChange} />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  )
}
