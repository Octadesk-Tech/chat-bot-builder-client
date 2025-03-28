import { HStack, Stack, Switch, Text } from '@chakra-ui/react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import OctaTooltip from 'components/octaComponents/OctaTooltip/OctaTooltip'
import React, { Fragment } from 'react'
import { MdInfoOutline } from 'react-icons/md'

const WozQtdAttemptsSelect = ({
  onChange,
  selectedValue,
}: {
  onChange: Function
  selectedValue: number
}) => {
  const options = [
    { key: 1, value: 1, label: '1' },
    { key: 2, value: 2, label: '2' },
    { key: 3, value: 3, label: '3' },
    { key: 4, value: 4, label: '4' },
    { key: 5, value: 5, label: '5' },
  ]

  const onSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qtdAttemptsOnSwitch = e.target.checked ? 3 : null

    onChange(qtdAttemptsOnSwitch)
  }

  return (
    <Stack>
      <HStack justifyContent="space-between">
        <HStack>
          <Text as="span">Direcionar após tentativas de respostas</Text>
          <OctaTooltip
            element={<MdInfoOutline />}
            contentText={`Se o WOZ não souber responder, ele irá direcionar o atendimento automaticamente após a quantidade de tentativas selecionadas. `}
            contentLink={'Saiba mais.'}
            hrefUrl="https://help.octadesk.com/kb/article/como-configurar-o-woz-agente"
            tooltipPlacement={'auto'}
            popoverColor="#303243"
            textColor="#F4F4F5"
            popoverBody={{ maxWidth: '350px' }}
            contentWithElements={
              <Fragment>
                <Text>
                  Se o WOZ não souber responder, ele irá direcionar o
                  atendimento automaticamente após a quantidade de tentativas
                  selecionadas.{' '}
                  <a
                    href="https://help.octadesk.com/kb/article/como-configurar-o-woz-agente"
                    target="_blank"
                    style={{ textDecoration: 'underline' }}
                  >
                    Saiba mais.
                  </a>
                </Text>
              </Fragment>
            }
          />
        </HStack>

        <Switch
          id="active-attempts"
          isChecked={selectedValue > 0}
          onChange={onSwitch}
        />
      </HStack>

      {selectedValue > 0 && (
        <Fragment>
          <Text>Quantidade de tentativas de resposta antes de direcionar</Text>
          <OctaSelect
            defaultSelected={selectedValue || 3}
            findable
            options={options}
            onChange={(v) => onChange(v)}
          />
        </Fragment>
      )}
    </Stack>
  )
}

export default WozQtdAttemptsSelect
