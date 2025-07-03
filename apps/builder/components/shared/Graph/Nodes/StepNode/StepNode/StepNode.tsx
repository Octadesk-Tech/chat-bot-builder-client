import {
  Flex,
  HStack,
  Popover,
  PopoverTrigger,
  Spacer,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { ErrorIcon, WarningIcon } from 'assets/icons'
import { StepIcon } from 'components/editor/StepsSideBar/StepIcon'
import { StepTypeLabel } from 'components/editor/StepsSideBar/StepTypeLabel'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import OctaTooltip from 'components/octaComponents/OctaTooltip/OctaTooltip'
import { ContextMenu } from 'components/shared/ContextMenu'
import { useGraph } from 'contexts/GraphContext'
import { NodePosition, useDragDistance } from 'contexts/GraphDndContext'
import { useTypebot } from 'contexts/TypebotContext'
import { ActionsTypeEmptyFields } from 'hooks/EmptyFields/useEmptyFields'
import { colors } from 'libs/theme'
import {
  AssignToTeamStep,
  BubbleStep,
  CallOtherBotStep,
  DraggableStep,
  ExternalEventStep,
  IntegrationStepType,
  LogicStepType,
  OctaStepType,
  OctaWabaStepType,
  OfficeHourStep,
  ChatReturnStep,
  Step,
  TextBubbleContent,
  WOZAssignStep,
  WOZStepType,
  WebhookStep,
  WhatsAppButtonsListStep,
  WhatsAppOptionsListStep,
} from 'models'
import { useRouter } from 'next/router'
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { hasDefaultConnector } from 'services/typebots'
import { setMultipleRefs } from 'services/utils'
import { isOctaBubbleStep, isTextBubbleStep } from 'utils'
import { TargetEndpoint } from '../../../Endpoints'
import { SourceEndpoint } from '../../../Endpoints/SourceEndpoint'
import {
  VALIDATION_MESSAGE_TYPE,
  ValidationMessage,
  getValidationMessages,
} from '../../helpers/helpers'
import { SettingsModal } from '../SettingsPopoverContent/SettingsModal'
import { StepSettings } from '../SettingsPopoverContent/SettingsPopoverContent'
import { StepNodeContent } from '../StepNodeContent/StepNodeContent/StepNodeContent'
import { StepNodeContextMenu } from '../StepNodeContextMenu'
import { TextBubbleEditor } from '../TextBubbleEditor'
import { BlockStack } from './StepNode.style'

// Move type checking functions outside component
const isEndConversationStep = (
  step: Step
): step is Exclude<Step, BubbleStep> => {
  return isOctaBubbleStep(step)
}

const isAssignToTeamStep = (step: Step): step is AssignToTeamStep => {
  return step.type === OctaStepType.ASSIGN_TO_TEAM
}

const isWozAssignStep = (step: Step): step is WOZAssignStep => {
  return step.type === WOZStepType.ASSIGN
}

const isCallOtherBotStep = (step: Step): step is CallOtherBotStep => {
  return step.type === OctaStepType.CALL_OTHER_BOT
}

const isOfficeHoursStep = (step: Step): step is OfficeHourStep => {
  return step.type === OctaStepType.OFFICE_HOURS
}

const isWebhookStep = (step: Step): step is WebhookStep => {
  return step.type === IntegrationStepType.WEBHOOK
}

const isExternalEventStep = (step: Step): step is ExternalEventStep => {
  return step.type === IntegrationStepType.EXTERNAL_EVENT
}

const isWhatsAppOptionsListStep = (
  step: Step
): step is WhatsAppOptionsListStep => {
  return step.type === OctaWabaStepType.WHATSAPP_OPTIONS_LIST
}

const isWhatsAppButtonsListStep = (
  step: Step
): step is WhatsAppButtonsListStep => {
  return step.type === OctaWabaStepType.WHATSAPP_BUTTONS_LIST
}

const hasStepRedirectCheckAvailability = (
  step: Step
): step is AssignToTeamStep => {
  if (step.type === 'assign to team') {
    return step.options.isAvailable
  }
  return true
}

const isChatReturn = (step: Step): step is ChatReturnStep => {
  return step.type === LogicStepType.CHAT_RETURN
}

type StepNodeContextProps = {
  setIsPopoverOpened?: (isPopoverOpened: boolean) => void
}

export const StepNodeContext = createContext<StepNodeContextProps>({})

export const StepNode = React.memo(
  ({
    step,
    isConnectable,
    indices,
    onMouseDown,
    isStartBlock,
    unreachableNode,
  }: {
    step: Step
    isConnectable: boolean
    indices: { stepIndex: number; blockIndex: number }
    onMouseDown?: (stepNodePosition: NodePosition, step: DraggableStep) => void
    isStartBlock: boolean
    unreachableNode?: boolean
  }) => {
    const { query } = useRouter()
    const {
      connectingIds,
      openedStepId,
      setOpenedStepId,
      setFocusedBlockId,
      previewingEdge,
    } = useGraph()
    const { updateStep, emptyFields, setEmptyFields, typebot } = useTypebot()
    const [isConnecting, setIsConnecting] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [validationMessages, setValidationMessages] =
      useState<Array<ValidationMessage>>()
    const stepRef = useRef<HTMLDivElement | null>(null)

    const availableOnlyForEvent = useMemo(
      () =>
        typebot?.availableFor?.length == 1 &&
        typebot.availableFor.includes('event'),
      [typebot?.availableFor]
    )

    const showWarning = !availableOnlyForEvent

    const [isPopoverOpened, setIsPopoverOpened] = useState(
      openedStepId === step.id
    )
    const [isEditing, setIsEditing] = useState<boolean>(
      (isTextBubbleStep(step) || isOctaBubbleStep(step)) &&
        step.content.plainText === ''
    )

    const isPreviewing = isConnecting || previewingEdge?.to.stepId === step.id

    const onDrag = useCallback(
      (position: NodePosition) => {
        if (step.type === 'start' || !onMouseDown) return
        onMouseDown(position, step as DraggableStep)
      },
      [step, onMouseDown]
    )

    useDragDistance({
      ref: stepRef,
      onDrag,
      isDisabled: !onMouseDown || step.type === 'start',
    })

    const { onClose: onModalClose } = useDisclosure({
      defaultIsOpen: true,
    })

    const checkisConnectable = useCallback((step: Step): boolean => {
      return (
        !isEndConversationStep(step) &&
        !isAssignToTeamStep(step) &&
        hasDefaultConnector(step) &&
        !isOfficeHoursStep(step) &&
        !isWebhookStep(step) &&
        !isExternalEventStep(step) &&
        !isCallOtherBotStep(step) &&
        !isWhatsAppOptionsListStep(step) &&
        !isWhatsAppButtonsListStep(step) &&
        !isWozAssignStep(step) &&
        !isChatReturn(step)
      )
    }, [])

    useEffect(() => {
      if (query.stepId?.toString() === step.id) setOpenedStepId(step.id)
    }, [query.stepId, step.id, setOpenedStepId])

    useEffect(() => {
      setIsConnecting(
        connectingIds?.target?.blockId === step.blockId &&
          connectingIds?.target?.stepId === step.id
      )
    }, [connectingIds, step.blockId, step.id])

    useEffect(() => {
      const currentMessages = getValidationMessages(step)
      setValidationMessages(currentMessages)
      if (currentMessages.length > 0) {
        if (!emptyFields.find((field) => field?.step.id === step?.id)) {
          setEmptyFields(
            [{ step, errorMessage: currentMessages[0].message }],
            ActionsTypeEmptyFields.ADD
          )
        }
      } else {
        const checking = emptyFields.some(
          (field) => field?.step.id === step?.id
        )
        if (checking) {
          setEmptyFields([step?.id], ActionsTypeEmptyFields.REMOVE)
        }
      }
    }, [step, emptyFields, setEmptyFields])

    useEffect(() => {
      setIsPopoverOpened(openedStepId === step.id)
    }, [openedStepId, step.id])

    const handleModalClose = useCallback(() => {
      const updatedStep = { ...step }
      updateStep(indices, updatedStep)
      onModalClose()
      setIsModalOpen(false)
      setIsEditing(false)
      setIsPopoverOpened(false)
    }, [indices, step, onModalClose, updateStep])

    const handleKeyUp = useCallback(
      (content: TextBubbleContent) => {
        const updatedStep = { ...step, content } as Step
        updateStep(indices, updatedStep)
      },
      [indices, step, updateStep]
    )

    const handleCloseEditor = useCallback(() => {
      setIsEditing(false)
      setIsModalOpen(false)
      setIsPopoverOpened(false)
    }, [])

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        setFocusedBlockId(step.blockId)
        e.stopPropagation()
        if (isTextBubbleStep(step) || isOctaBubbleStep(step)) setIsEditing(true)
        else setIsModalOpen(true)
        setOpenedStepId(step.id)
      },
      [step, setFocusedBlockId, setOpenedStepId]
    )

    const handleStepUpdate = useCallback(
      (updates: Partial<Step>): void => {
        const updatedStep = { ...step, ...updates }
        updateStep(indices, updatedStep)
      },
      [indices, step, updateStep]
    )

    const hasErrorMessage = useCallback(() => {
      return validationMessages?.some(
        (s) => s.type === VALIDATION_MESSAGE_TYPE.WARNING
      )
    }, [validationMessages])

    return isEditing && (isTextBubbleStep(step) || isOctaBubbleStep(step)) ? (
      <TextBubbleEditor
        initialValue={step.content.richText}
        onClose={handleCloseEditor}
        onKeyUp={handleKeyUp}
        menuPosition="absolute"
      />
    ) : (
      <StepNodeContext.Provider value={{ setIsPopoverOpened }}>
        <ContextMenu<HTMLDivElement>
          renderMenu={() => <StepNodeContextMenu indices={indices} />}
        >
          {(ref, isOpened) => (
            <Popover
              placement="left"
              isLazy
              isOpen={isPopoverOpened}
              closeOnBlur={false}
            >
              <PopoverTrigger>
                <Flex
                  pos="relative"
                  ref={setMultipleRefs([ref, stepRef])}
                  onClick={handleClick}
                  data-testid={`step`}
                  w="full"
                  direction="column"
                >
                  <Stack spacing={2}>
                    <BlockStack
                      isOpened={isOpened}
                      isPreviewing={isPreviewing}
                      style={{
                        border: 'solid 2px',
                        borderColor: hasErrorMessage() ? colors.red[400] : '',
                      }}
                    >
                      <Stack spacing={2} w="full">
                        <HStack fontSize={'14px'}>
                          <StepIcon
                            type={step.type}
                            mt="1"
                            data-testid={`${step.id}-icon`}
                          />
                          <StepTypeLabel
                            type={step.type}
                            data-testid={`${step.id}-icon`}
                          />
                          <Spacer />
                          {unreachableNode && showWarning && (
                            <>
                              <OctaTooltip
                                element={<WarningIcon color={'#FAC300'} />}
                                contentText={
                                  'Atenção! Essa ação não será executada pois o bot já encerrou ou foi direcionado anteriormente'
                                }
                                tooltipPlacement={'auto'}
                                popoverColor="#FFE894"
                                textColor="#574B24"
                                duration={3000}
                              />
                            </>
                          )}
                          {!unreachableNode &&
                            showWarning &&
                            validationMessages?.map((s, index) => {
                              return (
                                <OctaTooltip
                                  key={index}
                                  element={
                                    <ErrorIcon
                                      size={20}
                                      color={colors.red[400]}
                                    />
                                  }
                                  contentText={s.message.join(' | ')}
                                  tooltipPlacement={'auto'}
                                  popoverColor={
                                    s.type === VALIDATION_MESSAGE_TYPE.ERROR
                                      ? '#FBD9D0'
                                      : '#FFE894'
                                  }
                                  textColor={
                                    s.type === VALIDATION_MESSAGE_TYPE.ERROR
                                      ? '#5B332E'
                                      : '#574B24'
                                  }
                                  duration={3000}
                                />
                              )
                            })}
                        </HStack>
                        {step.type !== 'start' && (
                          <span>
                            <OctaDivider />
                            <StepNodeContent step={step} indices={indices} />
                          </span>
                        )}
                        <TargetEndpoint
                          pos="absolute"
                          left="-32px"
                          top="19px"
                          stepId={step.id}
                        />
                        {isConnectable && checkisConnectable(step) && (
                          <SourceEndpoint
                            source={{
                              blockId: step.blockId,
                              stepId: step.id,
                            }}
                            pos="absolute"
                            right="-34px"
                            bottom="10px"
                          />
                        )}
                      </Stack>
                    </BlockStack>

                    {step.type === 'assign to team' &&
                      hasStepRedirectCheckAvailability(step) && (
                        <HStack
                          flex="1"
                          userSelect="none"
                          p="2"
                          borderWidth={isOpened || isPreviewing ? '2px' : '1px'}
                          borderColor={
                            isOpened || isPreviewing ? 'blue.400' : 'gray.200'
                          }
                          margin={isOpened || isPreviewing ? '-1px' : 0}
                          rounded="lg"
                          cursor={'pointer'}
                          bgColor="gray.50"
                          align="flex-start"
                          w="full"
                          transition="border-color 0.2s"
                        >
                          <Flex
                            px="2"
                            py="2"
                            borderWidth="1px"
                            borderColor="gray.300"
                            bgColor={'gray.50'}
                            rounded="md"
                            pos="relative"
                            align="center"
                            cursor={'pointer'}
                          >
                            <Text color={'gray.500'}>
                              Sem agentes disponíveis
                            </Text>
                          </Flex>
                          <TargetEndpoint
                            pos="absolute"
                            left="-32px"
                            top="19px"
                            stepId={step.id}
                          />
                          {
                            <SourceEndpoint
                              source={{
                                blockId: step.blockId,
                                stepId: step.id,
                              }}
                              pos="absolute"
                              right="-34px"
                              bottom="10px"
                            />
                          }
                        </HStack>
                      )}
                  </Stack>
                </Flex>
              </PopoverTrigger>
              <SettingsModal
                id="settings-modal"
                isOpen={isModalOpen}
                onClose={handleModalClose}
                stepType={step.type}
              >
                <StepSettings step={step} onStepChange={handleStepUpdate} />
              </SettingsModal>
            </Popover>
          )}
        </ContextMenu>
      </StepNodeContext.Provider>
    )
  },
  (prevProps, nextProps) => {
    if (!prevProps?.step || !nextProps?.step) return false

    const prevContent =
      isTextBubbleStep(prevProps?.step) || isOctaBubbleStep(prevProps?.step)
        ? prevProps?.step?.content
        : null
    const nextContent =
      isTextBubbleStep(nextProps?.step) || isOctaBubbleStep(nextProps?.step)
        ? nextProps?.step?.content
        : null

    const contentChanged =
      prevContent && nextContent
        ? prevContent?.plainText !== nextContent?.plainText ||
          prevContent?.richText !== nextContent?.richText
        : prevContent !== nextContent

    return (
      prevProps?.step?.id === nextProps?.step?.id &&
      !contentChanged &&
      JSON.stringify(prevProps?.step?.options) ===
        JSON.stringify(nextProps?.step?.options) &&
      prevProps?.isConnectable === nextProps?.isConnectable &&
      prevProps?.indices?.stepIndex === nextProps?.indices?.stepIndex &&
      prevProps?.indices?.blockIndex === nextProps?.indices?.blockIndex &&
      prevProps?.isStartBlock === nextProps?.isStartBlock &&
      prevProps?.unreachableNode === nextProps?.unreachableNode
    )
  }
)
