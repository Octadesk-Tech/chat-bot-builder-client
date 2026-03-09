import React, { useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Stack,
  Textarea as ChakraTextarea,
  Tooltip,
  Text,
} from '@chakra-ui/react'
import { OutlineInformationIcon } from 'assets/icons'
import { parseCurlCommand, ParsedCurl } from 'services/curlParser'

type Props = {
  onImport: (parsed: ParsedCurl) => void
}

export const CurlImportView = ({ onImport }: Props) => {
  const [curlInput, setCurlInput] = useState('')
  const [curlError, setCurlError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setCurlInput(value)

    const trimmed = value.trim()
    if (!trimmed) {
      setCurlError('')
      return
    }

    const parsed = parseCurlCommand(trimmed)
    if (!parsed) {
      setCurlError(
        'Esse não parece ser um comando cURL válido. Confira e tente novamente.'
      )
    } else {
      setCurlError('')
    }
  }

  const handleImport = () => {
    const parsed = parseCurlCommand(curlInput)
    if (!parsed) return
    onImport(parsed)
  }

  const isDisabled = !curlInput.trim() || !!curlError

  return (
    <Stack spacing={4} p={2}>
      <Stack spacing={1}>
        <Text fontWeight="bold" fontSize="lg">
          Importar cURL
        </Text>
        <Text fontSize="sm" color="gray.500">
          Cole aqui o comando cURL completo para preencher automaticamente os
          campos de conexão (URL, método, headers, parâmetros).
        </Text>
      </Stack>
      <Stack spacing={3}>
        <HStack spacing={1}>
          <Text fontSize="sm" fontWeight="semibold">
            Comando cURL
          </Text>
          <Tooltip
            label='Exemplo: curl -X GET "https://api.site.com/data" -H "Authorization: Bearer token"'
            fontSize="xs"
            placement="top"
            hasArrow
          >
            <Box as="span" cursor="help">
              <OutlineInformationIcon color="gray.400" />
            </Box>
          </Tooltip>
        </HStack>
        <ChakraTextarea
          placeholder="Cole aqui o comando cURL..."
          value={curlInput}
          onChange={handleInputChange}
          minH="120px"
          resize="vertical"
          borderColor={curlError ? 'red.400' : undefined}
          focusBorderColor={curlError ? 'red.400' : 'blue.500'}
        />
        {curlError && (
          <Text color="red.400" fontSize="xs">
            {curlError}
          </Text>
        )}
        <Button
          colorScheme={isDisabled ? 'gray' : 'blue'}
          isDisabled={isDisabled}
          onClick={handleImport}
          w="full"
          borderRadius="xl"
          _disabled={{ opacity: 1, cursor: 'not-allowed', color: 'gray.500' }}
        >
          Importar
        </Button>
      </Stack>
    </Stack>
  )
}
