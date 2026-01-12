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
import { WhatsAppOptionsListOptions, Variable, TextBubbleContent, WhatsAppOptionsListStep, StepWithItems, ItemType } from 'models'
import { useState } from 'react'
import { TextBubbleEditor } from 'components/shared/Graph/Nodes/StepNode/TextBubbleEditor'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { SlArrowDown, SlArrowUp } from 'react-icons/sl'
import { MdAdd } from 'react-icons/md'
import { AssignToResponsibleSelect } from '../../AssignToTeam/AssignToResponsibleSelect'
import cuid from 'cuid'
import { ItemDraggableList } from 'components/shared/Graph/Nodes/ItemNode/ItemDraggable/ItemDraggableList'
import { StepIndices } from 'models'

type WhatsAppOptionsListSettingsBodyProps = {
  options: WhatsAppOptionsListOptions
  onOptionsChange: (options: WhatsAppOptionsListOptions) => void
  step?: WhatsAppOptionsListStep
  indices: StepIndices
}

export const WhatsAppOptionsListSettingsBody = ({
  options,
  onOptionsChange,
  step,
  indices,
}: WhatsAppOptionsListSettingsBodyProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [value, setValue] = useState({
    header: '',
    body: '',
    footer: '',
    listTitle: '',
  })

  const [localListItems, setLocalListItems] = useState<any[]>(() => {
    if (options.listItems && options.listItems.length > 0) {
      return options.listItems.map((item: any) => ({
        ...item,
        type: ItemType.WHATSAPP_OPTIONS_LIST,
      }))
    } else if (step?.items && step.items.length > 0) {
      return step.items.map((item: any) => ({
        description: '',
        id: item.id,
        label: item.content || '',
        selected: false,
        value: item.content || '',
        type: ItemType.WHATSAPP_OPTIONS_LIST,
      }))
    }
    return []
  })

  const MAX_LENGHT_HEADER_AND_FOOTER = 60
  const MAX_LENGHT_BODY = 1024
  const MAX_LENGHT_LIST_TITLE = 30
  const MAX_OPTIONS = 10

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
  const handleListTitle = (content: any) => {
    const updateListTitleText = { listTitle: content.plainText }
    setValue((value) => ({
      ...value,
      ...updateListTitleText,
    }))
    onOptionsChange({
      ...options,
      listTitle: {
        content,
      },
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

  const handleAddOption = () => {
    if (localListItems.length >= MAX_OPTIONS) return

    const newOption = {
      description: '',
      id: cuid(),
      label: '',
      selected: false,
      value: '',
      type: ItemType.WHATSAPP_OPTIONS_LIST,
    }

    const updatedItems = [...localListItems, newOption]
    setLocalListItems(updatedItems)
    onOptionsChange({ ...options, listItems: updatedItems })
  }

  const handleUpdateOption = (index: number, value: string) => {
    const updatedItems = [...localListItems]
    updatedItems[index] = {
      ...updatedItems[index],
      label: value,
      value: value,
    }

    setLocalListItems(updatedItems)
    onOptionsChange({ ...options, listItems: updatedItems })
  }

  const handleRemoveOption = (index: number) => {
    if (localListItems.length <= 1) return

    const updatedItems = localListItems.filter((_: any, i: number) => i !== index)

    setLocalListItems(updatedItems)
    onOptionsChange({ ...options, listItems: updatedItems })
  }

  const handleReorderOption = (oldIndex: number, newIndex: number) => {
    const updatedItems = [...localListItems]
    const [movedItem] = updatedItems.splice(oldIndex, 1)
    updatedItems.splice(newIndex, 0, movedItem)

    setLocalListItems(updatedItems)
    onOptionsChange({ ...options, listItems: updatedItems })
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
          required={{
            errorMsg: 'O campo "Texto do corpo da mensagem" é obrigatório',
          }}
          onClose={handleBodyText}
          initialValue={
            options.body?.content ? options.body.content.richText : []
          }
          onKeyUp={handleBodyText}
          maxLength={MAX_LENGHT_BODY}
        />
      </Stack>
      {options?.useFallback && localListItems.length > 0 && localListItems.some((item: any) => item.label && item.label.trim() !== '') &&
        (options?.fallbackMessages?.length ? (
          <>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <Text fontWeight="bold" fontSize="sm">Se o cliente não responder com nenhuma das opções:</Text>
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
          <FormLabel mb="0" htmlFor="button" fontWeight="bold" fontSize={'sm'}>
            Título da lista
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="button" fontSize="sm">
            {value?.listTitle?.length ?? 0}/{MAX_LENGHT_LIST_TITLE}
          </FormLabel>
        </Flex>
        <TextBubbleEditor
          required={{ errorMsg: 'O campo "Título da lista" é obrigatório' }}
          onClose={handleListTitle}
          initialValue={
            options.listTitle?.content
              ? options.listTitle.content?.richText
              : []
          }
          onKeyUp={handleListTitle}
          maxLength={MAX_LENGHT_LIST_TITLE}
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
            handleUpdateItem={(_, itemIndex, value) => handleUpdateOption(itemIndex, value)}
            handleRemoveItem={(_, itemIndex) => handleRemoveOption(itemIndex)}
            handleReorderItem={handleReorderOption}
          />
        </Stack>

        <Flex justify="center">
          <Button
            leftIcon={<Icon as={MdAdd} boxSize={5} />}
            onClick={handleAddOption}
            variant="outline"
            size="md"
            color={localListItems.length >= MAX_OPTIONS ? 'gray.400' : '#1366C9'}
            borderColor={localListItems.length >= MAX_OPTIONS ? 'gray.300' : '#1366C9'}
            borderWidth="2px"
            fontSize="sm"
            _hover={localListItems.length >= MAX_OPTIONS ? {} : { bg: '#1366C9', color: 'white' }}
            _disabled={{ opacity: 1, cursor: 'not-allowed' }}
            isDisabled={localListItems.length >= MAX_OPTIONS}
          >
            Adicionar opção
          </Button>
        </Flex>
      </Stack>
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
          initialVariableId={options.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
