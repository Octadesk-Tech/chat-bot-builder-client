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
  Tooltip,
} from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'

import { useState, useMemo, type ReactElement } from 'react'

export type VariablesMenuProps<T extends { id: string | number }> = {
  items: T[]
  getLabel: (item: T) => string
  onSelect: (item: T) => void
  icon?: ReactElement
  ariaLabel?: string
  searchPlaceholder?: string
  emptyMessage?: string
  tooltip?: string
  size?: 'sm' | 'md' | 'lg'
  isDisabled?: boolean
}

export function VariablesMenu<T extends { id: string | number }>({
  items,
  getLabel,
  onSelect,
  icon,
  ariaLabel = 'Adicionar variável',
  searchPlaceholder = 'Pesquisar variável...',
  emptyMessage = 'Nenhuma variável encontrada',
  tooltip = 'Selecionar variável',
  size = 'md',
  isDisabled = false,
}: Readonly<VariablesMenuProps<T>>) {
  const [searchText, setSearchText] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredItems = useMemo(() => {
    if (!searchText) return items
    const q = searchText.toLowerCase()
    return items.filter((item) => getLabel(item).toLowerCase().includes(q))
  }, [items, searchText, getLabel])

  const handleSelect = (item: T) => {
    onSelect(item)
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
        <Tooltip label={tooltip}>
          <IconButton
            icon={icon ?? <FiPlus size={16} />}
            variant="ghost"
            size={size}
            backgroundColor="gray.100"
            _hover={{ backgroundColor: 'gray.200' }}
            aria-label={ariaLabel}
            isDisabled={isDisabled}
            onClick={() => setIsOpen(!isOpen)}
          />
        </Tooltip>
      </PopoverTrigger>
      <PopoverContent width="250px">
        <PopoverBody p={0}>
          <Stack spacing={0}>
            <Box p={2} borderBottom="1px" borderColor="gray.200">
              <Input
                placeholder={searchPlaceholder}
                size="sm"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                autoFocus
              />
            </Box>
            <List maxH="300px" overflowY="auto" className="scrollbar-custom">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <ListItem
                    key={String(item.id)}
                    px={3}
                    py={2}
                    cursor="pointer"
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => handleSelect(item)}
                  >
                    <Text fontSize="sm" fontWeight="medium">
                      {getLabel(item)}
                    </Text>
                  </ListItem>
                ))
              ) : (
                <Box px={3} py={4} textAlign="center">
                  <Text fontSize="sm" color="gray.500">
                    {emptyMessage}
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
