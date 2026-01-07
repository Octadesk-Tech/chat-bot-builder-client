import {
  Box,
  Button,
  Collapse,
  Flex,
  FormLabel,
  Icon,
  Input,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react'
import { TextBubbleContent, Variable, WhatsAppButtonsListOptions, WhatsAppButtonsListStep, StepWithItems, StepIndices, ItemType } from 'models'
import { useState } from 'react'
import { TextBubbleEditor } from 'components/shared/Graph/Nodes/StepNode/TextBubbleEditor'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { SlArrowDown, SlArrowUp } from 'react-icons/sl'
import { MdAdd } from 'react-icons/md'
import { AssignToResponsibleSelect } from '../../AssignToTeam/AssignToResponsibleSelect'
import cuid from 'cuid'
import { ItemDraggableList } from 'components/shared/Graph/Nodes/ItemNode/ItemDraggable/ItemDraggableList'

type WhatsAppButtonsListSettingsBodyProps = {
  options: WhatsAppButtonsListOptions
  onOptionsChange: (options: WhatsAppButtonsListOptions) => void
  step?: WhatsAppButtonsListStep
  indices: StepIndices
}

export const WhatsAppButtonsListSettingsBody = ({
  options,
  onOptionsChange,
  step,
  indices,
}: WhatsAppButtonsListSettingsBodyProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [value, setValue] = useState({
    header: '',
    body: '',
    footer: '',
  })

  const [localListItems, setLocalListItems] = useState<any[]>(() => {
    if (options.buttonItems && options.buttonItems.length > 0) {
      return options.buttonItems.map((item: any) => ({
        ...item,
        type: ItemType.WHATSAPP_BUTTONS_LIST,
      }))
    } else if (step?.items && step.items.length > 0) {
      return step.items.map((item: any) => ({
        id: item.id,
        text: item.content || '',
        type: ItemType.WHATSAPP_BUTTONS_LIST,
      }))
    }
    return []
  })

  const MAX_LENGHT_HEADER_AND_FOOTER = 60
  const MAX_LENGHT_BODY = 1024
  const MAX_BUTTONS = 3

  const handleVariableChange = (variable?: Variable) => {
    if (!variable || (!variable.id && !variable.variableId)) {
      onOptionsChange({
        ...options,
        property: undefined,
        variableId: undefined,
      })
      return
    }

    const varId = variable.variableId || variable.id

    onOptionsChange({
      ...options,
      property: {
        domain: variable.domain,
        name: variable.name,
        type: variable.type ? variable.type : 'string',
        token: variable.token,
      },
      variableId: varId,
    })
  }

  const handleHeaderText = (content: any) => {
    const updateHeaderText = { header: content.plainText }
    setValue((value) => ({
      ...value,
      ...updateHeaderText,
    }))
    onOptionsChange({
      ...options,
      header: {
        content,
      },
    })
  }

  const handleBodyText = (content: any) => {
    const updateBodyText = { body: content.plainText }
    setValue((value) => ({
      ...value,
      ...updateBodyText,
    }))
    onOptionsChange({
      ...options,
      body: {
        content,
      },
    })
  }

  const handleFooterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue((value) => ({
      ...value,
      footer: newValue,
    }))

    const content = {
      html: `<div>${newValue}</div>`,
      richText: [{ children: [{ text: newValue }], type: 'p' }],
      plainText: newValue,
    }

    onOptionsChange({
      ...options,
      footer: { content },
    })
  }

  const handleFallBackMessage = (content: TextBubbleContent, index: number) => {
    if (!options) return
    if (!options?.fallbackMessages) options.fallbackMessages = []

    if (options.fallbackMessages.length > index)
      options.fallbackMessages[index] = content
    else options.fallbackMessages.push(content)

    onOptionsChange({
      ...options,
    })
  }

  const fallbackMessageComponent = (
    message: TextBubbleContent,
    index: number
  ) => {
    return (
      <Box>
        <FormLabel mb="0" htmlFor="placeholder" fontWeight="bold" fontSize="sm">
          Mensagem para resposta inválida - Tentativa {index + 1}
        </FormLabel>
        <TextBubbleEditor
          required={{
            errorMsg: `O campo "Mensagem para resposta inválida - Tentativa ${index + 1
              }" é obrigatório`,
          }}
          onClose={(content) => handleFallBackMessage(content, index)}
          initialValue={message ? message.richText : []}
          onKeyUp={(content) => handleFallBackMessage(content, index)}
          maxLength={MAX_LENGHT_BODY}
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

  const handleAddButton = () => {
    if (localListItems.length >= MAX_BUTTONS) return

    const newButton = {
      id: cuid(),
      text: '',
      type: ItemType.WHATSAPP_BUTTONS_LIST,
    }

    const updatedItems = [...localListItems, newButton]
    setLocalListItems(updatedItems)
    onOptionsChange({ ...options, buttonItems: updatedItems })
  }

  const handleUpdateButton = (index: number, value: string) => {
    const updatedItems = [...localListItems]
    updatedItems[index] = {
      ...updatedItems[index],
      text: value,
    }

    setLocalListItems(updatedItems)
    onOptionsChange({ ...options, buttonItems: updatedItems })
  }

  const handleRemoveButton = (index: number) => {
    if (localListItems.length <= 1) return

    const updatedItems = localListItems.filter((_: any, i: number) => i !== index)

    setLocalListItems(updatedItems)
    onOptionsChange({ ...options, buttonItems: updatedItems })
  }

  const handleReorderButton = (oldIndex: number, newIndex: number) => {
    const updatedItems = [...localListItems]
    const [movedItem] = updatedItems.splice(oldIndex, 1)
    updatedItems.splice(newIndex, 0, movedItem)

    setLocalListItems(updatedItems)
    onOptionsChange({ ...options, buttonItems: updatedItems })
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <Flex>
          <FormLabel mb="0" htmlFor="button" fontWeight="bold" fontSize={'sm'}>
            Texto do cabeçalho
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="button">
            {value?.header?.length ?? 0}/{MAX_LENGHT_HEADER_AND_FOOTER}
          </FormLabel>
        </Flex>

        <TextBubbleEditor
          onClose={handleHeaderText}
          initialValue={
            options.header?.content ? options.header.content.richText : []
          }
          onKeyUp={handleHeaderText}
          maxLength={MAX_LENGHT_HEADER_AND_FOOTER}
          wabaHeader
        />
      </Stack>
      <Stack>
        <Flex>
          <FormLabel mb="0" htmlFor="button" fontWeight="bold" fontSize={'sm'}>
            Texto do corpo da mensagem
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="button">
            {value?.body?.length ?? 0}/{MAX_LENGHT_BODY}
          </FormLabel>
        </Flex>
        <TextBubbleEditor
          required
          onClose={handleBodyText}
          initialValue={
            options.body?.content ? options.body.content.richText : []
          }
          onKeyUp={handleBodyText}
          maxLength={MAX_LENGHT_BODY}
        />
      </Stack>

      <Stack spacing={3}>
        <FormLabel mb="0" fontWeight="bold" fontSize={'sm'}>
          Opções de resposta
        </FormLabel>

        <Stack spacing={3}>
          <ItemDraggableList
            items={localListItems}
            step={step as StepWithItems}
            indices={indices}
            isReadOnly={false}
            handleUpdateItem={(_, itemIndex, value) => handleUpdateButton(itemIndex, value)}
            handleRemoveItem={(_, itemIndex) => handleRemoveButton(itemIndex)}
            handleReorderItem={handleReorderButton}
          />
        </Stack>

        <Flex justify="center">
          <Button
            leftIcon={<Icon as={MdAdd} boxSize={5} />}
            onClick={handleAddButton}
            variant="outline"
            size="md"
            color={localListItems.length >= MAX_BUTTONS ? 'gray.400' : '#1366C9'}
            borderColor={localListItems.length >= MAX_BUTTONS ? 'gray.300' : '#1366C9'}
            borderWidth="2px"
            fontSize="sm"
            _hover={localListItems.length >= MAX_BUTTONS ? {} : { bg: '#1366C9', color: 'white' }}
            _disabled={{ opacity: 1, cursor: 'not-allowed' }}
            isDisabled={localListItems.length >= MAX_BUTTONS}
          >
            Adicionar opção
          </Button>
        </Flex>
      </Stack>

      {options?.useFallback && localListItems.length > 0 && localListItems.some((item: any) => item.text && item.text.trim() !== '') &&
        (options?.fallbackMessages?.length ? (
          <>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <Text fontWeight="bold" fontSize="sm">
                Se o cliente não responder com nenhuma das opções:
              </Text>
              <Button
                background={'transparent'}
                onClick={() => setIsCollapsed((v) => !v)}
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
                  <FormLabel mb="0" htmlFor="placeholder" fontWeight="bold" fontSize="sm">
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
            onClose={(content) => handleFallBackMessage(content, 0)}
            initialValue={[]}
            onKeyUp={(content) => handleFallBackMessage(content, 0)}
          />
        ))}
      <Stack>
        <Flex>
          <FormLabel mb="0" htmlFor="footer-input" fontWeight="bold" fontSize={'sm'}>
            Texto do rodapé
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="footer-input">
            {value?.footer?.length ?? 0}/{MAX_LENGHT_HEADER_AND_FOOTER}
          </FormLabel>
        </Flex>
        <Input
          id="footer-input"
          placeholder="Insira o texto do rodapé..."
          value={options.footer?.content?.plainText || ''}
          onChange={handleFooterChange}
          maxLength={MAX_LENGHT_HEADER_AND_FOOTER}
          size="md"
          focusBorderColor="blue.400"
        />
      </Stack>
      <Stack>
        <VariableSearchInput
          initialVariableId={options.variableId || (step as any)?.initialVariableToken}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
