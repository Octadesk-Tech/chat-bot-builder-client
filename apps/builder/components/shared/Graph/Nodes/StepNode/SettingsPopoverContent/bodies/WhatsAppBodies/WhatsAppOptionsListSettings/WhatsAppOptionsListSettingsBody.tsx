import {
  Box,
  Button,
  Collapse,
  Flex,
  FormLabel,
  Icon,
  IconButton,
  Input,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react'
import { WhatsAppOptionsListOptions, Variable, TextBubbleContent, WhatsAppOptionsListStep } from 'models'
import { useState, useEffect, useRef } from 'react'
import { TextBubbleEditor } from 'components/shared/Graph/Nodes/StepNode/TextBubbleEditor'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { SlArrowDown, SlArrowUp } from 'react-icons/sl'
import { MdClose, MdDragIndicator, MdAdd } from 'react-icons/md'
import { AssignToResponsibleSelect } from '../../AssignToTeam/AssignToResponsibleSelect'
import cuid from 'cuid'

type WhatsAppOptionsListSettingsBodyProps = {
  options: WhatsAppOptionsListOptions
  onOptionsChange: (options: WhatsAppOptionsListOptions) => void
  step?: WhatsAppOptionsListStep
}

export const WhatsAppOptionsListSettingsBody = ({
  options,
  onOptionsChange,
  step,
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
      return options.listItems
    } else if (step?.items && step.items.length > 0) {
      return step.items.map((item: any) => ({
        description: '',
        id: item.id,
        label: item.content || '',
        selected: false,
        value: item.content || '',
      }))
    }
    return []
  })

  const initializedRef = useRef<string | null>(step?.id || null)

  const MAX_LENGHT_HEADER_AND_FOOTER = 60
  const MAX_LENGHT_BODY = 1024
  const MAX_LENGHT_LIST_TITLE = 20
  const MAX_LENGTH_OPTION_TEXT = 24
  const MAX_OPTIONS = 10

  useEffect(() => {
    if (initializedRef.current === step?.id) return
    initializedRef.current = step?.id || null

    if (options.listItems && options.listItems.length > 0) {
      setLocalListItems(options.listItems)
    } else if (step?.items && step.items.length > 0) {
      const listItems = step.items.map((item: any) => ({
        description: '',
        id: item.id,
        label: item.content || '',
        selected: false,
        value: item.content || '',
      }))
      setLocalListItems(listItems)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step?.id])

  useEffect(() => {
    if (initializedRef.current === step?.id) {
      onOptionsChange({ ...options, listItems: localListItems })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localListItems])

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
        <FormLabel mb="0" htmlFor="placeholder">
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
    }

    setLocalListItems([...localListItems, newOption])
  }

  const handleUpdateOption = (index: number, value: string) => {
    const updatedItems = [...localListItems]
    updatedItems[index] = {
      ...updatedItems[index],
      label: value,
      value: value,
    }

    setLocalListItems(updatedItems)
  }

  const handleRemoveOption = (index: number) => {
    if (localListItems.length <= 1) return

    const updatedItems = localListItems.filter((_: any, i: number) => i !== index)

    setLocalListItems(updatedItems)
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
              <Text>Se o cliente não responder com nenhuma das opções:</Text>
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
                  <FormLabel mb="0" htmlFor="placeholder">
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
          <FormLabel mb="0" htmlFor="button">
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
          {(localListItems.length > 0 ? localListItems : [{ id: 'empty-1', label: '', value: '', description: '', selected: false }]).map((item: any, index: number) => (
            <Flex key={item.id} gap={2} alignItems="center">
              {localListItems.length > 1 && (
                <Icon
                  as={MdDragIndicator}
                  boxSize={5}
                  color="#5A6377"
                  cursor="grab"
                  _active={{ cursor: 'grabbing' }}
                />
              )}

              <Box
                bg="#F4F4F5"
                p={3}
                borderRadius="md"
                border="1px solid"
                borderColor="#E3E4E8"
                flex="1"
              >
                <Input
                  placeholder="Insira o texto desta resposta..."
                  value={item.label}
                  onChange={(e) => handleUpdateOption(index, e.target.value)}
                  maxLength={MAX_LENGTH_OPTION_TEXT}
                  bg="white"
                  size="md"
                  focusBorderColor="blue.400"
                />
              </Box>

              {localListItems.length > 1 && (
                <IconButton
                  aria-label="Remover opção"
                  icon={<Icon as={MdClose} boxSize={5} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveOption(index)}
                  _hover={{ bg: 'transparent', color: 'red.500' }}
                />
              )}
            </Flex>
          ))}
        </Stack>

        <Flex justify="center">
          <Button
            leftIcon={<Icon as={MdAdd} boxSize={5} />}
            onClick={handleAddOption}
            variant="outline"
            size="md"
            color="#1366C9"
            borderColor="#1366C9"
            borderWidth="2px"
            fontSize="sm"
            _hover={{ bg: '#1366C9', color: 'white' }}
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
