import {
  Box,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  Stack,
  Switch,
  Text,
} from '@chakra-ui/react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import OctaTooltip from 'components/octaComponents/OctaTooltip/OctaTooltip'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { DataCollectorOptions, Variable } from 'models'
import { MdClose, MdInfoOutline } from 'react-icons/md'

const RETRY_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({
  key: n,
  value: n,
  label: String(n),
}))

type Props = {
  collector: DataCollectorOptions
  onUpdate: (partial: Partial<DataCollectorOptions>) => void
  onRemove: () => void
  isFirst: boolean
}

const CollectorItem = ({ collector, onUpdate, onRemove, isFirst }: Props) => {
  const handleVariableSelect = (variable: Variable) => {
    onUpdate({ variableId: variable.id })
  }

  return (
    <HStack align="center" justify="center" spacing={2} w="full">
      <Box
        flex={1}
        bg="#F4F4F5"
        p={3}
        borderRadius="md"
        border="1px solid"
        borderColor={collector.required ? '#1366C9' : '#E3E4E8'}
        borderWidth={collector.required ? '2px' : '1px'}
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <FormLabel mb={0} fontSize="sm" fontWeight="bold" color="gray.700">
              Qual contexto da conversa deve buscar essa informação?
            </FormLabel>
            <Input
              size="md"
              bg="white"
              value={collector.context ?? ''}
              onChange={(e) => onUpdate({ context: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder="Ex.: Interesse em comprar ou alugar imóvel"
              _focus={{ boxShadow: 'none' }}
            />
          </Stack>

          <Stack spacing={1}>
            <FormLabel mb={0} fontSize="sm" fontWeight="bold" color="gray.700">
              O que a IA deve buscar?
            </FormLabel>
            <Input
              size="md"
              bg="white"
              value={collector.target ?? ''}
              onChange={(e) => onUpdate({ target: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder="Ex.: Modalidade do imóvel (residencial ou comercial)"
              _focus={{ boxShadow: 'none' }}
            />
          </Stack>

          <Stack spacing={1}>
            <Box onClick={(e) => e.stopPropagation()}>
              <VariableSearchInput
                labelDefault="Onde salvar essa informação?"
                initialVariableId={collector.variableId}
                onSelectVariable={handleVariableSelect}
                placeholder="Selecione ou crie uma variável"
                bg="white"
                size="md"
                borderWidth="1px"
              />
            </Box>
          </Stack>

          {!collector.required && (
            <Stack spacing={1}>
              <FormLabel
                mb={0}
                fontSize="sm"
                fontWeight="bold"
                color="gray.700"
              >
                Quantidade de tentativas de buscar a resposta
              </FormLabel>
              <Box onClick={(e) => e.stopPropagation()}>
                <OctaSelect
                  backgroundColor="white"
                  defaultSelected={collector.retries ?? null}
                  placeholder="Selecione..."
                  options={RETRY_OPTIONS}
                  onChange={(v: number) => onUpdate({ retries: v })}
                />
              </Box>
            </Stack>
          )}

          <HStack
            justify="space-between"
            pt={1}
            onClick={(e) => e.stopPropagation()}
          >
            <HStack spacing={1}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Tornar obrigatório para avançar
              </Text>
              <OctaTooltip
                element={<MdInfoOutline size={18} color="#6B7280" />}
                contentText="Quando ativo, o fluxo só avança após a IA conseguir preencher esta informação a partir da conversa."
                tooltipPlacement="auto"
                popoverColor="#303243"
                textColor="#F4F4F5"
                popoverBody={{ maxWidth: '320px' }}
                contentWithElements={
                  <Text fontSize="sm">
                    Se <b>ativado</b>: O agente não segue os caminhos
                    configurados em “Redirecionamento baseado no assunto da
                    conversa” (inclusive pedidos de transferência ou
                    encerramento) até que esta informação seja capturada.{' '}
                    <b>Dica:</b> use apenas para dados vitais ao processo.
                    <br />
                    <br />
                    Se <b>desativado</b>: O agente tenta coletar a informação
                    conforme o limite definido. Caso não consiga, ele prioriza a
                    continuidade da conversa e flui para os próximos passos.
                  </Text>
                }
              />
            </HStack>
            <Switch
              colorScheme="blue"
              isChecked={collector.required ?? false}
              onChange={(e) => onUpdate({ required: e.target.checked })}
            />
          </HStack>
        </Stack>
      </Box>

      {!isFirst && (
        <IconButton
          aria-label="Remover campo de coleta"
          icon={<Icon as={MdClose} boxSize={5} />}
          variant="ghost"
          size="sm"
          mt={1}
          color="gray.500"
          _hover={{ color: 'blueGray.500', bg: 'blueGray.100' }}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        />
      )}
    </HStack>
  )
}

export default CollectorItem
