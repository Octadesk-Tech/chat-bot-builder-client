import {
  Box,
  BoxProps,
  Button,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Tooltip,
  useDisclosure,
  useOutsideClick,
} from '@chakra-ui/react'
import { MdSearch } from 'react-icons/md'
import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useDebounce } from 'use-debounce'
import { useGetTypebot } from 'contexts/TypebotContext'
import { useGraph } from 'contexts/GraphContext'
import { useGraphFocus } from 'hooks/useGraphFocus'

const MAX_RESULTS = 50

export const BoardMenuButtonSearch = (props: BoxProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const getTypebot = useGetTypebot()
  const { setFocusedBlockId } = useGraph()
  const { focusOnCoordinates } = useGraphFocus()

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchValue, setSearchValue] = useState('')
  const [debouncedValue] = useDebounce(searchValue, 300)

  const handleClose = () => {
    setSearchValue('')
    onClose()
  }

  useOutsideClick({
    ref: containerRef,
    handler: handleClose,
    enabled: isOpen,
  })

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const results = useMemo(() => {
    const query = debouncedValue.trim().toLowerCase()
    if (!query) return []
    const blocks = getTypebot()?.blocks ?? []
    return blocks
      .filter((block) => block.title?.toLowerCase().includes(query))
      .slice(0, MAX_RESULTS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  const handleToggle = () => {
    if (isOpen) handleClose()
    else onOpen()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') handleClose()
  }

  const handleResultClick = (blockId: string, x: number, y: number) => () => {
    focusOnCoordinates({ x, y })
    setFocusedBlockId(blockId)
    handleClose()
  }

  const hasQuery = debouncedValue.trim().length > 0

  return (
    <Box ref={containerRef} w="fit-content" {...props}>
      <Tooltip label="Pesquisar bloco">
        <IconButton
          aria-label="Pesquisar bloco"
          onClick={handleToggle}
          bgColor="white"
          icon={<MdSearch />}
          size="sm"
          shadow="lg"
        />
      </Tooltip>

      {isOpen && (
        <Box
          position="fixed"
          top="20px"
          left="50%"
          transform="translateX(-35%)"
          zIndex="popover"
          w="600px"
          maxW="92vw"
          bg="white"
          rounded="md"
          shadow="2xl"
          border="1px solid"
          borderColor="gray.200"
          p="3"
        >
          <InputGroup size="md">
            <InputLeftElement pointerEvents="none">
              <MdSearch color="gray" />
            </InputLeftElement>
            <Input
              ref={inputRef}
              value={searchValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchValue(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Pesquisar bloco pelo título"
              rounded="md"
            />
          </InputGroup>

          {hasQuery && (
            <Flex
              direction="column"
              mt="2"
              maxH="50vh"
              overflowY="auto"
              role="menu"
            >
              {results.length > 0 ? (
                results.map((block) => (
                  <Button
                    key={block.id}
                    onClick={handleResultClick(
                      block.id,
                      block.graphCoordinates.x,
                      block.graphCoordinates.y
                    )}
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    justifyContent="flex-start"
                    fontWeight="normal"
                    role="menuitem"
                    minH={'40px'}
                  >
                    <Text isTruncated>{block.title || 'Sem título'}</Text>
                  </Button>
                ))
              ) : (
                <Text fontSize="sm" color="gray.500" px="2" py="1">
                  Nenhum bloco encontrado
                </Text>
              )}
            </Flex>
          )}
        </Box>
      )}
    </Box>
  )
}
