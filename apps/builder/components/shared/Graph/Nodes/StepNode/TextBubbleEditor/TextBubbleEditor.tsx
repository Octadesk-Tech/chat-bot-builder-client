import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Flex, Stack, useOutsideClick, Text } from '@chakra-ui/react'
import {
  Plate,
  PlateEditor,
  serializeHtml,
  TEditor,
  TElement,
  Value,
  withPlate,
} from '@udecode/plate-core'
import { editorStyle, platePlugins, platePluginsWithoutBold } from 'libs/plate'
import {
  BaseEditor,
  BaseSelection,
  createEditor,
  Editor,
  Node,
  Transforms,
} from 'slate'
import { ReactEditor } from 'slate-react'
import { defaultTextBubbleContent, TextBubbleContent, Variable } from 'models'
import { parseHtmlStringToPlainText } from 'services/utils'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { ToolBar } from './ToolBar'
import DOMPurify from 'dompurify'
import { textBubbleEditorConfig } from 'config/dompurify'

type TextBubbleEditorProps = {
  initialValue: TElement[]
  onClose: (newContent: TextBubbleContent) => void
  onKeyUp?: (newContent: TextBubbleContent) => void
  increment?: number
  maxLength?: number
  maxLengthMessage?: string
  required?: boolean | { errorMsg?: string }
  menuPosition?: 'absolute' | 'fixed'
  wabaHeader?: boolean
  placeholder?: string
}

export const TextBubbleEditor = ({
  initialValue,
  onClose,
  onKeyUp,
  increment,
  maxLength,
  maxLengthMessage,
  required,
  menuPosition = 'fixed',
  wabaHeader,
  placeholder,
}: TextBubbleEditorProps) => {
  const initialValueRef = useRef(initialValue)
  const [focus, setFocus] = useState(false)
  const [isLimitExceeded, setIsLimitExceeded] = useState(false)

  const [isVariableDropdownOpen, setIsVariableDropdownOpen] = useState(false)
  const varDropdownRef = useRef<HTMLDivElement | null>(null)
  const rememberedSelection = useRef<BaseSelection | null>(null)
  const textEditorRef = useRef<HTMLDivElement>(null)

  const currentValueRef = useRef<TElement[]>(initialValueRef.current)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasShownLimitMessage = useRef(false)

  const editorId = useRef(
    `text-bubble-editor-${increment ?? ''}-${Date.now()}`
  ).current

  const editor = useMemo(() => {
    const plateEditor = withPlate(createEditor() as TEditor<Value>, {
      id: editorId,
      plugins: wabaHeader ? platePluginsWithoutBold : platePlugins,
    }) as PlateEditor

    return plateEditor
  }, [editorId, wabaHeader])
  const closeEditor = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    const sanitizedVal = currentValueRef.current.map((node: TElement) => {
      const sanitizedChildren = node.children?.map((child: any) => {
        if (child?.text) {
          return { ...child, text: sanitizeText(child.text) }
        }
        return child
      })
      return { ...node, children: sanitizedChildren }
    })

    if (onClose) onClose(convertValueToStepContent(sanitizedVal))
  }

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  useOutsideClick({
    ref: textEditorRef,
    handler: (event) => {
      const target = event.target as HTMLElement
      if (varDropdownRef.current?.contains(target)) return
      if (target.closest('[data-create-variable-modal]')) return
      closeEditor()
    },
  })

  const convertValueToStepContent = (v: TElement[]): TextBubbleContent => {
    if (v.length === 0) defaultTextBubbleContent
    const html = serializeHtml(editor, {
      nodes: v,
    }).replace(/<[^/>]*>\s*<\/[^>]*>/g, '')

    return {
      html,
      richText: v,
      plainText: parseHtmlStringToPlainText(html),
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleEmoji = (emoji?: string) => {
    if (!rememberedSelection.current || !emoji) return
    Transforms.select(editor as BaseEditor, rememberedSelection.current)
    Transforms.insertText(editor as BaseEditor, emoji)
    ReactEditor.focus(editor as unknown as ReactEditor)
  }

  const handleVariableSelected = (variable?: Variable) => {
    setIsVariableDropdownOpen(false)
    if (!rememberedSelection.current || !variable) return
    Transforms.select(editor as BaseEditor, rememberedSelection.current)
    Transforms.insertText(editor as BaseEditor, '{{' + variable.token + '}}')
    ReactEditor.focus(editor as unknown as ReactEditor)
  }

  const sanitizeText = useCallback((text: string): string => {
    if (!text) return text

    const hasVariables = text.includes('{{') && text.includes('}}')
    let processedText = text

    if (hasVariables) {
      processedText = text
        .replace(/{{/g, '&lcub;&lcub;')
        .replace(/}}/g, '&rcub;&rcub;')
    }

    const clean = DOMPurify.sanitize(processedText, textBubbleEditorConfig)

    if (hasVariables) {
      return clean
        .replace(/&lcub;&lcub;/g, '{{')
        .replace(/&rcub;&rcub;/g, '}}')
    }

    return clean
  }, [])

  const handleChangeEditorContent = useCallback((val: TElement[]) => {
    currentValueRef.current = val

    if (maxLength) {
      const plainText = val.map((node: TElement) => Node.string(node)).join('')
      if (plainText.length > maxLength) {
        const truncatedText = plainText.slice(0, maxLength)

        setTimeout(() => {
          try {
            const truncatedValue: TElement[] = [
              {
                type: 'p',
                children: [{ text: truncatedText }],
              } as TElement,
            ]

            Editor.withoutNormalizing(editor as BaseEditor, () => {
              while (editor.children.length > 0) {
                Transforms.removeNodes(editor as BaseEditor, { at: [0] })
              }
              Transforms.insertNodes(editor as BaseEditor, truncatedValue, { at: [0] })
            })

            currentValueRef.current = truncatedValue

            const truncatedContent: TextBubbleContent = {
              html: `<p>${truncatedText}</p>`,
              richText: truncatedValue,
              plainText: truncatedText,
            }

            if (onKeyUp) {
              onKeyUp(truncatedContent)
            }

            requestAnimationFrame(() => {
              try {
                const textLength = Node.string(editor.children[0]).length
                Transforms.select(editor as BaseEditor, {
                  anchor: { path: [0, 0], offset: textLength },
                  focus: { path: [0, 0], offset: textLength },
                })
              } catch { }
            })
          } catch (e) {
            console.warn('Error truncating text:', e)
          }
        }, 0)

        return
      }

      // Mostrar mensaje solo cuando se alcanza exactamente el límite (una vez)
      if (plainText.length === maxLength && !hasShownLimitMessage.current) {
        hasShownLimitMessage.current = true
        setIsLimitExceeded(true)
      }

      // Ocultar mensaje y resetear cuando el texto está por debajo del límite
      if (plainText.length < maxLength) {
        hasShownLimitMessage.current = false
        setIsLimitExceeded(false)
      }
    }

    if (isVariableDropdownOpen) {
      setIsVariableDropdownOpen(false)
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      if (onKeyUp) {
        onKeyUp(convertValueToStepContent(currentValueRef.current))
      }
    }, 500)
  }, [maxLength, isVariableDropdownOpen, onKeyUp, editor])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.shiftKey) return
    if (e.key === 'Enter') closeEditor()
  }

  const checkRequiredField = () => {
    return (required && isEditorEmpty() && !focus)
  }

  const chooseBorderColor = () => {
    if (isLimitExceeded) {
      return 'red.400'
    }
    if (checkRequiredField()) {
      return 'red.400'
    }
    if (focus) return 'blue.400'

    return 'grey.400'
  }

  const isEditorEmpty = () => {
    const currentVal = currentValueRef.current
    return currentVal.length <= 1 &&
      currentVal[0]?.children?.every((c: { text?: string }) => {
        return c?.text?.trim().length === 0
      })
  }

  return (
    <>
      <Stack
        flex="1"
        borderColor={chooseBorderColor()}
        ref={textEditorRef}
        borderWidth="2px"
        rounded="md"
        onMouseDown={handleMouseDown}
        pos="relative"
        spacing={0}
        cursor="text"
        onFocus={() => {
          setFocus(true)
        }}
        onBlur={() => {
          setFocus(false)
        }}
        transition="border-color 0.2s ease-in-out"
      >
        <ToolBar
          editor={editor}
          onVariablesButtonClick={(showDialog) => {
            setIsVariableDropdownOpen(showDialog)
          }}
          onEmojiSelected={handleEmoji}
          wabaHeader={wabaHeader}
        />
        <Flex pos="relative" flex="1" overflow="hidden" w="100%">
          <Plate
            id={editorId}
            editableProps={{
              style: editorStyle,
              autoFocus: true,
              'aria-label': 'Text editor',
              onBlur: () => {
                rememberedSelection.current = editor.selection
              },
              onKeyDown: handleKeyDown,
            }}
            initialValue={
              initialValue.length === 0
                ? [{ type: 'p', children: [{ text: '' }] }]
                : initialValue
            }
            onChange={handleChangeEditorContent}
            editor={editor}
          />
          {placeholder && isEditorEmpty() && !focus && (
            <Text
              pos="absolute"
              top="1rem"
              left="1rem"
              color="gray.400"
              pointerEvents="none"
              userSelect="none"
            >
              {placeholder}
            </Text>
          )}
        </Flex>
        {isVariableDropdownOpen && (
          <Flex
            pos="absolute"
            ref={varDropdownRef}
            shadow="lg"
            rounded="md"
            bgColor="white"
            w="100%"
            zIndex={10}
          >
            <VariableSearchInput
              onSelectVariable={handleVariableSelected}
              placeholder="Pesquise sua variável"
              handleOutsideClick={() => setIsVariableDropdownOpen(false)}
              isSaveContext={false}
              labelDefault={'Selecione uma variável:'}
              menuPosition={menuPosition}
            />
          </Flex>
        )}
      </Stack>
      {isLimitExceeded && maxLength && (
        <Flex
          color="red.500"
          fontSize="xs"
          mt={2}
          alignItems="center"
          gap={1}
        >
          <Text>
            {maxLengthMessage || `Limite de ${maxLength} caracteres atingido`}
          </Text>
        </Flex>
      )}
      {checkRequiredField() && (
        <Flex color="red.400" fontSize="xs" mt={2}>
          {typeof required === 'object'
            ? required?.errorMsg
            : 'Este campo é obrigatório'}
        </Flex>
      )}
    </>
  )
}
