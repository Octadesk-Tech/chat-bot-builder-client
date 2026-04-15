import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Stack,
  Switch,
  Text,
} from '@chakra-ui/react'
import OctaTooltip from 'components/octaComponents/OctaTooltip/OctaTooltip'
import { DataCollectorOptions, Step, WOZAssignStep } from 'models'
import cuid from 'cuid'
import { RefObject, useEffect } from 'react'
import { MdAdd, MdInfoOutline } from 'react-icons/md'
import CollectorItem from './CollectorItem'
import { cloneDeep } from 'lodash'

const emptyCollector = (): DataCollectorOptions => ({
  id: cuid(),
  context: '',
  target: '',
  variableId: '',
  required: false,
  retries: 0,
})

const DataCollector = ({
  onStepChange,
  stepRef,
}: {
  onStepChange: (step: Partial<Step>) => void
  stepRef: RefObject<WOZAssignStep>
}) => {
  const options = stepRef.current?.options
  const enabled = (options?.collectors?.length ?? 0) > 0
  const collectors = options?.collectors ?? []

  const syncCollectors = (next: DataCollectorOptions[]) => {
    onStepChange({
      options: {
        ...stepRef.current?.options,
        collectors: next,
      },
    } as Partial<Step>)
  }

  const handleToggleEnabled = (checked: boolean) => {
    if (!checked) {
      onStepChange({
        options: {
          ...stepRef.current?.options,
          collectors: [],
        },
      } as Partial<Step>)
      return
    }
    if (checked && collectors.length === 0) {
      const first = emptyCollector()
      onStepChange({
        options: {
          ...stepRef.current?.options,
          collectors: [first],
        },
      } as Partial<Step>)
      return
    }

    onStepChange({
      options: {
        ...stepRef.current?.options,
      },
    } as Partial<Step>)
  }

  const handleAddCollector = () => {
    const created = emptyCollector()
    syncCollectors([...collectors, created])
  }

  const handleUpdateCollector = (
    id: string,
    partial: Partial<DataCollectorOptions>
  ) => {
    const next = collectors.map((c) => (c.id === id ? { ...c, ...partial } : c))
    syncCollectors(next)
  }

  const handleRemoveCollector = (id: string) => {
    syncCollectors(collectors.filter((c) => c.id !== id))
  }

  useEffect(() => {
    return () => {
      const clonedCollectors = cloneDeep(stepRef.current?.options?.collectors)

      const next = clonedCollectors?.filter((c) => {
        const hasAllFieldsFilled = !!c.context && !!c.target && !!c.variableId
        if (c.required) {
          return hasAllFieldsFilled
        }
        return hasAllFieldsFilled && c.retries > 0
      })
      syncCollectors(next ?? [])
    }
  }, [])

  return (
    <Box bg="white">
      <HStack justify="space-between" align="flex-start" mb={enabled ? 4 : 0}>
        <HStack spacing={2} align="center" flex={1}>
          <Text fontWeight="bold" fontSize="sm" color="gray.800">
            Informações para Coleta Automática
          </Text>
          <OctaTooltip
            element={<MdInfoOutline />}
            contentText="Habilite para que a IA extraia dados específicos durante a conversa e os salve em campos do sistema. Ao definir um contexto, você garante que a IA só tente coletar a informação no momento certo da conversa.
Importante: defina apenas uma informação específica para ser capturada por campo configurado."
            tooltipPlacement="auto"
            popoverColor="#303243"
            textColor="#F4F4F5"
            popoverBody={{ maxWidth: '340px' }}
            contentWithElements={
              <Text fontSize="sm">
                Habilite para que a IA extraia dados específicos durante a
                conversa e os salve em campos do sistema. Ao definir um
                contexto, você garante que a IA só tente coletar a informação no
                momento certo da conversa. <br />
                <br />
                <b>Importante:</b> defina apenas uma informação específica para
                ser capturada por campo configurado.
              </Text>
            }
          />
        </HStack>
        <Switch
          colorScheme="blue"
          isChecked={enabled}
          onChange={(e) => handleToggleEnabled(e.target.checked)}
        />
      </HStack>

      {enabled && (
        <Stack spacing={4}>
          {collectors.map((collector) => {
            return (
              <CollectorItem
                key={collector.id}
                collector={collector}
                onUpdate={(partial) =>
                  handleUpdateCollector(collector.id, partial)
                }
                isFirst={collector.id === collectors[0].id}
                onRemove={() => handleRemoveCollector(collector.id)}
              />
            )
          })}

          <Flex justify="center">
            <Button
              leftIcon={<Icon as={MdAdd} boxSize={5} />}
              onClick={handleAddCollector}
              variant="outline"
              size="md"
              color="#1366C9"
              borderColor="#1366C9"
              borderWidth="2px"
              fontSize="sm"
              _hover={{ bg: '#1366C9', color: 'white' }}
            >
              Adicionar campo para coleta
            </Button>
          </Flex>
        </Stack>
      )}
    </Box>
  )
}

export default DataCollector
