import { CreateTicketOptions, CreateTicketStep } from 'models'
import React from 'react'
import { TicketConfiguration } from './Accordions/TicketConfiguration'
import { PersonalizedForm } from './Accordions/PersonalizedForm'

type IProps = {
  step: CreateTicketStep,
  onOptionsChange: (options: CreateTicketOptions) => void
}

export const CreateTicket = React.memo(function CreateTicket({
  step,
  onOptionsChange
}: IProps) {
  return (
    <>
      <TicketConfiguration />
      <PersonalizedForm />
    </>
  )
})

