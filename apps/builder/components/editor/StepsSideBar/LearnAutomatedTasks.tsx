import { IoSchoolOutline } from 'react-icons/io5'
import {
  Text,
  Button,
  Box,
  Flex,
  useDisclosure,
  IconButton,
  HStack,
  useTheme,
  ScaleFade,
  Fade,
} from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { getCookie, setCookie } from 'services/utils'
import { useState } from 'react'

const LearnAutomatedTasks = () => {
  const { isOpen: isOpenCard, onClose: onCloseCard } = useDisclosure({
    defaultIsOpen: true,
  })
  const {
    isOpen: isOpenTip,
    onClose: onCloseTip,
    onToggle: onToggleTip,
  } = useDisclosure({
    defaultIsOpen: true,
  })
  const LEARN_KEY = 'learnAutomatedTasksCardClosed'
  const { typebot } = useTypebot()
  const theme = useTheme()
  const isAutomatedTasksBot = typebot?.availableFor.includes('automated-tasks')
  const [isHovered, setIsHovered] = useState(false)
  const handleCloseCard = () => {
    onCloseCard()
    setCookie(LEARN_KEY, 'true')
  }

  const handleCloseTip = () => {
    onCloseTip()
  }

  const shouldShowCard = getCookie(LEARN_KEY) !== 'true' && isOpenCard
  const fadeTransition = { enter: { duration: 0.2 }, exit: { duration: 0.2 } }
  if (!isAutomatedTasksBot) return null

  if (shouldShowCard) {
    return (
      <Box
        bg="purple.100"
        rounded="md"
        mb="4"
        ml="4"
        px="6"
        py="4"
        maxWidth={'320px'}
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontWeight="bold">Primeira vez por aqui? </Text>
          <IconButton
            aria-label="Fechar"
            icon={<CloseIcon />}
            size="sm"
            variant="ghost"
            color="gray.400"
            onClick={handleCloseCard}
          />
        </Flex>
        <Text>Veja como criar sua primeira tarefa automatizada!</Text>
        <Flex justifyContent="flex-end">
          <Button
            _hover={{
              backgroundColor: 'blue.500',
            }}
            alignSelf="flex-end"
            backgroundColor="blue.400"
            color="white"
            leftIcon={<IoSchoolOutline />}
            mt="4"
          >
            Tutorial de uso
          </Button>
        </Flex>
      </Box>
    )
  }

  return (
    <HStack gap={2} marginX="4" marginY="4">
      <IconButton
        rounded="full"
        aria-label="Fechar"
        icon={<IoSchoolOutline />}
        size="lg"
        variant="ghost"
        bg="blue.500"
        color="blueGray.100"
        _hover={{
          backgroundColor: 'blue.600',
        }}
        onClick={onToggleTip}
      />
      <ScaleFade in={isOpenTip} transition={fadeTransition}>
        <HStack
          justifyContent="flex-start"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Box
            bg="blueGray.200"
            position="relative"
            rounded={`${isHovered ? '8px 0px 0px 8px' : '8px'}`}
            padding="8px 8px 8px 12px"
            maxWidth="fit-content"
            width="100%"
            minHeight="38px"
            maxHeight="38px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            gap={2}
            transition="all 0.2s ease-in-out"
            _before={{
              content: "''",
              position: 'absolute',
              left: '-15px',
              top: '12px',
              borderWidth: '8px',
              borderStyle: 'solid',
              borderColor: `transparent ${theme.colors.blueGray['200']} transparent transparent`,
            }}
          >
            <Text fontSize="sm">Aprenda aqui! Tutorial de uso</Text>
          </Box>
          <Fade
            in={isHovered}
            transition={fadeTransition}
            style={{ margin: '0px' }}
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              bg="blueGray.200"
              borderRadius="0px 8px 8px 0px"
              padding="8px 8px 8px 0px"
              minHeight="38px"
              maxHeight="38px"
            >
              <IconButton
                aria-label="Fechar"
                icon={<CloseIcon />}
                size="xs"
                variant="ghost"
                onClick={handleCloseTip}
              />
            </Box>
          </Fade>
        </HStack>
      </ScaleFade>
    </HStack>
  )
}

export default LearnAutomatedTasks
