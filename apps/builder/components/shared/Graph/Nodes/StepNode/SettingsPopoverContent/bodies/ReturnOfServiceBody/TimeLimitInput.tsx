import { Box, FormControl, FormErrorMessage, FormLabel, HStack, Input } from '@chakra-ui/react'
import { TimeType, TimeTypeValue } from 'models'
import { ChangeEvent, useEffect, useState } from 'react'
import { TimeTypeInput } from './TimeTypeInput'

type TimeLimitProps = {
  time: string;
  setTime: React.Dispatch<React.SetStateAction<string>>;
  timeType: TimeType;
  setTimeType: React.Dispatch<React.SetStateAction<TimeType>>;
  typeOptions: {value: string, label: string}[]
  setValidationError: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TimeLimitInput = ({time, setTime, timeType, setTimeType, typeOptions, setValidationError}: TimeLimitProps) => {
  const [errorMessage, setErrorMessage] = useState<string>()
  const [didTimeChange, setDidTimeChange] = useState(false)
  const [didTimeTypeChange, setDidTimeTypeChange] = useState(false)

  const minTimeAllowed = 1
  const maxTimeAllowed = {
    [TimeTypeValue.MINUTE]: 10080,
    [TimeTypeValue.HOUR]: 168,
  }

  const invalidTimeMessage = {
    [TimeTypeValue.MINUTE]: `Para minutos, o valor inserido deve ser entre ${minTimeAllowed} e ${maxTimeAllowed[TimeTypeValue.MINUTE]}`,
    [TimeTypeValue.HOUR]: `Para horas, o valor inserido deve ser entre ${minTimeAllowed} e ${maxTimeAllowed[TimeTypeValue.HOUR]}`,
  }

  useEffect(() => {
    if(time === '' && !didTimeChange) return
    validateTime(time)
  }, [])

  useEffect(() => {
    if(!didTimeTypeChange) return
    
    const maxTime = maxTimeAllowed[timeType.value]
    const maxTimeStr = String(maxTime)
    const timeAsNumber = Number(time)

    if (timeAsNumber > maxTime) {
      setTime(maxTimeStr)
      validateTime(maxTimeStr)
      return
    }
    
    time && validateTime(time)
  }, [timeType.value])

  const validateTime = (value: string) => {
    setDidTimeChange(true)
    const numberValue = parseInt(value)
    
    
    if (numberValue < minTimeAllowed || numberValue > maxTimeAllowed[timeType.value]) {
      setErrorMessage(invalidTimeMessage[timeType.value])
      setValidationError(true)
      return
    }

    setErrorMessage(undefined)
    setValidationError(false)
  }

  const isValidInput = (value: string) => {
    if (value.length <= 0) return true
    return /\d$/.test(value)
  }

  const handleTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target?.value
    if (!isValidInput(value)) return
    validateTime(value)
    setTime(value)
  }

  const handleTimeTypeChange = (newValue: any) => {
    setDidTimeTypeChange(true)
    setTimeType(newValue)
  }

  return (
    <Box
    display="flex"
    flexDirection="row"
    justifyContent="space-between"
    alignItems="center"
  >
    <FormControl isRequired isInvalid={!!errorMessage}>
      <FormLabel>
        Tempo máximo para ser considerado retorno
      </FormLabel>
      <HStack>
        <Input placeholder="Insira o tempo máximo..." value={time} onChange={handleTimeChange} borderRadius="lg" w="70%"/>
        <Box w="30%">
        <TimeTypeInput onChange={handleTimeTypeChange} defaultValue={typeOptions[0]} options={typeOptions} value={timeType} />
        </Box>
      </HStack>
      {errorMessage && (
      <FormErrorMessage>
        {errorMessage}
      </FormErrorMessage>
      )}
    </FormControl>
  
  </Box>
  )
}
