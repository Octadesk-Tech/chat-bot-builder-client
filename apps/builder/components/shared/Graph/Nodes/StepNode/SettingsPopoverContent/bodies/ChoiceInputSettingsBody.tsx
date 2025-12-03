import {
  Box,
  Button,
  Collapse,
  Flex,
  FormLabel,
  Icon,
  IconButton,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { useTypebot } from 'contexts/TypebotContext'
import { ChoiceInputOptions, ItemType, StepIndices, StepWithItems, TextBubbleContent, Variable } from 'models'
import React from 'react'
import { TextBubbleEditor } from '../../TextBubbleEditor'
import { FooterMessage } from 'components/shared/buttons/UploadButton.style'
import { SlArrowDown } from 'react-icons/sl'
import { SlArrowUp } from 'react-icons/sl'
import { AssignToResponsibleSelect } from './AssignToTeam/AssignToResponsibleSelect'
import { ItemNodesList } from '../../../ItemNode/ItemNodeList'
import { MdAdd } from 'react-icons/md'
import { CloseIcon, DragVerticalIcon } from 'assets/icons'

type ChoiceInputSettingsBodyProps = {
  options?: ChoiceInputOptions
  indices: StepIndices
  onOptionsChange: (options: ChoiceInputOptions) => void
  step: StepWithItems
}

const MAX_LENGHT_TEXT = 500

export const ChoiceInputSettingsBody = ({
  options,
  indices,
  onOptionsChange,
  step,
}: ChoiceInputSettingsBodyProps) => {
  const { createItem } = useTypebot()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const handleCloseEditorBotMessage = (content: TextBubbleContent) => {
    if (options) {
      onOptionsChange({
        ...options,
        message: content,
      })
    }
  }

  const handleFallbackMessage = (content: TextBubbleContent, index: number) => {
    if (!options) return
    if (!options?.fallbackMessages) options.fallbackMessages = []

    if (options.fallbackMessages.length > index)
      options.fallbackMessages[index] = content
    else options.fallbackMessages.push(content)

    onOptionsChange({
      ...options,
    })
  }

  const handleVariableChange = (variable?: Variable) =>
    options && onOptionsChange({ ...options, variableId: variable?.id })

  const fallbackMessageComponent = (
    message: TextBubbleContent,
    index: number
  ) => {
    return (
      <Box>
        <FormLabel mb="0" htmlFor="placeholder" fontWeight="bold" fontSize="xs">
          Mensagem para resposta inválida - Tentativa {index + 1}
        </FormLabel>
        <TextBubbleEditor
          required={{
            errorMsg: `O campo "Mensagem para resposta inválida - Tentativa ${
              index + 1
            }" é obrigatório`,
          }}
          onClose={(content) => handleFallbackMessage(content, index)}
          initialValue={message ? message.richText : []}
          onKeyUp={(content) => handleFallbackMessage(content, index)}
          maxLength={MAX_LENGHT_TEXT}
        />
      </Box>
    )
  }

  const onAssign = (v: any) => {
    onOptionsChange({
      ...options,
      ...v,
    })
  }

  const handleAddOptionAtEnd = () => {
    const itemIndex = step.items?.length ?? 0
    createItem(
      { stepId: step.id, type: ItemType.BUTTON },
      { ...indices, itemIndex }
    )
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <Flex>
          <FormLabel mb="0" htmlFor="placeholder" fontWeight="bold" fontSize="xs">
            Texto da pergunta
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="button" fontSize="xs">
            {options?.message?.plainText?.length ?? 0}/{MAX_LENGHT_TEXT}
          </FormLabel>
        </Flex>
        (
        <TextBubbleEditor
          required={{ errorMsg: 'O campo "Texto da pergunta" é obrigatório' }}
          onClose={handleCloseEditorBotMessage}
          initialValue={options?.message ? options?.message.richText : []}
          onKeyUp={handleCloseEditorBotMessage}
          maxLength={MAX_LENGHT_TEXT}
        />
        )
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="placeholder" fontWeight="bold" fontSize="xs">
          Opções de resposta
        </FormLabel>
        <ItemNodesList
          step={step}
          indices={indices}
          hideConnection={true}
          withControlButtons={true}
        />
        <Button
          onClick={handleAddOptionAtEnd}
          variant="outline"
          colorScheme="blue"
          fontSize="xs"
          borderWidth="2px"
          borderColor="#1366C9"
          color="#1366C9"
          padding="12px 32px"
          height="28px"
          alignSelf="center"
          _hover={{ bg: '#1366C9', color: 'white' }}
          leftIcon={<Icon as={MdAdd} boxSize={5} />}
        >
          Adicionar opção
        </Button>
      </Stack>
      <Stack>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
          labelDefault="Salvar resposta em"
          showBorder={false}
        />
      </Stack>
      {options?.useFallback &&
        (options?.fallbackMessages?.length ? (
          <>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <Text fontWeight="bold" fontSize="xs">Se o cliente não responder com nenhuma das opções:</Text>
              <Button
                background={'transparent'}
                onClick={() => setIsCollapsed((v) => !v)}
                size="sm"
              >
                {isCollapsed ? <SlArrowDown /> : <SlArrowUp />}
              </Button>
            </Flex>
            <Collapse in={isCollapsed}>
              <Flex direction={'column'} gap={4}>
                {options?.fallbackMessages.map((message, index) =>
                  fallbackMessageComponent(message, index)
                )}
                <Box>
                  <FormLabel mb="0" htmlFor="placeholder" fontWeight="bold" fontSize="xs">
                    Se o cliente errar 3 vezes seguidas, atribuir conversa para:
                  </FormLabel>
                  <AssignToResponsibleSelect
                    hasResponsibleContact={false}
                    options={options}
                    onSelect={onAssign}
                  />
                </Box>
              </Flex>
            </Collapse>
          </>
        ) : (
          <TextBubbleEditor
            onClose={(content) => handleFallbackMessage(content, 0)}
            initialValue={[]}
            onKeyUp={(content) => handleFallbackMessage(content, 0)}
          />
        ))}
    </Stack>
  )
}
