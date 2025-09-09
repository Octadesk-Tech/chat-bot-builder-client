import { Stack, Text } from '@chakra-ui/react'
import {
  ChatReturnOptions,
  ChatReturnStep,
  TimeType,
  TimeTypeValue
} from 'models'
import React from 'react'
import { TimeLimitInput } from './TimeLimitInput'

const typeOptions = [
  {
    value: TimeTypeValue.MINUTE,
    label: 'Minutos',
  },
  {
    value: TimeTypeValue.HOUR,
    label: 'Horas',
  },
]

type ChatReturnBodyProps = {
  step: ChatReturnStep
  onOptionsChange: (options: ChatReturnOptions) => void
}

export const ChatReturnBody = ({
  step,
  onOptionsChange,
}: ChatReturnBodyProps) => {

  const defaultTimeValue = step?.options?.time ? String(step.options.time) : ""
  const defaultTimeTypeValue = typeOptions?.find(option => option.value === step?.options?.timeTypeValue) ?? typeOptions[0]
  const defaultValidationError = step?.options?.validationError ?? false

  const [time, setTime] = React.useState<string>(defaultTimeValue)
  const [timeType, setTimeType] = React.useState<TimeType>(defaultTimeTypeValue)
  const [validationError, setValidationError] = React.useState(defaultValidationError)

  const buildOptions = () => {
    const timeAsNumber = parseInt(time)
    return {time: timeAsNumber, timeTypeValue: timeType.value, validationError}
  }

  React.useEffect(() => {
    const options = buildOptions()
    onOptionsChange(options)
  }, [time, timeType, validationError])

  return (
    <Stack spacing={6}>
      <Text>
        Defina o tempo máximo que o sistema aguardará para atribuir o atendimento ao 
        mesmo usuário da última conversa. Se o tempo for ultrapassado, a conversa será 
        tratada como um novo atendimento.
      </Text>
      <TimeLimitInput
        time={time}
        setTime={setTime}
        timeType={timeType}
        setTimeType={setTimeType}
        typeOptions={typeOptions}
        setValidationError={setValidationError}
      />
    </Stack>
  )
}
