import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Stack,
  Text,
} from "@chakra-ui/react";
import React from "react";

export const TicketConfiguration = () => {
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
            _expanded={{ bg: "white" }}
            _hover={{ bg: "white" }}
            borderRadius="8px"
          >
            <Text
              fontFamily="Noto Sans"
              fontSize="14px"
              fontWeight="medium"
              fontStyle="normal"
              lineHeight="18px"
            >
              Configuração do ticket
            </Text>
            <AccordionIcon ml="auto" />
          </AccordionButton>
          <AccordionPanel pb={4} as={Stack} spacing="6">
            <Box>
              <Text
                fontFamily="Noto Sans"
                fontSize="14px"
                fontWeight="medium"
                fontStyle="normal"
                lineHeight="20px"
              >
                Para criar um ticket, é necessário fornecer algumas informações pré-definidas. Por favor, preencha os seguintes campos:
              </Text>
            </Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  );
};
