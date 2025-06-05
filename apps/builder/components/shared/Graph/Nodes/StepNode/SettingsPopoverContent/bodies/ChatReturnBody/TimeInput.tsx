import { FormControl, FormErrorMessage, Input, InputProps } from '@chakra-ui/react'

interface TimeLimitInputProps extends InputProps {
  title: string,
  usedChar: number,
  totalChar: number,
  errorMessage?: string
}

export const TimeLimitInput = ({errorMessage, title, ...props}: TimeLimitInputProps) => {

  return (
    <FormControl isRequired isInvalid={!!errorMessage}>
      <Input {... props} />
      
      {errorMessage && (
        <FormErrorMessage>
          {errorMessage}
        </FormErrorMessage>
      )}

    </FormControl>
  )
}
