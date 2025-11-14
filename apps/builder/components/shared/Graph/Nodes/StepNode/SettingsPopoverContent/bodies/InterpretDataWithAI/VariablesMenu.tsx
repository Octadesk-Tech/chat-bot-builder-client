import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  IconButton,
  Stack,
  Text,
  Input,
  Box,
  List,
  ListItem,
} from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'

import { useState, useMemo } from 'react'

type Props = {
  variables: string[]
  onVariableSelect: (variable: string) => void
  ariaLabel?: string
}

export const VariablesMenu = ({
  variables,
  onVariableSelect,
  ariaLabel = 'Adicionar variável',
}: Props) => {
  const [searchText, setSearchText] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredVariables = useMemo(() => {
    if (!searchText) return variables
    return variables.filter((variable) =>
      variable.toLowerCase().includes(searchText.toLowerCase())
    )
  }, [variables, searchText])

  const handleVariableSelect = (variable: string) => {
    onVariableSelect(variable)
    setSearchText('')
    setIsOpen(false)
  }

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false)
        setSearchText('')
      }}
      placement="top-end"
      closeOnBlur={true}
      strategy="fixed"
      flip={true}
      offset={[0, 8]}
    >
      <PopoverTrigger>
        <IconButton
          icon={<FiPlus size={16} />}
          variant="ghost"
          size="sm"
          backgroundColor="gray.100"
          _hover={{ backgroundColor: 'gray.200' }}
          aria-label={ariaLabel}
          onClick={() => setIsOpen(!isOpen)}
        />
      </PopoverTrigger>
      <PopoverContent width="250px">
        <PopoverBody p={0}>
          <Stack spacing={0}>
            <Box p={2} borderBottom="1px" borderColor="gray.200">
              <Input
                placeholder="Pesquisar variável..."
                size="sm"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                autoFocus
              />
            </Box>
            <List maxH="300px" overflowY="auto" className="scrollbar-custom">
              {filteredVariables.length > 0 ? (
                filteredVariables.map((variable) => (
                  <ListItem
                    key={variable}
                    px={3}
                    py={2}
                    cursor="pointer"
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => handleVariableSelect(variable)}
                  >
                    <Text fontSize="sm" fontWeight="medium">
                      {variable}
                    </Text>
                  </ListItem>
                ))
              ) : (
                <Box px={3} py={4} textAlign="center">
                  <Text fontSize="sm" color="gray.500">
                    Nenhuma variável encontrada
                  </Text>
                </Box>
              )}
            </List>
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
